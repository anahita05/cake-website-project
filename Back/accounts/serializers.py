import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()

PHONE_NUMBER_RE = re.compile(r"^\+?[\d\s().-]{6,20}$")


# =============================================================================
# Input Serializers
# =============================================================================

class UserRegisterInputSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all())],
    )
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        candidate = User(
            username=attrs.get("username", "").strip(),
            email=attrs.get("email", ""),
        )
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs


class LoginInputSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    # Persistent refresh cookie (7 days) vs browser-session cookie.
    remember = serializers.BooleanField(default=False)

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class GoogleLoginInputSerializer(serializers.Serializer):
    credential = serializers.CharField(
        write_only=True,
        trim_whitespace=True,
        max_length=8192
    )


class SetPasswordInputSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )
    current_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        user = self.context["request"].user
        # Google-created accounts have no usable password yet, so they only
        # need a new one. Everyone else must prove they know the old one.
        if user.has_usable_password():
            if not user.check_password(attrs.get("current_password") or ""):
                raise serializers.ValidationError(
                    {"current_password": "Incorrect password."}
                )
        try:
            validate_password(attrs["new_password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)})
        return attrs


class PasswordResetRequestInputSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class PasswordResetConfirmInputSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )


class ProfileUpdateInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["phone_number", "first_name", "last_name"]
        # Validate uniqueness ourselves so blank input can be stored as NULL.
        extra_kwargs = {
            "phone_number": {"validators": []},
            "first_name": {"max_length": 150},
            "last_name": {"max_length": 150},
        }

    def validate_phone_number(self, value):
        if value is None:
            return None
        value = value.strip()
        if not value:
            # Unique + blank would collide across users, so store NULL.
            return None
        if not PHONE_NUMBER_RE.match(value):
            raise serializers.ValidationError("Enter a valid phone number.")
        existing = User.objects.filter(phone_number=value)
        if self.instance is not None:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value


# =============================================================================
# Output Serializers
# =============================================================================

class UserOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone_number',
            'first_name',
            'last_name',
        ]
        read_only_fields = fields


class MessageOutputSerializer(serializers.Serializer):
    message = serializers.CharField()
