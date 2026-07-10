from django.contrib.auth import get_user_model
from .models import Cart

User = get_user_model()


def cart_get(*, user : User) -> Cart:
    """Get or create a cart for the user."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart