from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from api.models import Order
from api.serializers import OrderSerializer
from api.permissions import IsAdmin, IsDriver
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes


# Orders
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdmin]



class DriverOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsDriver]
    queryset = Order.objects.none()

    def get_queryset(self):
        return Order.objects.filter(driver=self.request.user)


    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        order = self.get_object()
        if order.driver != request.user:
            return Response({"error": "This order is not assigned to you"}, status=403)
        if order.status != "pending":
            return Response({"error": "Order already confirmed or completed"}, status=400)
        order.confirm()
        serializer = self.get_serializer(order)
        return Response({
            "message": "Order confirmed",
            "confirmed_at": order.confirmed_at,
            "order": serializer.data
        }, status=200)