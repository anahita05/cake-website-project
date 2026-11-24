import logging
from typing import Any, cast

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.db import IntegrityError
from drf_spectacular.utils import extend_schema
from google.auth.exceptions import TransportError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from cart.services import cart_get_or_create
from .serializers import (
    GoogleLoginInputSerializer,
    LoginInputSerializer,
    MessageOutputSerializer,
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
    RefreshRateThrottle,
    RegisterRateThrottle,
)

logger = logging.getLogger(__name__)


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
        description="Authenticate with email and password. Sets JWT tokens as HttpOnly cookies.",
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

        user = authenticate(request=request, email=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cart_get_or_create(user=user)
        update_last_login(None, user)

        refresh = RefreshToken.for_user(user)
        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK
        )
        return set_auth_cookies(
            response,
            str(refresh.access_token),
            str(refresh),
            refresh_max_age=_refresh_max_age(),
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
        user = get_user_model().objects.filter(pk=user_id, is_active=True).first()
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
            refresh_max_age=_refresh_max_age(),
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
