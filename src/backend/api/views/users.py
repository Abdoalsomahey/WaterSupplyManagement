from rest_framework import viewsets
from api.models import User, Customer
from api.serializers import UserSerializer, CustomerSerializer
from api.permissions import IsAdmin
from rest_framework.permissions import IsAuthenticated

# Users
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "username"  # تقدر تبحث بالـ username بدال id

# Customers
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    lookup_field = "full_name"  # تقدر تبحث بالاسم بدال id
