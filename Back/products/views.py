from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from .models import Product, Category
from .selectors import product_list, product_detail
from .serializers import ProductOutputSerializer, CategoryOutputSerializer


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="List all categories",
        tags=["Products"],
        responses={200: CategoryOutputSerializer(many=True)},
    )
    def get(self, request):
        categories = Category.objects.all()
        return Response(CategoryOutputSerializer(categories, many=True).data)


class ProductListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="List all products",
        description="Returns all available products. Filter by category using ?category=<slug>",
        tags=["Products"],
        responses={200: ProductOutputSerializer(many=True)},
    )
    def get(self, request):
        category_slug = request.query_params.get('category')
        products = product_list(category_slug=category_slug)
        return Response(
            ProductOutputSerializer(products, many=True, context={'request': request}).data
        )


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Get product detail",
        tags=["Products"],
        responses={200: ProductOutputSerializer},
    )
    def get(self, request, product_id):
        try:
            product = product_detail(product_id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(
            ProductOutputSerializer(product, context={'request': request}).data
        )