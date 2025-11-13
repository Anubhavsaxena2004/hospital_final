from django.db import models
from django.core.validators import MinValueValidator
from hospitals.models import Hospital
from patients.models import Patient
from doctors.models import Doctor

class Appointment(models.Model):
    """
    Appointment model with hospital-based multi-tenancy.
    Each appointment belongs to a specific hospital.
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    APPOINTMENT_TYPE_CHOICES = [
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow Up'),
        ('emergency', 'Emergency'),
        ('routine_checkup', 'Routine Checkup'),
        ('surgery', 'Surgery'),
        ('lab_test', 'Lab Test'),
        ('imaging', 'Imaging'),
        ('therapy', 'Therapy'),
    ]
    
    # Multi-tenant field - REQUIRED
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text="Hospital this appointment belongs to"
    )
    
    # Appointment details
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text="Patient for this appointment"
    )
    
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text="Doctor for this appointment"
    )
    
    # Appointment information
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(15)],
        help_text="Duration in minutes"
    )
    
    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPE_CHOICES,
        default='consultation'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    
    # Notes and description
    symptoms = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Financial information
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    is_paid = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'appointments'
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'
        ordering = ['-appointment_date', '-appointment_time']
        # Ensure no double booking for same doctor at same time
        unique_together = ['doctor', 'appointment_date', 'appointment_time']

    def __str__(self):
        return f"{self.patient.full_name} - Dr. {self.doctor.last_name} ({self.appointment_date})"

    @property
    def is_past(self):
        """Check if appointment is in the past."""
        from django.utils import timezone
        from datetime import datetime
        appointment_datetime = timezone.make_aware(datetime.combine(self.appointment_date, self.appointment_time))
        return appointment_datetime < timezone.now()

    @property
    def is_today(self):
        """Check if appointment is today."""
        from django.utils import timezone
        return self.appointment_date == timezone.now().date()

    def clean(self):
        """Validate appointment data."""
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        from datetime import datetime
        
        # Ensure appointment belongs to a hospital
        if not self.hospital:
            raise ValidationError("Appointment must be assigned to a hospital.")
        
        # Ensure patient and doctor belong to the same hospital
        if self.patient and self.patient.hospital != self.hospital:
            raise ValidationError("Patient must belong to the same hospital.")
        
        if self.doctor and self.doctor.hospital != self.hospital:
            raise ValidationError("Doctor must belong to the same hospital.")
        
        # Ensure appointment is not in the past
        if self.appointment_date and self.appointment_time:
            appointment_datetime = timezone.make_aware(datetime.combine(self.appointment_date, self.appointment_time))
            if appointment_datetime < timezone.now():
                raise ValidationError("Appointment cannot be scheduled in the past.")
        
        super().clean()

    def save(self, *args, **kwargs):
        """Override save to ensure validation."""
        self.clean()
        super().save(*args, **kwargs)
