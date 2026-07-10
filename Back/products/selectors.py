import uuid
from django.db.models import QuerySet
from .models import Product

def  product_list(*, category_slug : str = None) -> QuerySet:
    products = Product.objects.filter(is_available=True)
    
    if category_slug:
        products = products.filter(category__slug=category_slug)
        
    return products

def product_detail(*, product_id : uuid.UUID) -> Product:
    return Product.objects.get(id=product_id)