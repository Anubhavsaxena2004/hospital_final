from rest_framework import serializers
from .models import Appointment
from patients.models import Patient
from doctors.models import Doctor

class AppointmentSerializer(serializers.ModelSerializer):
    """Full appointment serializer with all fields."""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    appointment_type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'hospital', 'hospital_name', 'patient', 'patient_name',
            'doctor', 'doctor_name', 'appointment_date', 'appointment_time',
            'duration_minutes', 'appointment_type', 'appointment_type_display',
            'status', 'status_display', 'symptoms', 'diagnosis', 'prescription',
            'notes', 'consultation_fee', 'is_paid', 'is_past', 'is_today',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'hospital_name', 
                           'patient_name', 'doctor_name', 'status_display', 
                           'appointment_type_display', 'is_past', 'is_today']

class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'patient', 'doctor', 'appointment_date', 'appointment_time',
            'duration_minutes', 'appointment_type', 'symptoms', 'notes',
            'consultation_fee'
        ]
    
    def validate(self, data):
        """Validate appointment data."""
        from django.utils import timezone
        from datetime import datetime
        
        # Check if doctor and patient belong to the same hospital
        if data['doctor'].hospital != data['patient'].hospital:
            raise serializers.ValidationError(
                "Doctor and patient must belong to the same hospital."
            )
        
        # Check if appointment is not in the past
        appointment_datetime = timezone.make_aware(
            datetime.combine(
                data['appointment_date'], 
                data['appointment_time']
            ),
            timezone.get_current_timezone()
        ) if timezone.is_naive(datetime.combine(data['appointment_date'], data['appointment_time'])) else datetime.combine(data['appointment_date'], data['appointment_time'])

        now_dt = timezone.localtime() if timezone.is_aware(appointment_datetime) else timezone.now()
        if appointment_datetime < now_dt:
            raise serializers.ValidationError(
                "Appointment cannot be scheduled in the past."
            )
        
        # Check for double booking
        existing_appointment = Appointment.objects.filter(
            doctor=data['doctor'],
            appointment_date=data['appointment_date'],
            appointment_time=data['appointment_time'],
            status__in=['scheduled', 'confirmed']
        ).first()
        
        if existing_appointment:
            raise serializers.ValidationError(
                "Doctor is already booked at this time."
            )
        
        return data

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'appointment_date', 'appointment_time', 'duration_minutes',
            'appointment_type', 'status', 'symptoms', 'diagnosis',
            'prescription', 'notes', 'consultation_fee', 'is_paid'
        ]

class AppointmentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing appointments."""
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    appointment_type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'doctor_name', 'appointment_date',
            'appointment_time', 'duration_minutes', 'appointment_type',
            'appointment_type_display', 'status', 'status_display',
            'consultation_fee', 'is_paid', 'is_past', 'is_today'
        ]

class AppointmentStatsSerializer(serializers.Serializer):
    """Serializer for appointment statistics."""
    total_appointments = serializers.IntegerField()
    scheduled_appointments = serializers.IntegerField()
    confirmed_appointments = serializers.IntegerField()
    completed_appointments = serializers.IntegerField()
    cancelled_appointments = serializers.IntegerField()
    today_appointments = serializers.IntegerField()
    upcoming_appointments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    hospital_name = serializers.CharField()
