from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product


# Create your models here.

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"cart of {self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    
    class Meta:
        unique_together = ('cart', 'product')
        
    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart of {self.cart.user.username}"