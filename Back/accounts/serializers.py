from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


# =============================================================================
# Input Serializers
# =============================================================================

class UserRegisterInputSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})


# =============================================================================
# Output Serializers
# =============================================================================
    
class UserOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number']
        read_only_fields = ['id', 'username', 'email', 'phone_number']
        