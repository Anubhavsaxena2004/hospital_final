from django.db import models
from django.core.validators import RegexValidator
from hospitals.models import Hospital

class Patient(models.Model):
    """
    Patient model with hospital-based multi-tenancy.
    Each patient belongs to a specific hospital.
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    # Multi-tenant field - REQUIRED
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='patients',
        help_text="Hospital this patient belongs to"
    )
    
    # Patient information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True)
    
    # Contact information
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    
    # Medical information
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True
    )
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    
    # Status and timestamps
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        # Ensure unique patient within each hospital
        unique_together = ['hospital', 'phone']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.hospital.name})"

    @property
    def full_name(self):
        """Get the full name of the patient."""
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        """Calculate patient's age."""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def clean(self):
        """Validate patient data."""
        from django.core.exceptions import ValidationError
        
        # Ensure patient belongs to a hospital
        if not self.hospital:
            raise ValidationError("Patient must be assigned to a hospital.")
        
        super().clean()

    def save(self, *args, **kwargs):
        """Override save to ensure validation."""
        self.clean()
        super().save(*args, **kwargs)
