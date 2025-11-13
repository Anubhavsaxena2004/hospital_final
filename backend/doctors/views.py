from django.shortcuts import render
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor
from .serializers import (
    DoctorSerializer,
    DoctorCreateSerializer,
    DoctorUpdateSerializer,
    DoctorListSerializer
)
from hospital_management.mixins import (
    HospitalScopedListCreateView,
    HospitalScopedRetrieveUpdateDestroyView
)
import logging
from django.db import models

logger = logging.getLogger(__name__)

class DoctorListView(HospitalScopedListCreateView):
    """
    API endpoint for listing and creating doctors.
    Automatically scoped to the user's hospital.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['specialization', 'is_available', 'is_active']
    search_fields = ['first_name', 'last_name', 'license_number', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'experience_years', 'consultation_fee', 'created_at']
    ordering = ['first_name', 'last_name']

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method == 'POST':
            return DoctorCreateSerializer
        return DoctorListSerializer

    def create(self, request, *args, **kwargs):
        """Create a new doctor with hospital assignment."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # The hospital will be automatically assigned by the mixin
        doctor = serializer.save()
        
        # Return the full doctor data
        response_serializer = DoctorSerializer(doctor)
        logger.info(f"Doctor created: {doctor.full_name} in hospital: {doctor.hospital.name}")
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class DoctorDetailView(HospitalScopedRetrieveUpdateDestroyView):
    """
    API endpoint for retrieving, updating, and deleting doctors.
    Automatically scoped to the user's hospital.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorUpdateSerializer
        return DoctorSerializer

    def update(self, request, *args, **kwargs):
        """Update doctor information."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        doctor = serializer.save()
        logger.info(f"Doctor updated: {doctor.full_name} in hospital: {doctor.hospital.name}")
        
        # Return the full doctor data
        response_serializer = DoctorSerializer(doctor)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete doctor by setting is_active to False."""
        doctor = self.get_object()
        doctor.is_active = False
        doctor.save()
        
        logger.info(f"Doctor deactivated: {doctor.full_name} in hospital: {doctor.hospital.name}")
        
        return Response(
            {"message": f"Doctor {doctor.full_name} has been deactivated."}, 
            status=status.HTTP_200_OK
        )

class DoctorSearchView(generics.ListAPIView):
    """
    API endpoint for searching doctors within the user's hospital.
    """
    serializer_class = DoctorListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'license_number', 'email', 'phone']

    def get_queryset(self):
        """Filter doctors by hospital."""
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            return Doctor.objects.filter(hospital=hospital, is_active=True)
        return Doctor.objects.none()

class DoctorStatsView(generics.GenericAPIView):
    """
    API endpoint for doctor statistics within the user's hospital.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get doctor statistics for the hospital."""
        hospital = getattr(request, 'hospital', None)
        if not hospital:
            return Response(
                {"error": "No hospital context found."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get doctor statistics
        total_doctors = Doctor.objects.filter(hospital=hospital, is_active=True).count()
        available_doctors = Doctor.objects.filter(hospital=hospital, is_active=True, is_available=True).count()
        
        # Get doctors by specialization
        specialization_stats = {}
        for specialization, _ in Doctor.SPECIALIZATION_CHOICES:
            count = Doctor.objects.filter(
                hospital=hospital, 
                is_active=True, 
                specialization=specialization
            ).count()
            if count > 0:
                specialization_stats[specialization] = count
        
        # Get recent doctors (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_doctors = Doctor.objects.filter(
            hospital=hospital, 
            is_active=True, 
            created_at__gte=thirty_days_ago
        ).count()
        
        # Calculate average consultation fee
        avg_consultation_fee = Doctor.objects.filter(
            hospital=hospital, 
            is_active=True
        ).aggregate(avg_fee=models.Avg('consultation_fee'))['avg_fee'] or 0
        
        stats = {
            'total_doctors': total_doctors,
            'available_doctors': available_doctors,
            'specialization_distribution': specialization_stats,
            'recent_doctors_30_days': recent_doctors,
            'average_consultation_fee': float(avg_consultation_fee),
            'hospital_name': hospital.name
        }
        
        return Response(stats, status=status.HTTP_200_OK)
