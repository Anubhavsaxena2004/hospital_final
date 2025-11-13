from django.db import models
from django.core.validators import RegexValidator
from hospitals.models import Hospital
from users.models import CustomUser

class Doctor(models.Model):
    """
    Doctor model with hospital-based multi-tenancy.
    Each doctor belongs to a specific hospital.
    """
    SPECIALIZATION_CHOICES = [
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('dermatology', 'Dermatology'),
        ('psychiatry', 'Psychiatry'),
        ('surgery', 'Surgery'),
        ('emergency', 'Emergency Medicine'),
        ('internal_medicine', 'Internal Medicine'),
        ('radiology', 'Radiology'),
        ('oncology', 'Oncology'),
        ('gynecology', 'Gynecology'),
        ('ophthalmology', 'Ophthalmology'),
        ('ent', 'ENT'),
        ('general', 'General Medicine'),
    ]
    
    # Multi-tenant field - REQUIRED
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='doctors',
        help_text="Hospital this doctor belongs to"
    )
    
    # Link to user account
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
        help_text="Associated user account"
    )
    
    # Doctor information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    license_number = models.CharField(max_length=50, unique=True)
    experience_years = models.PositiveIntegerField(default=0)
    
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
    email = models.EmailField()
    
    # Professional information
    education = models.TextField()
    certifications = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    
    # Schedule and availability
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True)
    
    # Status and timestamps
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'
        # Ensure unique doctor within each hospital
        unique_together = ['hospital', 'license_number']
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.hospital.name})"

    @property
    def full_name(self):
        """Get the full name of the doctor."""
        return f"Dr. {self.first_name} {self.last_name}"

    def clean(self):
        """Validate doctor data."""
        from django.core.exceptions import ValidationError
        
        # Ensure doctor belongs to a hospital
        if not self.hospital:
            raise ValidationError("Doctor must be assigned to a hospital.")
        
        # Ensure user is associated with the same hospital
        if self.user and self.user.hospital != self.hospital:
            raise ValidationError("Doctor's user account must belong to the same hospital.")
        
        super().clean()

    def save(self, *args, **kwargs):
        """Override save to ensure validation."""
        self.clean()
        super().save(*args, **kwargs)
