# from celery import shared_task
# from django.utils import timezone
# from datetime import datetime
# from .models import Customer, Order


# @shared_task
# def generate_today_orders():
#     today = timezone.localdate()


#     customers = Customer.objects.filter(
#         weekly_trips__gt=0,
#         delivery_days__isnull=False,
#         delivery_time__isnull=False
#     )


#     existing_orders = Order.objects.filter(delivery_time__date=today)
#     existing_customers_ids = {o.customer_id for o in existing_orders}

#     new_orders = []

#     weekdays = [
#         "monday", "tuesday", "wednesday", "thursday",
#         "friday", "saturday", "sunday"
#     ]
#     today_weekday = weekdays[today.weekday()]

#     for customer in customers:

#         if not customer.starting_date or today < customer.starting_date:
#             continue


#         if not any(day.lower() == today_weekday for day in customer.delivery_days):
#             continue

#         if customer.id in existing_customers_ids:
#             continue


#         delivery_datetime = datetime.combine(today, customer.delivery_time)
#         if timezone.is_naive(delivery_datetime):
#             delivery_datetime = timezone.make_aware(delivery_datetime)


#         new_orders.append(Order(
#             customer=customer,
#             driver=customer.driver,
#             delivery_time=delivery_datetime,
#             required_gallons=customer.gallons,
#             customer_location=customer.location_link,
#             status="pending",
#         ))

#     if new_orders:
#         Order.objects.bulk_create(new_orders)

#     return f"{len(new_orders)} orders created for {today}"


from celery import shared_task
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from api.models import Customer, Order, Invoice


@shared_task
def generate_monthly_invoices():
    today = date.today()
    customers = Customer.objects.exclude(starting_date__isnull=True)
    print(f"🔍 Running monthly invoice generation for {customers.count()} customers ({today})")

    for customer in customers:
        start_date = customer.starting_date


        last_invoice = Invoice.objects.filter(customer=customer).order_by("-period_end").first()


        if last_invoice:
            current_start = last_invoice.period_end + timedelta(days=1)
        else:
            current_start = start_date

    
        current_end = current_start + relativedelta(days=29)

   
        if current_end > today:
            current_end = today

        orders = Order.objects.filter(
            customer=customer,
            created_at__date__gte=current_start,
            created_at__date__lte=current_end,
            status="completed"
        )

        total_trips = orders.count()
        total_gallons = orders.aggregate(Sum("filled_amount"))["filled_amount__sum"] or 0

        invoice, created = Invoice.objects.update_or_create(
            customer=customer,
            period_start=current_start,
            defaults={
                "period_end": current_end,
                "total_trips": total_trips,
                "total_gallons": total_gallons,
            },
        )

        action = "✅ [CREATED]" if created else "♻️ [UPDATED]"
        print(f"{action} {customer.full_name} | {current_start} → {current_end} | Trips: {total_trips}, Gallons: {total_gallons}")

    print("🎉 Monthly invoice generation finished successfully.")

# from celery import shared_task
# from datetime import date, datetime, timedelta, time as dt_time
# from django.utils import timezone
# from django.db import transaction
# from django.db.models import Sum
# from .models import Customer, Order, RecheckInvoice


# @shared_task
# def generate_recheck_invoices():
#     """
#     Generate or update ONE monthly RecheckInvoice per customer.
#     Covers period: from the first day of current month → today.
#     """
#     today = date.today()
#     tz = timezone.get_current_timezone()
#     customers = Customer.objects.exclude(starting_date__isnull=True)
#     print(f"🔍 Running monthly recheck invoice generation for {customers.count()} customers (Date: {today})")

#     # بداية الشهر الحالي
#     month_start = today.replace(day=1)
#     month_end = today  # الفاتورة تغطي لليوم الحالي فقط (ليست نهاية الشهر بعد)

#     for customer in customers:
#         if not customer.starting_date:
#             continue

#         # نحدّد فترة الشهر الحالية
#         period_start = month_start
#         period_end = month_end

#         # اجعل التواريخ timezone-aware
#         start_dt = timezone.make_aware(datetime.combine(period_start, dt_time.min), tz)
#         end_dt = timezone.make_aware(datetime.combine(period_end, dt_time.max), tz)

#         # نجمع الطلبات المؤكدة في هذا الشهر
#         orders_qs = Order.objects.filter(
#             customer=customer,
#             status="confirmed",
#             confirmed_at__gte=start_dt,
#             confirmed_at__lte=end_dt
#         )

#         total_trips = orders_qs.count()
#         total_gallons = orders_qs.aggregate(sum=Sum("filled_amount"))["sum"] or 0

#         with transaction.atomic():
#             invoice, created = RecheckInvoice.objects.get_or_create(
#                 customer=customer,
#                 period_start=period_start,
#                 defaults={
#                     "period_end": period_end,
#                     "total_trips": total_trips,
#                     "total_gallons": total_gallons,
#                 },
#             )

#             # لو كانت موجودة نحدّثها فقط
#             if not created:
#                 invoice.period_end = period_end
#                 invoice.total_trips = total_trips
#                 invoice.total_gallons = total_gallons
#                 invoice.save()

#         cname = customer.full_name or f"Customer#{customer.id}"
#         if created:
#             print(f"✅ [MONTHLY INVOICE CREATED] {cname} | {period_start} → {period_end} | Trips: {total_trips}, Gallons: {total_gallons}")
#         else:
#             print(f"♻️ [MONTHLY INVOICE UPDATED] {cname} | {period_start} → {period_end} | Trips: {total_trips}, Gallons: {total_gallons}")

#     print("🎉 Monthly recheck invoice generation completed successfully.")
