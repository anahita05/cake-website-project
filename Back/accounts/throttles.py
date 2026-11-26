from rest_framework.throttling import (
    AnonRateThrottle,
    SimpleRateThrottle,
    UserRateThrottle,
)


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class GoogleLoginRateThrottle(AnonRateThrottle):
    scope = "google"


class RefreshRateThrottle(AnonRateThrottle):
    scope = "refresh"


class PasswordResetRateThrottle(SimpleRateThrottle):
    """Limit by IP whether or not the caller is signed in.

    ``AnonRateThrottle`` skips authenticated users, which would let a logged-in
    account spam reset emails for other addresses.
    """

    scope = "password_reset"

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class SensitiveActionRateThrottle(UserRateThrottle):
    """For authenticated actions that must not be spammed (e.g. set-password)."""

    scope = "sensitive"
