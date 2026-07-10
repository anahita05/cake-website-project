from django.db import transaction
from django.contrib.auth import get_user_model
from cart.models import Cart

User = get_user_model()

@transaction.atomic
def user_create(*, email : str, password : str, username : str) -> User:
    user = User.objects.create_user(username=username, email=email, password=password)
    Cart.objects.create(user=user)
    return user

