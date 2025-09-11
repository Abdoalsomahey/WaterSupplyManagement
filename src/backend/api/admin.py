from django.contrib import admin
from .models import User, Customer
# Driver, Vehicle, Order, Invoice, DeliveryProof, Notification, Report

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "phone", "is_staff", "is_active")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "email", "phone")

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "phone", "area", "zone_number", "plot_number", "property_type", "account_number")
    search_fields = ("full_name", "phone", "account_number",)

# @admin.register(Driver)
# class DriverAdmin(admin.ModelAdmin):
#     list_display = ("id", "user", "license_number", "vehicle")
#     search_fields = ("user__username", "license_number")

# @admin.register(Vehicle)
# class VehicleAdmin(admin.ModelAdmin):
#     list_display = ("id", "plate_number", "capacity", "status")
#     list_filter = ("status",)
#     search_fields = ("plate_number",)

# @admin.register(Order)
# class OrderAdmin(admin.ModelAdmin):
#     list_display = ("id", "customer", "driver", "vehicle", "quantity", "delivery_date", "status")
#     list_filter = ("status", "delivery_date")
#     search_fields = ("customer__user__username", "driver__user__username")

# @admin.register(Invoice)
# class InvoiceAdmin(admin.ModelAdmin):
#     list_display = ("id", "order", "amount", "status", "payment_method", "issued_at")
#     list_filter = ("status", "payment_method")
#     search_fields = ("order__id",)

# @admin.register(DeliveryProof)
# class DeliveryProofAdmin(admin.ModelAdmin):
#     list_display = ('order', 'driver', 'delivered_at')
#     list_filter = ('delivered_at',)
#     search_fields = ('order__id', 'driver__user__username')
#     date_hierarchy = 'delivered_at'
#     ordering = ('-delivered_at',)

# @admin.register(Notification)
# class NotificationAdmin(admin.ModelAdmin):
#     list_display = ('user', 'type', 'message', 'read', 'created_at')
#     list_filter = ('type', 'read', 'created_at')
#     search_fields = ('user__username', 'message')
#     date_hierarchy = 'created_at'
#     ordering = ('-created_at',)

# @admin.register(Report)
# class ReportAdmin(admin.ModelAdmin):
#     list_display = ('month', 'total_orders', 'total_delivered', 'total_revenue', 'created_at')
#     list_filter = ('month',)
#     search_fields = ('month',)
#     ordering = ('-month',)
