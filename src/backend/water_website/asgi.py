import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'water_website.settings')
django.setup()

from api.middleware.jwt_auth_middleware import JWTAuthMiddleware  # ✅ استيراد الميدلوير المخصص

# Defining WebSocket routing
def get_websocket_urlpatterns():
    from django.urls import re_path
    from api.consumers import NotificationConsumer
    return [
        re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
    ]

# Configuring the ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            get_websocket_urlpatterns()
        )
    ),
})
