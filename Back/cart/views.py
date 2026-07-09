from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .selectors import cart_get
from .services import cart_add_item, cart_remove_item, cart_update_item_quantity, cart_clear
from .models import CartItem
from .serializers import (
    CartOutputSerializer,
    CartItemOutputSerializer,
    CartAddItemInputSerializer,
    CartUpdateItemInputSerializer,
)
from products.models import Product


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get cart",
        description="Returns the current user's cart with all items and total price.",
        tags=["Cart"],
        responses={200: CartOutputSerializer},
    )
    def get(self, request):
        cart = cart_get(user=request.user)
        return Response(
            CartOutputSerializer(cart, context={'request': request}).data
        )


class CartAddItemView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Add item to cart",
        tags=["Cart"],
        request=CartAddItemInputSerializer,
        responses={201: CartItemOutputSerializer},
    )
    def post(self, request):
        serializer = CartAddItemInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            product = Product.objects.get(
                id=serializer.validated_data['product_id'],
                is_available=True
            )
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found or unavailable'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item = cart_add_item(
            user=request.user,
            product=product,
            quantity=serializer.validated_data['quantity']
        )
        return Response(
            CartItemOutputSerializer(cart_item, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update cart item quantity",
        tags=["Cart"],
        request=CartUpdateItemInputSerializer,
        responses={200: CartItemOutputSerializer},
    )
    def patch(self, request, product_id):
        serializer = CartUpdateItemInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            product = Product.objects.get(id=product_id)
            cart_item = cart_update_item_quantity(
                user=request.user,
                product=product,
                quantity=serializer.validated_data['quantity']
            )
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            CartItemOutputSerializer(cart_item, context={'request': request}).data
        )

    @extend_schema(
        summary="Remove item from cart",
        tags=["Cart"],
        responses={204: None},
    )
    def delete(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_remove_item(user=request.user, product=product)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartClearView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Clear cart",
        description="Removes all items from the current user's cart.",
        tags=["Cart"],
        responses={204: None},
    )
    def delete(self, request):
        cart_clear(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)