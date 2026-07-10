from django.contrib.auth import get_user_model
from .models import Cart, CartItem
from .selectors import cart_get
from products.models import Product

User = get_user_model()


def cart_get_or_create(*, user: User) -> Cart:
    """Get or create a cart for the user."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


def cart_add_item(*, user: User, product: Product, quantity: int = 1) -> CartItem:
    cart = cart_get(user=user)
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    return cart_item

def cart_remove_item(*, user: User, product: Product) -> None:
    cart = cart_get(user=user)
    CartItem.objects.filter(cart=cart, product=product).delete()
    
def cart_update_item_quantity(*, user: User, product: Product, quantity: int) -> CartItem:
    cart = cart_get(user=user)
    cart_item = CartItem.objects.get(cart=cart, product=product)
    cart_item.quantity = quantity
    cart_item.save()
    return cart_item
    
def cart_clear(*, user: User) -> None:
    cart = cart_get(user=user)
    CartItem.objects.filter(cart=cart).delete()