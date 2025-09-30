from celery import shared_task
from django.utils import timezone
from datetime import timedelta, datetime, date
from .models import Customer, Order, RecheckInvoice
from django.db.models import Sum
from dateutil.relativedelta import relativedelta


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


@shared_task
def generate_recheck_invoices():
    today = date.today()
    customers = Customer.objects.exclude(starting_date__isnull=True)

    for customer in customers:
        start_date = customer.starting_date

        last_invoice = RecheckInvoice.objects.filter(customer=customer).order_by("-period_end").first()

        if last_invoice:
           
            current_start = last_invoice.period_end + timedelta(days=1)
        else:
            current_start = start_date

        while current_start <= today:
            current_end = current_start + relativedelta(days=29)
            if current_end > today:
               
                break

            orders = Order.objects.filter(
                customer=customer,
                created_at__date__gte=current_start,
                created_at__date__lte=current_end,
                status="confirmed"
            )

            total_trips = orders.count()
            total_gallons = orders.aggregate(Sum("filled_amount"))["filled_amount__sum"] or 0

            RecheckInvoice.objects.get_or_create(
                customer=customer,
                period_start=current_start,
                defaults={
                    "period_end": current_end,
                    "total_trips": total_trips,
                    "total_gallons": total_gallons,
                },
            )

        
            current_start = current_end + timedelta(days=1)