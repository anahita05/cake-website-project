from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CustomJWTAuthentication(JWTAuthentication):
    """Authenticate via HttpOnly cookie, falling back to Authorization header.

    Reads the access token from the ``access_token`` cookie first (browser
    flow). If no cookie is present, falls back to the standard
    ``Authorization: Bearer <token>`` header so API clients / Swagger work.
    Invalid or expired cookie tokens raise 401 instead of silently passing
    as anonymous (which previously surfaced as a confusing 403).
    """

    def authenticate(self, request):
        # 1) Standard header flow (drf-simplejwt default).
        header_result = super().authenticate(request)
        if header_result is not None:
            return header_result

        # 2) Cookie flow (browser flow used by the frontend).
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])

        # Missing or empty cookie means anonymous. After logout Django writes an
        # empty cookie; raising here would break /login/ and /register/ too.
        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
        except InvalidToken as exc:
            raise AuthenticationFailed('Invalid or expired access token.') from exc
        return self.get_user(validated_token), validated_token


class CookieJWTScheme(OpenApiAuthenticationExtension):
    """Document cookie + bearer auth so drf-spectacular stops warning."""

    target_class = 'accounts.authentication.CustomJWTAuthentication'
    name = 'cookieAuth'
    match_subclasses = True

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': settings.SIMPLE_JWT['AUTH_COOKIE'],
            'description': (
                'HttpOnly access_token cookie set by POST /api/auth/login/. '
                'Alternatively send Authorization: Bearer <token>.'
            ),
        }

