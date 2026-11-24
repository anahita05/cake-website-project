from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()


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

    def validate_email(self, value: str) -> str:
        return value.strip().lower()


class GoogleLoginInputSerializer(serializers.Serializer):
    credential = serializers.CharField(
        write_only=True,
        trim_whitespace=True,
        max_length=8192
    )


# =============================================================================
# Output Serializers
# =============================================================================

class UserOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number']
        read_only_fields = ['id', 'username', 'email', 'phone_number']


class MessageOutputSerializer(serializers.Serializer):
    message = serializers.CharField()
