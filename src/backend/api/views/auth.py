from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.views import APIView
from api.serializers import LoginSerializer, LogoutSerializer, CheckAuthSerializer
from rest_framework.permissions import AllowAny



class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)



class CheckAuthView(generics.GenericAPIView):
    serializer_class = CheckAuthSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {"authenticated": True}
        serializer = self.get_serializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)