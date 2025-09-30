from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from io import BytesIO
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from api.models import RecheckInvoice, FinalInvoice, User
from api.serializers import RecheckInvoiceSerializer, FinalInvoiceSerializer
from api.permissions import IsAdminOrManager, IsAccountant
from rest_framework.permissions import IsAuthenticated


class AdminRecheckViewSet(viewsets.ModelViewSet):
    queryset = RecheckInvoice.objects.all().order_by("-period_start")
    serializer_class = RecheckInvoiceSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer__full_name", "customer__phone", "customer__driver__username"]
    filterset_fields = ["status", "assigned_to"]
    ordering_fields = ["period_start", "total_gallons", "total_trips"]


    @action(detail=True, methods=["post"])
    def send_to_accountant(self, request, pk=None):
        recheck = self.get_object()
        if recheck.status != "draft":
            return Response({"detail": "Already sent."}, status=status.HTTP_400_BAD_REQUEST)

        accountant_id = request.data.get("accountant_id")
        if accountant_id:
            try:
                accountant = User.objects.get(id=accountant_id, role="accountant")
            except User.DoesNotExist:
                return Response({"detail": "Accountant not found."}, status=status.HTTP_404_NOT_FOUND)
            recheck.assigned_to = accountant

        recheck.status = "sent"
        recheck.save()
        serializer = self.get_serializer(recheck)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        qs = self.filter_queryset(self.get_queryset())
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Recheck Invoices"
        headers = ["Customer", "Phone", "Period Start", "Period End", "Total Trips", "Total Gallons", "Status"]
        ws.append(headers)

        for r in qs:
            ws.append([
                r.customer.full_name,
                r.customer.phone,
                r.period_start.strftime("%d/%m/%Y"),
                r.period_end.strftime("%d/%m/%Y"),
                r.total_trips,
                r.total_gallons,
                r.status
            ])

        out = BytesIO()
        wb.save(out)
        out.seek(0)
        response = HttpResponse(out.read(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = 'attachment; filename="recheck_invoices.xlsx"'
        return response


class AccountantInvoiceViewSet(viewsets.ModelViewSet):
    queryset = FinalInvoice.objects.select_related("recheck__customer").all().order_by("-finalized_at")
    serializer_class = FinalInvoiceSerializer
    permission_classes = [IsAuthenticated, IsAccountant]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["recheck__customer__full_name", "recheck__customer__phone", "recheck__customer__driver__username"]
    filterset_fields = ["recheck__period_start"]
    ordering_fields = ["finalized_at", "total"]

    def get_queryset(self):
        return self.queryset.filter(recheck__assigned_to=self.request.user)

    def create(self, request, *args, **kwargs):
        recheck_id = request.data.get("recheck")
        price = request.data.get("price_per_gallon")
        notes = request.data.get("notes", "")

        if not recheck_id or price is None:
            return Response({"detail": "recheck and price_per_gallon are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recheck = RecheckInvoice.objects.get(pk=recheck_id, status="sent", assigned_to=request.user)
        except RecheckInvoice.DoesNotExist:
            return Response({"detail": "Recheck not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        final = FinalInvoice.objects.create(
            recheck=recheck,
            created_by=request.user,
            price_per_gallon=price,
            notes=notes
        )
        serializer = self.get_serializer(final)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def export_excel(self, request, pk=None):
        final = self.get_object()
        recheck = final.recheck
        customer = recheck.customer

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Invoice_{customer.full_name}"

        # Header
        ws.append(["Customer", customer.full_name])
        ws.append(["Phone", customer.phone])
        ws.append(["Area", customer.area or ""])
        ws.append(["Account Number", customer.account_number or ""])
        ws.append([])
        ws.append(["Period Start", recheck.period_start.strftime("%d/%m/%Y")])
        ws.append(["Period End", recheck.period_end.strftime("%d/%m/%Y")])
        ws.append(["Total Trips", recheck.total_trips])
        ws.append(["Total Gallons", recheck.total_gallons])
        ws.append(["Price per Gallon", float(final.price_per_gallon)])
        ws.append(["Subtotal", float(final.subtotal)])
        ws.append(["VAT %", float(final.vat_percent)])
        ws.append(["VAT Amount", float(final.vat_amount)])
        ws.append(["Total", float(final.total)])
        if final.notes:
            ws.append([])
            ws.append(["Notes", final.notes])

        out = BytesIO()
        wb.save(out)
        out.seek(0)
        response = HttpResponse(out.read(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = f'attachment; filename="invoice_{final.id}.xlsx"'
        return response

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        final = self.get_object()
        recheck = final.recheck
        customer = recheck.customer

        p = canvas.Canvas(buffer, pagesize=A4)
        buffer = BytesIO()
        width, height = A4
        y = height - 50

        p.setFont("Helvetica-Bold", 14)
		# Header
        p.drawString(50, y, f"Invoice #{final.id}")
        y -= 25
        p.setFont("Helvetica", 10)
        p.drawString(50, y, f"Customer: {customer.full_name}")
        y -= 15
        p.drawString(50, y, f"Phone: {customer.phone or ''}")
        y -= 15
        p.drawString(50, y, f"Area: {customer.area or ''}")
        y -= 25

        # Table-like lines
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Period")
        p.drawString(150, y, "Trips")
        p.drawString(230, y, "Gallons")
        p.drawString(330, y, "Price/gal")
        p.drawString(430, y, "Line Total")
        y -= 15
        p.setFont("Helvetica", 10)

        line_total = final.subtotal
        period_str = f"{recheck.period_start.strftime('%d/%m/%Y')} → {recheck.period_end.strftime('%d/%m/%Y')}"
        p.drawString(50, y, period_str)
        p.drawString(150, y, str(recheck.total_trips))
        p.drawString(230, y, str(recheck.total_gallons))
        p.drawString(330, y, f"{final.price_per_gallon:.2f}")
        p.drawString(430, y, f"{line_total:.2f}")
        y -= 30

		# Summary
        p.drawString(330, y, "Subtotal:")
        p.drawString(430, y, f"{final.subtotal:.2f}")
        y -= 15
        p.drawString(330, y, f"VAT ({final.vat_percent}%):")
        p.drawString(430, y, f"{final.vat_amount:.2f}")
        y -= 15
        p.setFont("Helvetica-Bold", 11)
        p.drawString(330, y, "TOTAL:")
        p.drawString(430, y, f"{final.total:.2f}")
        y -= 30

        if final.notes:
             p.setFont("Helvetica", 9)
             p.drawString(50, y, f"Notes: {final.notes}")
             y -= 15

        p.showPage()
        p.save()
        buffer.seek(0)
        return HttpResponse(buffer.read(), content_type="application/pdf")