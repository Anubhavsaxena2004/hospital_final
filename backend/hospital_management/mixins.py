from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied
from django.db import models
import logging

logger = logging.getLogger(__name__)

class HospitalScopedMixin:
    """
    Mixin to automatically scope querysets to the user's hospital.
    This ensures data isolation between different hospitals.
    """
    
    def get_queryset(self):
        """
        Filter queryset to only include data from the user's hospital.
        """
        queryset = super().get_queryset()
        
        # Get hospital from request (set by middleware)
        hospital = getattr(self.request, 'hospital', None)
        
        if hospital:
            # Filter by hospital
            if hasattr(queryset.model, 'hospital'):
                queryset = queryset.filter(hospital=hospital)
                logger.debug(f"Filtering {queryset.model.__name__} by hospital: {hospital.name}")
            else:
                logger.warning(f"Model {queryset.model.__name__} does not have hospital field")
        else:
            # No hospital context - this could be a superuser or unauthenticated request
            if hasattr(self.request, 'user') and self.request.user.is_authenticated:
                if not self.request.user.is_superuser:
                    logger.warning(f"User {self.request.user.username} has no hospital context")
                    raise PermissionDenied("Access denied: No hospital context found.")
        
        return queryset

    def perform_create(self, serializer):
        """
        Automatically assign the hospital when creating new objects.
        """
        hospital = getattr(self.request, 'hospital', None)
        
        if hospital:
            serializer.save(hospital=hospital)
            logger.info(f"Created {serializer.Meta.model.__name__} for hospital: {hospital.name}")
        else:
            # For superusers, they need to explicitly provide hospital
            if hasattr(self.request, 'user') and self.request.user.is_superuser:
                serializer.save()
            else:
                raise PermissionDenied("Access denied: No hospital context found.")

class HospitalPermissionMixin:
    """
    Mixin to add hospital-specific permissions.
    """
    
    def check_hospital_permission(self, obj):
        """
        Check if the user has permission to access the object based on hospital.
        """
        if not hasattr(self.request, 'user') or not self.request.user.is_authenticated:
            return False
        
        # Superusers can access everything
        if self.request.user.is_superuser:
            return True
        
        # Get user's hospital
        user_hospital = getattr(self.request.user, 'hospital', None)
        if not user_hospital:
            return False
        
        # Check if object belongs to user's hospital
        if hasattr(obj, 'hospital'):
            return obj.hospital == user_hospital
        
        return False

    def get_object(self):
        """
        Override get_object to check hospital permissions.
        """
        obj = super().get_object()
        
        if not self.check_hospital_permission(obj):
            raise PermissionDenied("Access denied: You can only access data from your assigned hospital.")
        
        return obj

class MultiTenantViewSetMixin:
    """
    Mixin for ViewSets to handle multi-tenancy.
    """
    
    def get_queryset(self):
        """
        Filter queryset by hospital.
        """
        queryset = super().get_queryset()
        hospital = getattr(self.request, 'hospital', None)
        
        if hospital and hasattr(queryset.model, 'hospital'):
            queryset = queryset.filter(hospital=hospital)
        
        return queryset

    def perform_create(self, serializer):
        """
        Assign hospital when creating objects.
        """
        hospital = getattr(self.request, 'hospital', None)
        if hospital:
            serializer.save(hospital=hospital)
        else:
            serializer.save()

class HospitalScopedListCreateView(HospitalScopedMixin, generics.ListCreateAPIView):
    """
    Base view for list and create operations with hospital scoping.
    """
    permission_classes = [IsAuthenticated]

class HospitalScopedRetrieveUpdateDestroyView(HospitalScopedMixin, HospitalPermissionMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Base view for retrieve, update, and destroy operations with hospital scoping.
    """
    permission_classes = [IsAuthenticated]
