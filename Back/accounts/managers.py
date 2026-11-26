from django.contrib.auth.models import UserManager as DjangoUserManager


class UserManager(DjangoUserManager):
    """Store emails lowercased and resolve them case-insensitively."""

    @classmethod
    def normalize_email(cls, email):
        # super() lowercases only the domain; we want the whole address.
        return (email or "").strip().lower()

    def get_by_natural_key(self, username):
        # ModelBackend.authenticate() uses this for USERNAME_FIELD lookups.
        field = self.model.USERNAME_FIELD
        return self.get(**{f"{field}__iexact": username})
