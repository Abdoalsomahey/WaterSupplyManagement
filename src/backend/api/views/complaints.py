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
    filterset_fields = ["status", "priority", "customer"]
    search_fields = ["issue", "customer__full_name", "customer__phone"]
    ordering_fields = ["created_at", "priority"]
    ordering = ["-created_at"]

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        complaint = self.get_object()
        complaint.status = "resolved"
        complaint.save()
        return Response({"message": "Complaint resolved successfully"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def export_excel(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        wb = Workbook()
        ws = wb.active
        ws.title = "Complaints"

        # العناوين
        ws.append(["ID", "Customer", "Phone", "Issue", "Priority", "Status", "Date", "Order"])

        for complaint in queryset:
            ws.append([
                complaint.id,
                complaint.customer.full_name if complaint.customer else "",
                complaint.customer.phone if complaint.customer else "",
                complaint.issue,
                complaint.priority,
                complaint.status,
                complaint.created_at.strftime("%Y-%m-%d %H:%M"),
                complaint.order.id if complaint.order else "",
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="complaints.xlsx"'
        wb.save(response)
        return response
