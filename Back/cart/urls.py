from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('items/', views.CartAddItemView.as_view(), name='cart-add-item'),
    path('items/<uuid:product_id>/', views.CartItemView.as_view(), name='cart-item'),
    path('clear/', views.CartClearView.as_view(), name='cart-clear'),
]