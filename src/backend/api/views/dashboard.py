from django.utils import timezone
from django.db.models import Count, Sum, Avg
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from openpyxl import Workbook
from datetime import timedelta

from api.permissions import IsAdminOrManager
from api.models import Customer, Complaint, Order, FinalInvoice


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        today = timezone.now().date()

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status="pending").count()
        total_revenue = FinalInvoice.objects.aggregate(total=Sum("total"))["total"] or 0
        active_customers = Customer.objects.count()

        today_orders = Order.objects.filter(created_at__date=today).count()
        today_revenue = FinalInvoice.objects.filter(finalized_at__date=today).aggregate(total=Sum("total"))["total"] or 0
        avg_order_value = FinalInvoice.objects.aggregate(avg=Avg("total"))["avg"] or 0
        conversion_rate = round(total_orders / active_customers, 2) if active_customers > 0 else 0

        return Response({
            "orders_count": total_orders,
            "orders_pending": pending_orders,
            "invoices_total": total_revenue,
            "new_customers": active_customers,
            "today_orders": today_orders,
            "today_revenue": today_revenue,
            "avg_order_value": avg_order_value,
            "conversion_rate": conversion_rate,
        })

    @action(detail=False, methods=["get"])
    def chart(self, request):
        period = request.query_params.get("period", "7d")
        today = timezone.now().date()

        if period == "30d":
            start_date = today - timedelta(days=30)
        elif period == "90d":
            start_date = today - timedelta(days=90)
        else:
            start_date = today - timedelta(days=7)

        orders = (
            Order.objects.filter(created_at__date__gte=start_date)
            .extra(select={"day": "date(created_at)"})
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        revenue = (
            FinalInvoice.objects.filter(finalized_at__date__gte=start_date)
            .extra(select={"day": "date(finalized_at)"})
            .values("day")
            .annotate(total=Sum("total"))
            .order_by("day")
        )

        return Response({
            "orders": list(orders),
            "revenue": list(revenue),
        })

    @action(detail=False, methods=["get"])
    def recent_orders(self, request):
        orders = Order.objects.select_related("customer").order_by("-created_at")[:5]
        data = [
            {
                "id": o.id,
                "customer": o.customer.full_name,
                "status": o.status,
                "amount": o.filled_amount,
                "date": o.created_at,
            }
            for o in orders
        ]
        return Response(data)

    @action(detail=False, methods=["get"])
    def recent_invoices(self, request):
        invoices = FinalInvoice.objects.select_related("recheck__customer").order_by("-finalized_at")[:5]
        data = [
            {
                "id": i.id,
                "customer": i.recheck.customer.full_name,
                "status": "Paid" if i.total > 0 else "Unpaid",
                "amount": i.total,
                "date": i.finalized_at,
            }
            for i in invoices
        ]
        return Response(data)

    @action(detail=False, methods=["get"])
    def alerts(self, request):
        pending_orders = Order.objects.filter(status="pending").count()
        overdue_invoices = FinalInvoice.objects.filter(
            finalized_at__lt=timezone.now() - timedelta(days=30)
        ).count()
        new_complaints = Complaint.objects.filter(status="new").count()

        return Response({
            "pending_orders": pending_orders,
            "overdue_invoices": overdue_invoices,
            "new_complaints": new_complaints,
        })

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        today = timezone.now().date()

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status="pending").count()
        total_revenue = FinalInvoice.objects.aggregate(total=Sum("total"))["total"] or 0
        active_customers = Customer.objects.count()

        wb = Workbook()
        ws = wb.active
        ws.title = "Dashboard Summary"

        ws.append(["Metric", "Value"])
        ws.append(["Total Orders", total_orders])
        ws.append(["Pending Orders", pending_orders])
        ws.append(["Total Revenue", total_revenue])
        ws.append(["Active Customers", active_customers])
        ws.append(["Generated At", str(today)])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="dashboard_summary.xlsx"'
        wb.save(response)
        return response
