from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Staff
from .serializers import StaffSerializer
from hospital_management.mixins import MultiTenantViewSetMixin

class StaffViewSet(MultiTenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        role = self.request.query_params.get('role', None)
        department = self.request.query_params.get('department', None)
        is_active = self.request.query_params.get('is_active', None)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(employee_id__icontains=search)
            )

        if role:
            queryset = queryset.filter(role=role)

        if department:
            queryset = queryset.filter(department=department)

        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        total_staff = queryset.count()
        active_staff = queryset.filter(is_active=True).count()
        role_distribution = {}
        department_distribution = {}

        for staff in queryset:
            role = staff.get_role_display()
            dept = staff.get_department_display()

            role_distribution[role] = role_distribution.get(role, 0) + 1
            department_distribution[dept] = department_distribution.get(dept, 0) + 1

        return Response({
            'total_staff': total_staff,
            'active_staff': active_staff,
            'inactive_staff': total_staff - active_staff,
            'role_distribution': role_distribution,
            'department_distribution': department_distribution,
        })

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        staff = self.get_object()
        staff.is_active = not staff.is_active
        staff.save()
        serializer = self.get_serializer(staff)
        return Response(serializer.data)
