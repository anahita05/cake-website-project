from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class GoogleLoginRateThrottle(AnonRateThrottle):
    scope = "google"


class RefreshRateThrottle(AnonRateThrottle):
    scope = "refresh"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"
