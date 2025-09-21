from celery import shared_task
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Customer, Order
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def generate_today_orders():
    today = timezone.localdate()
    customers = Customer.objects.filter(weekly_trips__gt=0, delivery_days__isnull=False, delivery_time__isnull=False)

   
    existing_orders = Order.objects.filter(delivery_time__date=today)
    existing_customers_ids = {o.customer_id for o in existing_orders}

    new_orders = []

    weekdays = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
    today_weekday = weekdays[today.weekday()]  

    for customer in customers:

        if not any(day.lower() == today_weekday for day in customer.delivery_days):
            continue

        if customer.id in existing_customers_ids:
            continue

        delivery_datetime = datetime.combine(today, customer.delivery_time)
        delivery_datetime = timezone.make_aware(delivery_datetime)

        new_orders.append(Order(
            customer=customer,
            driver=customer.driver,
            delivery_time=delivery_datetime,
            required_gallons=customer.gallons,
            customer_location=customer.location_link,
            status="pending"
        ))


    if new_orders:
        Order.objects.bulk_create(new_orders)
    
    return f"{len(new_orders)} orders created for today"

# from celery import shared_task

# @shared_task
# def sample_task():
#     print("🚀 Celery is running a scheduled task!")
#     return "done"