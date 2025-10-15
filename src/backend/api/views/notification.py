from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Notification
from api.serializers import NotificationSerializer
from api.permissions import IsAdminOrManager

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        return Response({"message": f"{notifications.count()} notifications marked as read"})

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
