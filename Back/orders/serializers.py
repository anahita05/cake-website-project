from rest_framework import serializers
from .models import Order, OrderItem


# =============================================================================
# Input Serializers
# =============================================================================

class OrderCreateInputSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    delivery_address = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['cash', 'card', 'online'])
    notes = serializers.CharField(required=False, allow_blank=True, default='')


# =============================================================================
# Output Serializers
# =============================================================================

class OrderItemOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'product_name', 'quantity',
            'price_at_purchase', 'old_price_at_purchase'
        ]


class OrderOutputSerializer(serializers.ModelSerializer):
    items = OrderItemOutputSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'full_name', 'phone_number',
            'city', 'delivery_address', 'payment_method',
            'notes', 'total_price', 'items',
            'created_at', 'updated_at'
        ]