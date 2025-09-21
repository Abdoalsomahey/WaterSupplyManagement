from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Customer, Order
from drf_spectacular.utils import extend_schema_field


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        role = validated_data.get('role')
        if password:
            user.set_password(password)
        if role == "admin":
            user.is_staff = True
            user.is_superuser = True
        else:
            user.is_staff = False
            user.is_superuser = False
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
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


class CustomerSerializer(serializers.ModelSerializer):

    delivery_time = serializers.TimeField(format="%H:%M")
    delivery_days = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    driver_username = serializers.SlugRelatedField(
        slug_field="username",
        queryset=User.objects.filter(role="driver"),
        source="driver",
        write_only=True
    )
    
    driver = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["driver"]

        

    def validate(self, attrs):
        weekly_trips = attrs.get("weekly_trips")
        days = attrs.get("delivery_days", [])

        if weekly_trips:
            if not days:
                default_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                attrs["delivery_days"] = default_days[:weekly_trips]
            elif len(days) != weekly_trips:
                raise serializers.ValidationError(
                    f"({len(days)})({weekly_trips})"
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
        queryset=User.objects.filter(role="driver"),
        source="driver",
        write_only=True
    )

    is_late = serializers.SerializerMethodField()
    proof_image = serializers.ImageField(read_only=True)
    problem_reason = serializers.CharField(read_only=True)
    filled_amount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["created_at", "confirmed_at", "status", "is_late",
                             "proof_image", "problem_reason", "delivery_time",
                             "filled_amount", "required_gallons", "customer_location"
                             ]

    def get_is_late(self, obj):
        request = self.context.get("request")
        if request and hasattr(request.user, "role") and request.user.role == "admin":
            return obj.is_driver_late(minutes=30)
        return None

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
            "problem_reason", "status", "created_at", "required_gallons", "customer_location"
        ]
        read_only_fields = [
            "customer", "delivery_time", "status", "created_at",
            "problem_reason", "required_gallons", "customer_location"
        ]
    def get_customer(self, obj):
        return {
            "full_name": obj.customer.full_name,
            "phone": obj.customer.phone
        }