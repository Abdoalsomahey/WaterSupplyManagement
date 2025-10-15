# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.utils import timezone
# from datetime import datetime
# from .models import Customer, Order

# @receiver(post_save, sender=Customer)
# def create_order_on_customer_creation(sender, instance, created, **kwargs):

#     if not created:
#         return

#     today = timezone.localdate()


#     if not instance.starting_date or today < instance.starting_date:
#         return

    
#     weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
#     today_weekday = weekdays[today.weekday()]
#     if not any(day.lower() == today_weekday for day in instance.delivery_days):
#         return

#     if Order.objects.filter(customer=instance, delivery_time__date=today).exists():
#         return
    
#     if instance.delivery_time:
#         naive_datetime = datetime.combine(today, instance.delivery_time)
#         aware_datetime = timezone.make_aware(naive_datetime, timezone.get_current_timezone())

#         Order.objects.create(
#             customer=instance,
#             driver=instance.driver,
#             delivery_time=aware_datetime,
#             required_gallons=instance.gallons,
#             customer_location=instance.location_link,
#             status="pending",
#         )
