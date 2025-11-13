# Create your views here.
# backend/patients/views.py

from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

User = get_user_model()
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import Patient
from .serializers import (
    PatientSerializer, 
    PatientCreateSerializer, 
    PatientUpdateSerializer,
    PatientListSerializer
)
from hospital_management.mixins import (
    HospitalScopedListCreateView,
    HospitalScopedRetrieveUpdateDestroyView
)
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Allows any user (even unauthenticated) to create a new account.
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LogoutView(APIView):
    """
    API endpoint for user logout.
    Requires the user to be authenticated.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """
        Blacklists the refresh token to log the user out.
        """
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=204) # No Content
        except Exception as e:
            return Response(status=400) # Bad Request

class PatientListView(HospitalScopedListCreateView):
    """
    API endpoint for listing and creating patients.
    Automatically scoped to the user's hospital.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['gender', 'blood_group', 'is_active']
    search_fields = ['first_name', 'last_name', 'phone', 'email']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'date_of_birth']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method == 'POST':
            return PatientCreateSerializer
        return PatientListSerializer

    def create(self, request, *args, **kwargs):
        """Create a new patient with hospital assignment."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Ensure hospital is assigned using mixin logic
        self.perform_create(serializer)
        patient = serializer.instance

        # Return the full patient data
        response_serializer = PatientSerializer(patient)
        logger.info(f"Patient created: {patient.full_name} in hospital: {patient.hospital.name}")

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class PatientDetailView(HospitalScopedRetrieveUpdateDestroyView):
    """
    API endpoint for retrieving, updating, and deleting patients.
    Automatically scoped to the user's hospital.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_serializer_class(self):
        """Use different serializers for different operations."""
        if self.request.method in ['PUT', 'PATCH']:
            return PatientUpdateSerializer
        return PatientSerializer

    def update(self, request, *args, **kwargs):
        """Update patient information."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        patient = serializer.save()
        logger.info(f"Patient updated: {patient.full_name} in hospital: {patient.hospital.name}")
        
        # Return the full patient data
        response_serializer = PatientSerializer(patient)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Soft delete patient by setting is_active to False."""
        patient = self.get_object()
        patient.is_active = False
        patient.save()
        
        logger.info(f"Patient deactivated: {patient.full_name} in hospital: {patient.hospital.name}")
        
        return Response(
            {"message": f"Patient {patient.full_name} has been deactivated."}, 
            status=status.HTTP_200_OK
        )

class PatientSearchView(generics.ListAPIView):
    """
    API endpoint for searching patients within the user's hospital.
    """
    serializer_class = PatientListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']

    def get_queryset(self):
        """Filter patients by hospital."""
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            return Patient.objects.filter(hospital=hospital, is_active=True)
        return Patient.objects.none()

class PatientStatsView(generics.GenericAPIView):
    """
    API endpoint for patient statistics within the user's hospital.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get patient statistics for the hospital."""
        hospital = getattr(request, 'hospital', None)
        if not hospital:
            return Response(
                {"error": "No hospital context found."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get patient statistics
        total_patients = Patient.objects.filter(hospital=hospital, is_active=True).count()
        male_patients = Patient.objects.filter(hospital=hospital, is_active=True, gender='M').count()
        female_patients = Patient.objects.filter(hospital=hospital, is_active=True, gender='F').count()
        
        # Get patients by blood group
        blood_group_stats = {}
        for blood_group, _ in Patient.BLOOD_GROUP_CHOICES:
            count = Patient.objects.filter(
                hospital=hospital, 
                is_active=True, 
                blood_group=blood_group
            ).count()
            if count > 0:
                blood_group_stats[blood_group] = count
        
        # Get recent patients (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_patients = Patient.objects.filter(
            hospital=hospital, 
            is_active=True, 
            created_at__gte=thirty_days_ago
        ).count()
        
        stats = {
            'total_patients': total_patients,
            'male_patients': male_patients,
            'female_patients': female_patients,
            'blood_group_distribution': blood_group_stats,
            'recent_patients_30_days': recent_patients,
            'hospital_name': hospital.name
        }
        
        return Response(stats, status=status.HTTP_200_OK)
