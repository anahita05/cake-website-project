import logging
from typing import Any, cast

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db import IntegrityError
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from google.auth.exceptions import TransportError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from cart.services import cart_get_or_create
from .serializers import (
    GoogleLoginInputSerializer,
    LoginInputSerializer,
    MessageOutputSerializer,
    PasswordResetConfirmInputSerializer,
    PasswordResetRequestInputSerializer,
    ProfileUpdateInputSerializer,
    SetPasswordInputSerializer,
    UserOutputSerializer,
    UserRegisterInputSerializer,
)
from .services import (
    GoogleEmailAlreadyRegistered,
    InvalidGoogleCredentialError,
    user_create,
    user_get_or_create_from_google,
    verify_google_credential,
)
from .throttles import (
    GoogleLoginRateThrottle,
    LoginRateThrottle,
    PasswordResetRateThrottle,
    RefreshRateThrottle,
    RegisterRateThrottle,
    SensitiveActionRateThrottle,
)

logger = logging.getLogger(__name__)

User = get_user_model()


# =============================================================================
# Helpers
# =============================================================================

def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str | None = None,
    *,
    refresh_max_age: int | None = None,
) -> Response:
    """Set JWT tokens as HttpOnly cookies on the response.

    ``refresh_max_age=None`` makes the refresh cookie a browser-session cookie.
    """
    jwt_cfg = settings.SIMPLE_JWT
    common = {
        'httponly': jwt_cfg['AUTH_COOKIE_HTTP_ONLY'],
        'secure': jwt_cfg['AUTH_COOKIE_SECURE'],
        'samesite': jwt_cfg['AUTH_COOKIE_SAMESITE'],
    }

    response.set_cookie(
        key=jwt_cfg['AUTH_COOKIE'],
        value=access_token,
        path=jwt_cfg.get('AUTH_COOKIE_PATH', '/'),
        max_age=int(jwt_cfg['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **common,
    )

    if refresh_token is not None:
        response.set_cookie(
            key=jwt_cfg['AUTH_COOKIE_REFRESH'],
            value=refresh_token,
            path=jwt_cfg.get('AUTH_COOKIE_REFRESH_PATH', '/api/auth/'),
            max_age=refresh_max_age,
            **common,
        )
    return response


def clear_auth_cookies(response: Response) -> Response:
    """Delete auth cookies using the same paths used when setting them."""
    jwt_cfg = settings.SIMPLE_JWT
    for key, path in (
        (jwt_cfg['AUTH_COOKIE'], jwt_cfg.get('AUTH_COOKIE_PATH', '/')),
        (
            jwt_cfg['AUTH_COOKIE_REFRESH'],
            jwt_cfg.get('AUTH_COOKIE_REFRESH_PATH', '/api/auth/'),
        ),
    ):
        # Django 6.1 delete_cookie() has no `secure` parameter.
        response.delete_cookie(
            key,
            path=path,
            samesite=jwt_cfg['AUTH_COOKIE_SAMESITE'],
        )
    return response


def _refresh_max_age() -> int:
    return int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())


def _remember_claim(refresh_token: str) -> bool:
    """Whether the session should survive a browser restart.

    Tokens issued before the `remember` claim existed default to persistent,
    which is how they used to behave.

    ``verify=False`` is required: by the time we call this, rotation has
    already blacklisted the old token, and verifying would raise ``TokenError``
    for a token that was perfectly valid one moment ago.
    """
    try:
        payload = RefreshToken(refresh_token, verify=False).payload
    except TokenError:
        return True
    return bool(payload.get('remember', True))


def _revoke_all_refresh_tokens(user) -> None:
    """Blacklist every refresh token issued to this user."""
    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)


