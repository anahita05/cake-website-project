from rest_framework import serializers
from .models import Category, Product


# =============================================================================
# Output Serializers
# =============================================================================

class CategoryOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']


class ProductOutputSerializer(serializers.ModelSerializer):
    category = CategoryOutputSerializer()
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'old_price',
            'image', 'category', 'is_available', 'rating', 'reviews_count'
        ]