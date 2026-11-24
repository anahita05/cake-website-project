import threading
import time
import uuid

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.db import IntegrityError, transaction
from django.utils.text import slugify
from google.auth import jwt as google_jwt
from google.auth.exceptions import TransportError

from cart.models import Cart

User = get_user_model()

GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}
GOOGLE_CERTS_TTL_SECONDS = 3600
GOOGLE_HTTP_TIMEOUT_SECONDS = 5

_certs_lock = threading.Lock()
_certs_cache: dict = {"data": None, "expires_at": 0.0}


def _google_certs() -> dict:
    """Fetch Google's signing certificates, cached for an hour."""
    now = time.monotonic()
    with _certs_lock:
        if _certs_cache["data"] is None or now >= _certs_cache["expires_at"]:
            try:
                response = requests.get(
                    GOOGLE_CERTS_URL,
                    timeout=GOOGLE_HTTP_TIMEOUT_SECONDS,
                )
                response.raise_for_status()
            except requests.RequestException as exc:
                raise TransportError("Could not fetch Google certificates.") from exc
            _certs_cache["data"] = response.json()
            _certs_cache["expires_at"] = now + GOOGLE_CERTS_TTL_SECONDS
        return _certs_cache["data"]


@transaction.atomic
def user_create(*, email: str, password: str, username: str) -> User:
    # The custom manager lowercases the whole address.
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    # get_or_create guards against double-creation races on Cart.user.
    Cart.objects.get_or_create(user=user)
    return user


class InvalidGoogleCredentialError(Exception):
    pass


def verify_google_credential(credential: str) -> dict:
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise ImproperlyConfigured("GOOGLE_OAUTH_CLIENT_ID is not configured.")

    try:
        claims = google_jwt.decode(
            credential,
            certs=_google_certs(),
            audience=settings.GOOGLE_OAUTH_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError as exc:
        # MalformedError subclasses ValueError; TransportError does not, so
        # transport failures still reach the view's 503 branch.
        raise InvalidGoogleCredentialError from exc

    if claims.get("iss") not in GOOGLE_ISSUERS:
        raise InvalidGoogleCredentialError("Wrong issuer.")
    if claims.get("email_verified") is not True:
        raise InvalidGoogleCredentialError("Email is not verified.")
    if not isinstance(claims.get("sub"), str) or not isinstance(claims.get("email"), str):
        raise InvalidGoogleCredentialError("Missing subject or email.")

    return claims


class GoogleEmailAlreadyRegistered(Exception):
    pass


def user_get_or_create_from_google(
    *, google_id: str, email: str, username: str
) -> User:
    normalized_email = email.strip().lower()

    try:
        with transaction.atomic():
            existing = User.objects.select_for_update().filter(google_id=google_id).first()
            if existing is not None:
                return existing

            email_user = (
                User.objects.select_for_update()
                .filter(email__iexact=normalized_email)
                .first()
            )
            if email_user is not None:
                if not settings.ALLOW_GOOGLE_ACCOUNT_LINKING:
                    raise GoogleEmailAlreadyRegistered()
                if email_user.google_id and email_user.google_id != google_id:
                    raise GoogleEmailAlreadyRegistered()
                # Google verified this email, so linking is safe.
                email_user.google_id = google_id
                email_user.save(update_fields=["google_id"])
                return email_user

            base_username = slugify(username)[:120] or "google_user"
            user = User.objects.create_user(
                username=f"{base_username}_{uuid.uuid4().hex[:12]}",
                email=normalized_email,
                password=None,
                google_id=google_id,
            )
            Cart.objects.get_or_create(user=user)
            return user

    except IntegrityError:
        # Concurrent first login for the same google_id: the other request won.
        existing = User.objects.filter(google_id=google_id).first()
        if existing is not None:
            return existing
        raise
