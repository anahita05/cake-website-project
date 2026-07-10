from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from .models import Order

User = get_user_model()


def order_list(*, user: User) -> QuerySet:
    return Order.objects.filter(user=user).order_by('-created_at')

def order_detail(*, order_id: int, user: User) -> Order:
    return Order.objects.get(id=order_id, user=user)