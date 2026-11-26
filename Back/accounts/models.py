from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.functions import Lower
import uuid

from .managers import UserManager

# Create your models here.

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # unique=True satisfies Django's auth.E003 check; the functional
    # constraint below additionally makes the uniqueness case-insensitive.
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="accounts_user_email_ci_unique"),
        ]
    
    def __str__(self):
        return f"{self.email} | {self.phone_number}"