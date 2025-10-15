from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from datetime import timedelta
from decimal import Decimal


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("accountant", "Accountant"),
        ("driver", "Driver"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    def save(self, *args, **kwargs):
        if self.role == "admin":
            self.is_staff = True
            self.is_superuser = True
        elif self.role == "manager":
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False
        super().save(*args, **kwargs)
        

from django.db import models
from django.conf import settings
from django.utils import timezone


class DriverProfile(models.Model):
    LICENSE_TYPE_CHOICES = [
        ("heavy", "Heavy Vehicle"),
        ("light", "Light Vehicle"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="driver_profile",
        limit_choices_to={'role': 'driver'}
    )
    license_type = models.CharField(max_length=20, choices=LICENSE_TYPE_CHOICES)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    license_issue_date = models.DateField(blank=True, null=True)
    license_expiry_date = models.DateField(blank=True, null=True)

    vehicle_plate = models.CharField(max_length=50, blank=True, null=True)
    plate_no = models.CharField(max_length=20, blank=True, null=True)

    tablet_number = models.CharField(max_length=50, blank=True, null=True)
    uae_id = models.CharField(max_length=100, blank=True, null=True)
    registration_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"DriverProfile: {self.user.username} ({self.license_type})"

    @property
    def is_license_valid(self):
        """Check if license is still valid"""
        if self.license_expiry_date:
            return self.license_expiry_date >= timezone.localdate()
        return None


class Customer(models.Model):
    full_name = models.CharField(max_length=255, unique=True, blank=True, null=True)
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'driver'},
        related_name="customers"
    )
    area = models.CharField(max_length=255, blank=True, null=True)
    zone_number = models.CharField(max_length=100, blank=True, null=True)
    plot_number = models.CharField(max_length=100, blank=True, null=True)
    property_type = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    starting_date = models.DateField(blank=True, null=True)
    agreement_without_meter = models.BooleanField(default=False)

    weekly_trips = models.IntegerField(blank=True, null=True)
    delivery_days = models.JSONField(default=list, blank=True)
    delivery_time = models.TimeField(null=True, blank=True) 

    gallons = models.IntegerField(blank=True, null=True)
    filling_stations = models.CharField(max_length=255, blank=True, null=True)
    location_link = models.URLField(blank=True, null=True)

    registration_date = models.DateTimeField(auto_now_add=True)
    
	

    def __str__(self):
    	return f"{self.full_name} ({self.phone})"


from django.db import models
from django.conf import settings
from django.utils import timezone
from api.models import Customer


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="orders"
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "driver"}
    )
    proof_image = models.ImageField(
        upload_to="orders/proofs/",
        blank=True,
        null=True
    )
    delivery_time = models.DateTimeField(null=True, blank=True)
    required_gallons = models.IntegerField(null=True, blank=True)
    customer_location = models.URLField(null=True, blank=True)
    filled_amount = models.IntegerField(null=True, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def confirm(self, filled_amount, proof_image):
        """Mark order as completed when delivery proof is provided."""
        if not proof_image:
            raise ValueError("Proof image is required.")
        if not filled_amount:
            raise ValueError("Filled amount is required.")
        self.status = "completed"
        self.filled_amount = filled_amount
        self.proof_image = proof_image
        self.completed_at = timezone.now()
        self.save()

    def mark_failed(self, reason):
        """Mark order as failed and record reason."""
        if not reason:
            raise ValueError("Failure reason is required.")
        self.status = "failed"
        self.failure_reason = reason
        self.save()

    def is_driver_late(self, minutes=30):
        """Check if driver completed delivery later than allowed threshold."""
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds() > minutes * 60
        return False

    def __str__(self):
        return f"Order for {self.customer.full_name} ({self.status})"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent to Accountant"),
        ("approved", "Approved"),
        ("paid", "Paid"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": "accountant"},
        related_name="invoices_assigned",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices_created",
    )

    period_start = models.DateField()
    period_end = models.DateField()
    total_trips = models.PositiveIntegerField(default=0)
    total_gallons = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    price_per_gallon = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    vat_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("5.00"))
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_totals(self):
        if self.price_per_gallon and self.total_gallons:
            self.subtotal = self.price_per_gallon * self.total_gallons
            self.vat_amount = (self.subtotal * self.vat_percent) / 100
            self.total = self.subtotal + self.vat_amount

    def save(self, *args, **kwargs):
        self.calculate_totals()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice #{self.id} - {self.customer.full_name}"
    

class Complaint(models.Model):
    STATUS_CHOICES = [
        ("Request", "Request"),   
        ("Complain", "Complain"),
    ]
    RESOLUTION_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("resolved", "Resolved"),
    ]

    customer = models.ForeignKey(
        "Customer",
        on_delete=models.CASCADE,
        related_name="complaints"
    )
    issue = models.TextField()
    resolution_text = models.TextField(blank=True, null=True)
    resolution_image = models.ImageField(
        upload_to="complaint_resolutions/", blank=True, null=True
    )
    resolution_status = models.CharField(
        max_length=20,
        choices=RESOLUTION_STATUS_CHOICES,
        default="pending"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.status} #{self.id} - {self.customer.full_name}"


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    message = models.CharField(max_length=255)
    order = models.ForeignKey(
        "Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications"
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message[:20]}"
