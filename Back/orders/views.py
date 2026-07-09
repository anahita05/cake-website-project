from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Order
from .services import order_create_from_cart
from .selectors import order_list, order_detail
from .serializers import OrderOutputSerializer, OrderCreateInputSerializer


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List user orders",
        description="Returns all orders for the current user, newest first.",
        tags=["Orders"],
        responses={200: OrderOutputSerializer(many=True)},
    )
    def get(self, request):
        orders = order_list(user=request.user)
        return Response(OrderOutputSerializer(orders, many=True).data)


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create order from cart",
        description="Creates a new order from the current user's cart and clears the cart.",
        tags=["Orders"],
        request=OrderCreateInputSerializer,
        responses={201: OrderOutputSerializer},
    )
    def post(self, request):
        serializer = OrderCreateInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = order_create_from_cart(
                user=request.user,
                **serializer.validated_data
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            OrderOutputSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get order detail",
        tags=["Orders"],
        responses={200: OrderOutputSerializer},
    )
    def get(self, request, order_id):
        try:
            order = order_detail(order_id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(OrderOutputSerializer(order).data)