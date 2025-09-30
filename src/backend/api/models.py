from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from datetime import timedelta



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

    def __str__(self):
    	return f"{self.full_name} ({self.phone})"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
        ("problem", "Problem"),
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
        limit_choices_to={'role': 'driver'}
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
    problem_reason = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def confirm(self, filled_amount, proof_image):
        if not proof_image:
            raise ValueError("Proof image is required")
        if not filled_amount:
            raise ValueError("Filled amount is required")
        self.status = "confirmed"
        self.filled_amount = filled_amount
        self.proof_image = proof_image
        self.confirmed_at = timezone.now()
        self.save()

    def mark_problem(self, reason):
        self.status = "problem"
        self.problem_reason = reason
        self.save()

    def is_driver_late(self, minutes=30):
        if self.confirmed_at and self.created_at:
            return (self.confirmed_at - self.created_at).total_seconds() > minutes * 60
        return False

    def __str__(self):
        return f"Order for {self.customer.full_name} ({self.status})"

class RecheckInvoice(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent to Accountant"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="rechecks")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        limit_choices_to={'role': 'accountant'},
        related_name='assigned_rechecks'
    )
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    total_trips = models.IntegerField(default=0)
    total_gallons = models.IntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_rechecks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "period_start")
        ordering = ["-period_start"]

    def __str__(self):
        return f"Recheck {self.customer.full_name} ({self.period_start} → {self.period_end})"


class FinalInvoice(models.Model):

    recheck = models.OneToOneField(RecheckInvoice, on_delete=models.CASCADE, related_name="final_invoice")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, limit_choices_to={'role': 'accountant'})
    price_per_gallon = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    vat_percent = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    vat_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    finalized_at = models.DateTimeField(auto_now_add=True)

    def calculate_totals(self):
        gallons = self.recheck.total_gallons or 0
        self.subtotal = round(gallons * float(self.price_per_gallon), 2)
        self.vat_amount = round(self.subtotal * (float(self.vat_percent) / 100.0), 2)
        self.total = round(self.subtotal + self.vat_amount, 2)

    def save(self, *args, **kwargs):
        self.calculate_totals()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"FinalInvoice #{self.id} - {self.recheck.customer.full_name} - {self.recheck.month.strftime('%Y-%m')}"
    

class Complaint(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    STATUS_CHOICES = [
        ("new", "New"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
    ]

    customer = models.ForeignKey(
        "Customer",
        on_delete=models.CASCADE,
        related_name="complaints"
    )
    order = models.ForeignKey(
        "Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints"
    )
    issue = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Complaint #{self.id} - {self.customer.full_name}"
