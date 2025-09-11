# myapp/urls.py
from django.urls import path, include
from .views.auth import LoginView, LogoutView, CheckAuthView
from .views.users import UserViewSet, CustomerViewSet
from .views.order import OrderViewSet, DriverOrderViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'driver/orders', DriverOrderViewSet, basename='driver-orders')

urlpatterns = [
    path('log_in/', LoginView.as_view(), name='login'), # POST
    path('log_out/', LogoutView.as_view(), name='logout'), # POST
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path("", include(router.urls)),
]