# # tasks.py
# from celery import shared_task
# from django.utils import timezone
# from datetime import timedelta, datetime
# from .models import Customer, Order

# @shared_task
# def generate_weekly_orders():
#     today = timezone.now().date()
#     next_week = today + timedelta(days=7)

#     customers = Customer.objects.filter(weekly_trips__gt=0)

#     for customer in customers:
#         if not customer.delivery_days or not customer.delivery_time:
#             continue

#         for day in customer.delivery_days:
#             try:

#                 weekday = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].index(day.lower())
#             except ValueError:
#                 continue

#             delivery_date = today + timedelta(days=(weekday - today.weekday()) % 7)
#             if delivery_date <= today:
#                 delivery_date += timedelta(days=7)

#             delivery_datetime = datetime.combine(delivery_date, customer.delivery_time)
#             delivery_datetime = timezone.make_aware(delivery_datetime)

#             exists = Order.objects.filter(customer=customer, delivery_time=delivery_datetime).exists()
#             if not exists:
#                 Order.objects.create(
#                     customer=customer,
#                     driver=customer.driver,
#                     delivery_time=delivery_datetime,
#                     required_gallons=customer.gallons,
#                     customer_location=customer.location_link,
#                     status="pending"
#                 )
