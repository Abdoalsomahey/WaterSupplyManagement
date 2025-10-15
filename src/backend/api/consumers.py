import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer to send real-time notifications.
    Works with JWT authentication via JWTAuthMiddleware.
    """

    async def connect(self):
        user = self.scope["user"]

        # Reject anonymous users
        if user.is_anonymous:
            await self.close()
            return

        # Only Admins and Managers can receive notifications
        if user.role not in ["admin", "manager"]:
            await self.close()
            return

        self.group_name = f"notifications_{user.role}"

        # Add the user to their group (admin/manager)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Normally clients don’t send data; WebSocket only pushes notifications
        data = json.loads(text_data)
        message = data.get("message", None)
        if message:
            await self.send(text_data=json.dumps({"echo": message}))

    async def send_notification(self, event):
        """
        Called by Django Channels when sending a new notification to the group.
        """
        await self.send(text_data=json.dumps({
            "type": "notification",
            "message": event["message"],
            "timestamp": event.get("timestamp"),
            "order_id": event.get("order_id"),
        }))