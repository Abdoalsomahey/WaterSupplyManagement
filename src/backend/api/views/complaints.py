from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from openpyxl import Workbook

from api.models import Complaint
from api.serializers import ComplaintSerializer
from api.permissions import IsAdminOrManager


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["id", "status", "customer", "resolution_status"]
    search_fields = ["issue", "customer__full_name", "customer__phone"]
    ordering_fields = ["created_at", "status", "resolution_status"]
    ordering = ["-created_at"]

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        complaint = self.get_object()
        resolution_text = request.data.get("resolution_text")
        resolution_image = request.FILES.get("resolution_image")

        if not resolution_text and not resolution_image:
            return Response(
                {"error": "Provide resolution text or image."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if resolution_text:
            complaint.resolution_text = resolution_text
        if resolution_image:
            complaint.resolution_image = resolution_image

        complaint.resolution_status = "resolved"
        complaint.save()
        return Response({"message": "Complaint resolved successfully"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        wb = Workbook()
        ws = wb.active
        ws.title = "Complaints"

        # العناوين
        ws.apppend([
			"ID", "Customer Name", "Customer Phone", "Area", "Zone Number",
			"Plot Number", "Property Type", "Account Number", "Starting Date",
			"Agreement Without Meter", "Weekly Trips", "Gallons", "Filling Stations",
			"Delivery Days", "Registration Date", "Issue", "Status",
			"Created At", "Resolution Text", "Resolution Image", "Resolution Status" 
		])

        for complaint in queryset:
            ws.append([
                complaint.id,
                complaint.customer.full_name,
                complaint.customer.phone,
                complaint.customer.area,
                complaint.customer.zone_number,
                complaint.customer.plot_number,
                complaint.customer.property_type,
                complaint.customer.account_number,
                complaint.customer.starting_date.strftime("%Y-%m-%d") if complaint.customer.starting_date else "",
                complaint.customer.agreement_without_meter,
                complaint.customer.weekly_trips,
                complaint.customer.gallons,
                complaint.customer.filling_stations,
                ", ".join(complaint.customer.delivery_days or []),
                complaint.customer.registration_date.strftime("%Y-%m-%d %H:%M") if complaint.customer.registration_date else "",
                complaint.issue,
                complaint.status,
                complaint.created_at.strftime("%Y-%m-%d %H:%M"),
                complaint.resolution_text or "",
                complaint.resolution_image.url if complaint.resolution_image else "",
                complaint.resolution_status,
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="complaints.xlsx"'
        wb.save(response)
        return response
