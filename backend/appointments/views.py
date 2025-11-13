from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentListSerializer,
    AppointmentStatsSerializer
)
from hospital_management.mixins import (
    HospitalScopedListCreateView,
    HospitalScopedRetrieveUpdateDestroyView
)
import logging
from django.db import models

logger = logging.getLogger(__name__)

class AppointmentListView(HospitalScopedListCreateView):
    """
    API endpoint for listing and creating appointments.
    Automatically scoped to the user's hospital.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'appointment_type', 'is_paid']
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name']
    ordering_fields = ['appointment_date', 'appointment_time', 'created_at']
    ordering = ['-appointment_date', '-appointment_time']

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentListSerializer

    def create(self, request, *args, **kwargs):
        """Create a new appointment with hospital assignment."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Ensure hospital is assigned via mixin
        self.perform_create(serializer)
        appointment = serializer.instance
        
        # Return the full appointment data
        response_serializer = AppointmentSerializer(appointment)
        logger.info(f"Appointment created: {appointment} in hospital: {appointment.hospital.name}")
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class AppointmentDetailView(HospitalScopedRetrieveUpdateDestroyView):
    """
    API endpoint for retrieving, updating, and deleting appointments.
    Automatically scoped to the user's hospital.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method in ['PUT', 'PATCH']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer

    def update(self, request, *args, **kwargs):
        """Update appointment information."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        appointment = serializer.save()
        logger.info(f"Appointment updated: {appointment} in hospital: {appointment.hospital.name}")
        
        # Return the full appointment data
        response_serializer = AppointmentSerializer(appointment)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Cancel appointment by setting status to cancelled."""
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        
        logger.info(f"Appointment cancelled: {appointment} in hospital: {appointment.hospital.name}")
        
        return Response(
            {"message": f"Appointment has been cancelled."}, 
            status=status.HTTP_200_OK
        )

class AppointmentSearchView(generics.ListAPIView):
    """
    API endpoint for searching appointments within the user's hospital.
    """
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name']

    def get_queryset(self):
        """Filter appointments by hospital."""
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            return Appointment.objects.filter(hospital=hospital)
        return Appointment.objects.none()

class AppointmentStatsView(generics.GenericAPIView):
    """
    API endpoint for appointment statistics within the user's hospital.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get appointment statistics for the hospital."""
        hospital = getattr(request, 'hospital', None)
        if not hospital:
            return Response(
                {"error": "No hospital context found."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get appointment statistics
        total_appointments = Appointment.objects.filter(hospital=hospital).count()
        scheduled_appointments = Appointment.objects.filter(hospital=hospital, status='scheduled').count()
        confirmed_appointments = Appointment.objects.filter(hospital=hospital, status='confirmed').count()
        completed_appointments = Appointment.objects.filter(hospital=hospital, status='completed').count()
        cancelled_appointments = Appointment.objects.filter(hospital=hospital, status='cancelled').count()
        
        # Get today's appointments
        from django.utils import timezone
        today = timezone.now().date()
        today_appointments = Appointment.objects.filter(
            hospital=hospital, 
            appointment_date=today
        ).count()
        
        # Get upcoming appointments (next 7 days)
        from datetime import timedelta
        next_week = today + timedelta(days=7)
        upcoming_appointments = Appointment.objects.filter(
            hospital=hospital,
            appointment_date__gte=today,
            appointment_date__lte=next_week,
            status__in=['scheduled', 'confirmed']
        ).count()
        
        # Calculate total revenue
        total_revenue = Appointment.objects.filter(
            hospital=hospital,
            is_paid=True
        ).aggregate(total=models.Sum('consultation_fee'))['total'] or 0
        
        stats = {
            'total_appointments': total_appointments,
            'scheduled_appointments': scheduled_appointments,
            'confirmed_appointments': confirmed_appointments,
            'completed_appointments': completed_appointments,
            'cancelled_appointments': cancelled_appointments,
            'today_appointments': today_appointments,
            'upcoming_appointments': upcoming_appointments,
            'total_revenue': float(total_revenue),
            'hospital_name': hospital.name
        }
        
        return Response(stats, status=status.HTTP_200_OK)

class TodayAppointmentsView(generics.ListAPIView):
    """
    API endpoint for today's appointments within the user's hospital.
    """
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get today's appointments for the hospital."""
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            from django.utils import timezone
            today = timezone.now().date()
            return Appointment.objects.filter(
                hospital=hospital,
                appointment_date=today
            ).order_by('appointment_time')
        return Appointment.objects.none()

class UpcomingAppointmentsView(generics.ListAPIView):
    """
    API endpoint for upcoming appointments within the user's hospital.
    """
    serializer_class = AppointmentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get upcoming appointments for the hospital."""
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            next_week = today + timedelta(days=7)
            return Appointment.objects.filter(
                hospital=hospital,
                appointment_date__gte=today,
                appointment_date__lte=next_week,
                status__in=['scheduled', 'confirmed']
            ).order_by('appointment_date', 'appointment_time')
        return Appointment.objects.none()