# =============================================================================
# Views
# =============================================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    @extend_schema(
        summary="Register new user",
        description="Create a new user account. No authentication required.",
        tags=["Authentication"],
        request=UserRegisterInputSerializer,
        responses={201: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = UserRegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        try:
            user = user_create(**data)
        except IntegrityError:
            # Race between validation and insert (or case-variant duplicates).
            return Response(
                {'error': 'A user with this email or username already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    @extend_schema(
        summary="User Login",
        description=(
            "Authenticate with email and password. Sets JWT tokens as HttpOnly "
            "cookies. Pass remember=true to keep the session across browser "
            "restarts; otherwise the refresh cookie dies when the browser closes."
        ),
        tags=["Authentication"],
        request=LoginInputSerializer,
        responses={200: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        email = data['email']
        password = data['password']
        remember = bool(data.get('remember', False))

        user = authenticate(request=request, email=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cart_get_or_create(user=user)
        update_last_login(None, user)

        refresh = RefreshToken.for_user(user)
        # Stored on the token so rotation keeps the same cookie lifetime.
        refresh['remember'] = remember

        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK
        )
        return set_auth_cookies(
            response,
            str(refresh.access_token),
            str(refresh),
            refresh_max_age=_refresh_max_age() if remember else None,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [GoogleLoginRateThrottle]

    @extend_schema(
        summary="Sign in or sign up with Google",
        description="Verifies a Google ID token and sets JWT cookies",
        tags=["Authentication"],
        request=GoogleLoginInputSerializer,
        responses={200: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = GoogleLoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credential = serializer.validated_data["credential"]

        try:
            claims = verify_google_credential(credential)
        except InvalidGoogleCredentialError:
            return Response(
                {"error": "Invalid Google credential"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except TransportError:
            return Response(
                {"error": "Google verification is temporarily unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        display_name = claims.get("name", "")
        if not isinstance(display_name, str):
            display_name = ""

        try:
            user = user_get_or_create_from_google(
                google_id=claims["sub"],
                email=claims["email"],
                username=display_name,
            )
        except GoogleEmailAlreadyRegistered:
            return Response(
                {
                    "error": (
                        "An account with this email is already registered. "
                        "Please sign in with your password instead."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        except IntegrityError:
            return Response(
                {"error": "Could not create the account due to a data conflict."},
                status=status.HTTP_409_CONFLICT,
            )

        update_last_login(None, user)

        refresh = RefreshToken.for_user(user)
        # The Google flow has no "remember me" checkbox, so stay signed in.
        refresh['remember'] = True

        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK,
        )
        return set_auth_cookies(
            response,
            str(refresh.access_token),
            str(refresh),
            refresh_max_age=_refresh_max_age(),
        )


class RefreshView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RefreshRateThrottle]
    serializer_class = UserOutputSerializer

    @extend_schema(
        summary="Refresh access token",
        description=(
            "Reads the HttpOnly refresh_token cookie, rotates it, and issues "
            "new access/refresh cookies."
        ),
        tags=["Authentication"],
        request=None,
        responses={200: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh_token:
            return Response(
                {'error': 'Refresh token cookie is missing.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except AuthenticationFailed as exc:
            return Response(
                {'error': str(exc.detail)},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            # Programming/DB errors must not masquerade as auth failures.
            logger.exception("Refresh failed unexpectedly")
            return Response(
                {'error': 'Could not refresh session.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        data = serializer.validated_data
        claim = settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'user_id')
        user_id = AccessToken(data['access']).payload.get(claim)
        user = User.objects.filter(pk=user_id, is_active=True).first()
        if user is None:
            return Response(
                {'error': 'Account is no longer active.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK,
        )
        return set_auth_cookies(
            response,
            data['access'],
            data.get('refresh'),
            refresh_max_age=(
                _refresh_max_age() if _remember_claim(refresh_token) else None
            ),
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]
    serializer_class = MessageOutputSerializer

    @extend_schema(
        summary="User Logout",
        description=(
            "Revokes the refresh token when present and clears the JWT cookies. "
            "Works even when the access token has already expired."
        ),
        tags=["Authentication"],
        request=None,
        responses={200: MessageOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                # Already expired/invalid: still clear the cookies.
                pass

        response = Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )
        return clear_auth_cookies(response)


class SetPasswordView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [SensitiveActionRateThrottle]

    @extend_schema(
        summary="Set or change password",
        description=(
            "Sets a password for accounts created through Google (no current "
            "password needed) or changes an existing password (current password "
            "required). All sessions are revoked afterwards."
        ),
        tags=["Authentication"],
        request=SetPasswordInputSerializer,
        responses={200: MessageOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = SetPasswordInputSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        _revoke_all_refresh_tokens(user)

        response = Response(
            {'message': 'Password updated. Please sign in again.'},
            status=status.HTTP_200_OK,
        )
        return clear_auth_cookies(response)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    @extend_schema(
        summary="Request a password reset link",
        description=(
            "Emails a reset link when the address belongs to an active account. "
            "Always returns the same message so accounts cannot be enumerated."
        ),
        tags=["Authentication"],
        request=PasswordResetRequestInputSerializer,
        responses={200: MessageOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordResetRequestInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password"
                f"?uid={uid}&token={token}"
            )
            try:
                send_mail(
                    "Reset your Cake Shop password",
                    (
                        "Open this link to choose a new password:\n\n"
                        f"{reset_url}\n\n"
                        "If you did not ask for this, you can ignore this email."
                    ),
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                )
            except Exception:
                # Never leak delivery problems to the caller.
                logger.exception("Could not send password reset email")

        return Response(
            {'message': 'If that email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    @extend_schema(
        summary="Set a new password from a reset link",
        description="Validates the emailed uid/token pair and sets a new password.",
        tags=["Authentication"],
        request=PasswordResetConfirmInputSerializer,
        responses={200: MessageOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = PasswordResetConfirmInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(pk=urlsafe_base64_decode(data['uid']).decode())
        except (ValueError, TypeError, UnicodeDecodeError, DjangoValidationError):
            return Response(
                {'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, data['token']):
            return Response(
                {'error': 'Invalid or expired reset link.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(data['password'], user=user)
        except DjangoValidationError as exc:
            return Response(
                {'password': list(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data['password'])
        user.save(update_fields=['password'])
        _revoke_all_refresh_tokens(user)

        return Response(
            {'message': 'Password updated. Please sign in.'},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get current user",
        description="Returns the currently authenticated user's profile data.",
        tags=["Authentication"],
        responses={200: UserOutputSerializer},
    )
    def get(self, request: Request) -> Response:
        return Response(
            UserOutputSerializer(request.user).data,
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Update current user",
        description=(
            "Update the profile fields phone_number, first_name and last_name. "
            "Email and username cannot be changed here."
        ),
        tags=["Authentication"],
        request=ProfileUpdateInputSerializer,
        responses={200: UserOutputSerializer},
    )
    def patch(self, request: Request) -> Response:
        serializer = ProfileUpdateInputSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
        except IntegrityError:
            return Response(
                {'phone_number': ['This phone number is already in use.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            UserOutputSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )
