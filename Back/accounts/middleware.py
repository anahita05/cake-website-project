from django.conf import settings
from django.http import JsonResponse

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
FORM_CONTENT_TYPES = {"application/x-www-form-urlencoded"}


class ApiOriginCheckMiddleware:
    """Origin/Referer check for cookie-authenticated unsafe API requests.

    Complements SameSite cookies. Non-browser clients that send no
    Origin/Sec-Fetch-Site are allowed; browser requests from untrusted
    origins are rejected.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        blocked = self._check(request)
        if blocked is not None:
            return blocked
        return self.get_response(request)

    @staticmethod
    def _check(request):
        if request.method not in UNSAFE_METHODS or not request.path.startswith("/api/"):
            return None

        allowed = set(getattr(settings, "CORS_ALLOWED_ORIGINS", [])) | set(
            getattr(settings, "CSRF_TRUSTED_ORIGINS", [])
        )

        origin = request.headers.get("Origin")
        if origin:
            # "null" (sandboxed iframe / file://) is never in the allowlist.
            if origin not in allowed:
                return JsonResponse({"error": "Request origin not allowed."}, status=403)
            return None

        # Modern browsers send Sec-Fetch-Site even when Origin is omitted.
        if request.headers.get("Sec-Fetch-Site") == "cross-site":
            return JsonResponse({"error": "Cross-site request blocked."}, status=403)

        # Legacy fallback: form posts with neither header are cross-site HTML forms.
        content_type = (request.content_type or "").split(";")[0].strip().lower()
        if content_type in FORM_CONTENT_TYPES:
            return JsonResponse({"error": "Missing Origin header."}, status=403)

        return None
