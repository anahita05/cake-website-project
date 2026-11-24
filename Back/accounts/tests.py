from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import override_settings
from google.auth.exceptions import TransportError
from rest_framework.test import APITestCase

from .services import InvalidGoogleCredentialError

User = get_user_model()

REGISTER = "/api/auth/register/"
LOGIN = "/api/auth/login/"
REFRESH = "/api/auth/refresh/"
LOGOUT = "/api/auth/logout/"
ME = "/api/auth/me/"
GOOGLE = "/api/auth/google/"

PASSWORD = "Str0ng-Passw0rd!"
TRUSTED_ORIGIN = "http://localhost:5173"


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}},
    CORS_ALLOWED_ORIGINS=[TRUSTED_ORIGIN],
    CSRF_TRUSTED_ORIGINS=[TRUSTED_ORIGIN],
)
class AuthFlowTests(APITestCase):
    def setUp(self):
        cache.clear()

    def register(self, email="user@example.com", username="User", password=PASSWORD):
        return self.client.post(
            REGISTER,
            {"username": username, "email": email, "password": password},
            format="json",
        )

    def login(self, email="user@example.com", password=PASSWORD):
        return self.client.post(
            LOGIN,
            {"email": email, "password": password},
            format="json",
        )

    # --- identity ---------------------------------------------------------
    def test_register_normalizes_email(self):
        res = self.register(email="  User@Example.COM ")
        self.assertEqual(res.status_code, 201)
        self.assertTrue(User.objects.filter(email="user@example.com").exists())

    def test_register_rejects_case_variant_email(self):
        self.register(email="User@Example.com")
        res = self.register(email="user@example.com", username="Other")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_login_is_case_insensitive(self):
        self.register(email="User@Example.com")
        res = self.login(email="USER@example.COM")
        self.assertEqual(res.status_code, 200)

    def test_register_rejects_duplicate_username(self):
        self.register()
        res = self.register(email="other@example.com", username="User")
        self.assertEqual(res.status_code, 400)
        self.assertIn("username", res.data)

    # --- password policy --------------------------------------------------
    def test_register_rejects_common_password(self):
        res = self.register(password="12345678")
        self.assertEqual(res.status_code, 400)
        self.assertIn("password", res.data)

    # --- session ----------------------------------------------------------
    def test_login_sets_httponly_cookies(self):
        self.register()
        res = self.login()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.cookies["access_token"]["httponly"])
        self.assertTrue(res.cookies["refresh_token"]["httponly"])
        self.assertEqual(res.cookies["refresh_token"]["path"], "/api/auth/")

    def test_me_requires_auth(self):
        self.assertEqual(self.client.get(ME).status_code, 401)

    def test_login_then_me(self):
        self.register()
        self.login()
        self.assertEqual(self.client.get(ME).status_code, 200)

    def test_login_updates_last_login(self):
        self.register()
        self.login()
        self.assertIsNotNone(User.objects.get(email="user@example.com").last_login)

    def test_logout_does_not_break_anonymous_endpoints(self):
        # Logout leaves an empty access_token cookie in the jar; register/login
        # must still work for anonymous visitors.
        self.register()
        self.login()
        self.client.post(LOGOUT)
        res = self.register(email="second@example.com", username="Second")
        self.assertEqual(res.status_code, 201)

    def test_login_rejects_wrong_password(self):
        self.register()
        self.assertEqual(self.login(password="Wrong-Passw0rd!").status_code, 401)

    # --- refresh / logout -------------------------------------------------
    def test_refresh_rotates_and_blacklists_old_token(self):
        self.register()
        self.login()
        old_refresh = self.client.cookies["refresh_token"].value

        res = self.client.post(REFRESH)
        self.assertEqual(res.status_code, 200)
        self.assertNotEqual(self.client.cookies["refresh_token"].value, old_refresh)

        # Replaying the old token must fail.
        self.client.cookies["refresh_token"] = old_refresh
        self.assertEqual(self.client.post(REFRESH).status_code, 401)

    def test_refresh_requires_cookie(self):
        self.assertEqual(self.client.post(REFRESH).status_code, 401)

    def test_refresh_rejects_invalid_token(self):
        self.client.cookies["refresh_token"] = "garbage"
        self.assertEqual(self.client.post(REFRESH).status_code, 401)

    def test_logout_blacklists_refresh_and_clears_cookies(self):
        self.register()
        self.login()
        refresh_value = self.client.cookies["refresh_token"].value

        res = self.client.post(LOGOUT)
        self.assertEqual(res.status_code, 200)
        # Deletion is expressed as max-age=0, not by removing the jar entry.
        self.assertIn("refresh_token", res.cookies)
        self.assertEqual(int(res.cookies["refresh_token"]["max-age"]), 0)

        self.client.cookies["refresh_token"] = refresh_value
        self.assertEqual(self.client.post(REFRESH).status_code, 401)

    def test_logout_works_without_access_token(self):
        self.client.cookies["refresh_token"] = "garbage"
        self.assertEqual(self.client.post(LOGOUT).status_code, 200)

    # --- CSRF origin gate --------------------------------------------------
    def test_untrusted_origin_is_rejected(self):
        res = self.client.post(LOGOUT, HTTP_ORIGIN="https://evil.example")
        self.assertEqual(res.status_code, 403)

    def test_trusted_origin_is_allowed(self):
        res = self.client.post(LOGOUT, HTTP_ORIGIN=TRUSTED_ORIGIN)
        self.assertEqual(res.status_code, 200)

    def test_cross_site_fetch_metadata_is_rejected(self):
        res = self.client.post(LOGOUT, HTTP_SEC_FETCH_SITE="cross-site")
        self.assertEqual(res.status_code, 403)

    def test_form_post_without_origin_is_rejected(self):
        res = self.client.post(LOGOUT, content_type="application/x-www-form-urlencoded")
        self.assertEqual(res.status_code, 403)

    # --- Google -----------------------------------------------------------
    @patch("accounts.views.verify_google_credential")
    def test_google_invalid_credential(self, verify):
        verify.side_effect = InvalidGoogleCredentialError()
        res = self.client.post(GOOGLE, {"credential": "bad"}, format="json")
        self.assertEqual(res.status_code, 401)

    @patch("accounts.views.verify_google_credential")
    def test_google_transport_error(self, verify):
        verify.side_effect = TransportError("down")
        res = self.client.post(GOOGLE, {"credential": "bad"}, format="json")
        self.assertEqual(res.status_code, 503)

    @patch("accounts.views.verify_google_credential")
    def test_google_new_user(self, verify):
        verify.return_value = {
            "sub": "g-1",
            "email": "GUser@Example.com",
            "email_verified": True,
            "name": "G User",
        }
        res = self.client.post(GOOGLE, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(
            User.objects.filter(email="guser@example.com", google_id="g-1").exists()
        )

    @patch("accounts.views.verify_google_credential")
    def test_google_links_existing_verified_email(self, verify):
        self.register(email="user@example.com")
        verify.return_value = {
            "sub": "g-1",
            "email": "user@example.com",
            "email_verified": True,
            "name": "User",
        }
        res = self.client.post(GOOGLE, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            User.objects.get(email="user@example.com").google_id,
            "g-1",
        )

    @patch("accounts.views.verify_google_credential")
    def test_google_rejects_email_bound_to_other_google_id(self, verify):
        self.register(email="user@example.com")
        User.objects.filter(email="user@example.com").update(google_id="g-other")
        verify.return_value = {
            "sub": "g-1",
            "email": "user@example.com",
            "email_verified": True,
            "name": "User",
        }
        res = self.client.post(GOOGLE, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, 409)

    # --- inactive users ----------------------------------------------------
    def test_login_rejects_inactive_user(self):
        self.register()
        User.objects.filter(email="user@example.com").update(is_active=False)
        self.assertEqual(self.login().status_code, 401)

    def test_refresh_rejects_deactivated_user(self):
        self.register()
        self.login()
        User.objects.filter(email="user@example.com").update(is_active=False)
        self.assertEqual(self.client.post(REFRESH).status_code, 401)

    # --- throttling --------------------------------------------------------
    def test_login_is_throttled(self):
        self.register()
        statuses = [self.login(password="Wrong-Passw0rd!").status_code for _ in range(6)]
        self.assertEqual(statuses[:5], [401] * 5)
        self.assertEqual(statuses[5], 429)


class UserManagerTests(APITestCase):
    def test_create_user_lowercases_whole_email(self):
        user = User.objects.create_user(
            username="Mixed", email="A@B.COM", password=PASSWORD
        )
        self.assertEqual(user.email, "a@b.com")

    def test_create_user_with_blank_email_does_not_return_none(self):
        # Empty string must stay a string; None would violate NOT NULL.
        self.assertEqual(User.objects.normalize_email(""), "")
        self.assertEqual(User.objects.normalize_email(None), "")


class GoogleCredentialVerificationTests(APITestCase):
    def _claims(self, **overrides):
        claims = {
            "iss": "https://accounts.google.com",
            "sub": "g-1",
            "email": "user@example.com",
            "email_verified": True,
        }
        claims.update(overrides)
        return claims

    def _verify(self, claims):
        from . import services

        with patch.object(services, "_google_certs", return_value={}), patch.object(
            services.google_jwt, "decode", return_value=claims
        ):
            return services.verify_google_credential("token")

    def test_rejects_unverified_email(self):
        with self.assertRaises(InvalidGoogleCredentialError):
            self._verify(self._claims(email_verified=False))

    def test_rejects_wrong_issuer(self):
        with self.assertRaises(InvalidGoogleCredentialError):
            self._verify(self._claims(iss="https://evil.example"))

    def test_rejects_missing_subject(self):
        claims = self._claims()
        del claims["sub"]
        with self.assertRaises(InvalidGoogleCredentialError):
            self._verify(claims)

    def test_accepts_valid_claims(self):
        self.assertEqual(self._verify(self._claims())["sub"], "g-1")

    def test_malformed_token_is_invalid_credential(self):
        from . import services

        with patch.object(services, "_google_certs", return_value={}), patch.object(
            services.google_jwt, "decode", side_effect=ValueError("bad token")
        ):
            with self.assertRaises(InvalidGoogleCredentialError):
                services.verify_google_credential("token")
