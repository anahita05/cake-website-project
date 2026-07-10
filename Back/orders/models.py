from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from products.models import Product

class Order(models.Model):
    
    STATUS_CHOICES = [
        ('waiting_for_approval', 'Waiting for Approval'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('canceled', 'Canceled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='waiting_for_approval')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    city = models.CharField(max_length=100)
    delivery_address = models.TextField()
    notes = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=[
    ('cash', 'Cash on Delivery'),
    ('card', 'Card on Delivery'),
    ('online', 'Online Payment'),
    ], default='cash')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.id} by {self.user.username if self.user else 'Deleted User'} - {self.status}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    old_price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name} for Order {self.order.id}"