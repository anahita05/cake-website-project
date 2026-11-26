"""
Django settings for core project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv


# =============================================================================
# PATHS
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_list(name: str, default: str = "") -> list[str]:
    """Parse a comma-separated env var, trimming trailing slashes."""
    return [
        value.strip().rstrip("/")
        for value in os.environ.get(name, default).split(",")
        if value.strip()
    ]


def env_bool(name: str, default: bool) -> bool:
    return os.environ.get(name, str(default)).lower() == "true"


# =============================================================================
# SECURITY
# =============================================================================

# WARNING: keep the secret key used in production secret!
# TODO: move this to an environment variable before deploying
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-change-me"
)

# WARNING: don't run with debug=True in production!
DEBUG = os.environ.get(
    "DEBUG",
    "True"
).lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1,testserver"
    ).split(",")
    if host.strip()
]

GOOGLE_OAUTH_CLIENT_ID = os.environ.get(
    "GOOGLE_OAUTH_CLIENT_ID",
    ""
).strip()

# Google verifies the email before we link it to an existing password account.
ALLOW_GOOGLE_ACCOUNT_LINKING = env_bool("ALLOW_GOOGLE_ACCOUNT_LINKING", True)

# =============================================================================
# APPLICATIONS
# =============================================================================

INSTALLED_APPS = [
    # Django built-ins
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'rest_framework_simplejwt.token_blacklist',
    # Local apps
    'accounts',
    'products',
    'cart',
    'orders',
]


# =============================================================================
# MIDDLEWARE
# =============================================================================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # must be before CommonMiddleware
    'accounts.middleware.ApiOriginCheckMiddleware',  # CSRF guard for cookie auth
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# =============================================================================
# URL / WSGI
# =============================================================================

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'


# =============================================================================
# TEMPLATES
# =============================================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =============================================================================
# DATABASE
# =============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# =============================================================================
# AUTHENTICATION
# =============================================================================

AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# =============================================================================
# INTERNATIONALIZATION
# =============================================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# =============================================================================
# STATIC & MEDIA FILES
# =============================================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.CustomJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        # Product/category endpoints are public, so a low anonymous rate would
        # break normal storefront browsing. Keep it generous; per-endpoint
        # scopes below handle brute-force protection.
        'anon': '1000/hour',
        'user': '1000/hour',
        'login': '5/min',
        'register': '10/hour',
        'google': '10/min',
        'refresh': '30/min',
        'password_reset': '3/hour',
        'sensitive': '10/hour',
    },
}


# =============================================================================
# SIMPLE JWT
# =============================================================================

AUTH_COOKIE_SECURE = env_bool("COOKIE_SECURE", not DEBUG)
AUTH_COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax" if DEBUG else "None")

# Rotation/blacklist require the token_blacklist app (installed above).
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_REFRESH': 'refresh_token',
    # Secure/SameSite=None cookies are rejected over plain HTTP (local dev uses
    # http://localhost / http://127.0.0.1), so only require them in production.
    'AUTH_COOKIE_SECURE': AUTH_COOKIE_SECURE,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': AUTH_COOKIE_SAMESITE,
    'AUTH_COOKIE_PATH': '/',
    # Only sent to refresh/logout, not every API request.
    'AUTH_COOKIE_REFRESH_PATH': '/api/auth/',
}


# =============================================================================
# EMAIL & FRONTEND LINKS
# =============================================================================

# Used to build the password-reset link that is emailed to the user.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# Console backend prints emails to the terminal. Swap this for SMTP in prod.
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@cakeshop.local")

# Password-reset links expire after one hour (Django's default is 3 days).
PASSWORD_RESET_TIMEOUT = int(os.environ.get("PASSWORD_RESET_TIMEOUT", 3600))


# =============================================================================
# CORS
# =============================================================================

CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,'
    'http://localhost:3000,http://127.0.0.1:3000',
)

CSRF_TRUSTED_ORIGINS = env_list(
    'CSRF_TRUSTED_ORIGINS',
    ','.join(CORS_ALLOWED_ORIGINS),
)

CORS_ALLOW_CREDENTIALS = True  # required for cookies to be sent cross-origin


# =============================================================================
# CACHE (throttling; use Redis when running multiple workers)
# =============================================================================

REDIS_URL = os.environ.get('REDIS_URL', '').strip()
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
        }
    }


# =============================================================================
# SPECTACULAR (API DOCUMENTATION)
# =============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'Cake Shop API',
    'DESCRIPTION': 'Backend API for the cake website',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}