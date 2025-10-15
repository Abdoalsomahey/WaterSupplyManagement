from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, DriverProfile, Customer, Order, Invoice, Complaint, Notification
from drf_spectacular.utils import extend_schema_field
from datetime import date


from rest_framework import serializers
from .models import User, DriverProfile

class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = [
            "license_type",
            "license_number",
            "license_issue_date",
            "license_expiry_date",
            "vehicle_plate",
            "plate_no",
            "tablet_number",
            "uae_id",
            "registration_date",
        ]


class UserSerializer(serializers.ModelSerializer):
    driver_profile = DriverProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "phone",
            "password",
            "driver_profile",
        )
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        request = self.context.get("request")
        request_user = getattr(request, "user", None)
        new_role = validated_data.get("role")


        if request_user:
            if request_user.role == "manager" and new_role != "driver":
                raise serializers.ValidationError("Managers can only create Drivers.")
            if request_user.role == "admin" and new_role == "admin":
                raise serializers.ValidationError("Admin cannot create another Admin.")
            if request_user.role in ["accountant", "driver"]:
                raise serializers.ValidationError("You do not have permission to create users.")

        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        if user.role == "driver":
            DriverProfile.objects.create(user=user)

        return user

    def update(self, instance, validated_data):
        driver_fields = {
            "license_type",
            "license_number",
            "license_issue_date",
            "license_expiry_date",
            "vehicle_plate",
            "plate_no",
            "tablet_number",
            "uae_id",
        }
        driver_data = {
            field: validated_data.pop(field, None)
            for field in driver_fields
            if field in validated_data
        }

        # تحديث بيانات المستخدم
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        
        if instance.role == "driver":
            driver_profile, _ = DriverProfile.objects.get_or_create(user=instance)
            for field, value in driver_data.items():
                if value is not None:
                    setattr(driver_profile, field, value)
            driver_profile.save()

        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")


        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password")

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "role": user.role
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            refresh_token = RefreshToken(self.token)
            refresh_token.blacklist()
        except Exception:
            self.fail("bad_token")

    default_error_messages = {
        "bad_token": "Token is invalid or expired"
    }

class CheckAuthSerializer(serializers.Serializer):
    authenticated = serializers.BooleanField()


from datetime import date
from rest_framework import serializers
from api.models import Customer, User


class CustomerSerializer(serializers.ModelSerializer):
    delivery_time = serializers.TimeField(format="%H:%M")
    delivery_days = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    driver_username = serializers.SlugRelatedField(
        slug_field="username",
        queryset=User.objects.filter(
            role="driver",
            driver_profile__license_expiry_date__gte=date.today()
        ),
        source="driver",
        write_only=True
    )

    driver = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["driver", "registration_date"]

    def validate(self, attrs):
        driver = attrs.get("driver")
        if driver and driver.role == "driver":
            driver_profile = getattr(driver, "driver_profile", None)
            if not driver_profile:
                raise serializers.ValidationError("This driver does not have a driver profile.")
            if driver_profile.license_expiry_date < date.today():
                raise serializers.ValidationError(
                    f"Driver {driver.username}'s license has expired and cannot be assigned to a customer."
                )

        weekly_trips = attrs.get("weekly_trips")
        days = attrs.get("delivery_days", [])

        if weekly_trips:
            if not days:
                default_days = [
                    "Monday", "Tuesday", "Wednesday", "Thursday",
                    "Friday", "Saturday", "Sunday"
                ]
                attrs["delivery_days"] = default_days[:weekly_trips]
            elif len(days) != weekly_trips:
                raise serializers.ValidationError(
                    f"Number of delivery days ({len(days)}) must match weekly trips ({weekly_trips})."
                )

        return attrs

    def create(self, validated_data):
        if isinstance(validated_data.get("delivery_days"), set):
            validated_data["delivery_days"] = list(validated_data["delivery_days"])
        return super().create(validated_data)


class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    driver = UserSerializer(read_only=True)

    customer_name = serializers.SlugRelatedField(
        slug_field="full_name",
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )
    
    driver_username = serializers.SlugRelatedField(
        slug_field="username",
        queryset=User.objects.filter(
            role="driver",
            driver_profile__license_expiry_date__gte=date.today()
        ),
        source="driver",
        write_only=True
    )

    is_late = serializers.SerializerMethodField()
    proof_image = serializers.ImageField(read_only=True)
    failure_reason = serializers.CharField(read_only=True)
    filled_amount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = [
            "created_at",
            "completed_at",
            "status",
        ]

    def get_is_late(self, obj):
        request = self.context.get("request")
        if request and hasattr(request.user, "role") and request.user.role == "admin":
            return obj.is_driver_late(minutes=30)
        return None

    def validate(self, attrs):
        driver = attrs.get("driver")
        if driver and driver.role == "driver":
            driver_profile = getattr(driver, "driver_profile", None)
            if not driver_profile:
                raise serializers.ValidationError("This driver does not have a driver profile.")
            if driver_profile.license_expiry_date < date.today():
                raise serializers.ValidationError(f"Driver {driver.username}'s license has expired.")
        return attrs

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        if not (
            request and (
                request.user == instance.driver
                or (hasattr(request.user, "role") and request.user.role == "admin")
            )
        ):
            ret.pop("proof_image", None)
            ret.pop("filled_amount", None)
        if not (request and hasattr(request.user, "role") and request.user.role == "admin"):
            ret.pop("is_late", None)
        return ret

class DriverOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            "id", "customer", "delivery_time", "filled_amount", "proof_image",
            "failure_reason", "status", "created_at", "required_gallons", "customer_location"
        ]
        read_only_fields = [
            "customer", "delivery_time", "status", "created_at",
            "failure_reason", "required_gallons", "customer_location"
        ]
    def get_customer(self, obj):
        return {
            "full_name": obj.customer.full_name,
            "phone": obj.customer.phone
        }
    
class InvoiceSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)

    customer_name = serializers.SlugRelatedField(
        slug_field="full_name",
        queryset=Customer.objects.all(),
        source="customer",
        write_only=True
    )
    accountant_name = serializers.SlugRelatedField(
        slug_field="username",
        queryset=User.objects.filter(role="accountant"),
        source="assigned_to",
        write_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "customer",
            "assigned_to",
            "customer_name",
            "accountant_name",
            "period_start",
            "period_end",
            "total_trips",
            "total_gallons",
            "price_per_gallon",
            "subtotal",
            "vat_percent",
            "vat_amount",
            "total",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["price_per_gallon", "subtotal", "vat_percent", "vat_amount", "total", "created_at"]



class SendToAccountantSerializer(serializers.Serializer):
    accountant_username = serializers.CharField(required=True)

class AccountantInvoiceSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "customer",
            "period_start",
            "period_end",
            "total_trips",
            "total_gallons",
            "price_per_gallon",
            "subtotal",
            "vat_percent",
            "vat_amount",
            "total",
            "status",
            "notes",
        ]
        read_only_fields = ["total_trips", "total_gallons", "period_start", "period_end"]


class ComplaintSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id", "customer", "issue", "status", 
            "resolution_text", "resolution_image",
            "resolution_status" ,"created_at",
        ]
        read_only_fields = ["id", "created_at"]
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "recipient", "message", "order", "is_read", "created_at"]
        read_only_fields = ["recipient", "created_at"]