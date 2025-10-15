from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from jwt import decode as jwt_decode
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user(validated_token):
    try:
        user_id = validated_token.get('user_id')
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    """Custom middleware to authenticate WebSocket connections using JWT."""
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        if token is None:
            scope["user"] = AnonymousUser()
            return await self.inner(scope, receive, send)

        try:
            # ✅ Validate token with SimpleJWT
            UntypedToken(token)

            # ✅ Decode manually to extract user_id
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            scope["user"] = await get_user(decoded_data)
        except (InvalidToken, TokenError, Exception):
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
