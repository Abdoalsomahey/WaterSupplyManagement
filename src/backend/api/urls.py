# myapp/urls.py
from django.urls import path, include
from .views.auth import LoginView, LogoutView, CheckAuthView
from .views.users import UserViewSet
from .views.orders import OrderViewSet, DriverOrderViewSet
from .views.customers import CustomerViewSet
from .views.invoices import AdminRecheckViewSet, AccountantInvoiceViewSet
from .views.dashboard import DashboardViewSet
from .views.complaints import ComplaintViewSet
from .views import views
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'driver/orders', DriverOrderViewSet, basename='driver-orders')
router.register(r"rechecks", AdminRecheckViewSet, basename="admin-rechecks")
router.register(r"accountant/invoices", AccountantInvoiceViewSet, basename="accountant-invoices")
router.register(r"complaints", ComplaintViewSet, basename="complaint")
router.register(r'dashboard', DashboardViewSet, basename='dashboard')



urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('log_in/', LoginView.as_view(), name='login'), # POST
    path('log_out/', LogoutView.as_view(), name='logout'), # POST
    path('check-auth/', CheckAuthView.as_view(), name='check_auth'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path("", include(router.urls)),
]