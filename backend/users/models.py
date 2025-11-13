from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from hospitals.models import Hospital

class CustomUser(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    Every user is associated with a hospital (tenant) except superusers.
    """
    hospital = models.ForeignKey(
        Hospital, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='users',
        help_text="Hospital this user belongs to. Leave empty for superusers."
    )
    
    # Additional fields for hospital staff
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True,
        null=True
    )
    
    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Hospital Admin'),
            ('doctor', 'Doctor'),
            ('nurse', 'Nurse'),
            ('receptionist', 'Receptionist'),
            ('staff', 'General Staff'),
        ],
        default='staff'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.hospital.name if self.hospital else 'Superuser'})"

    def clean(self):
        """Validate that non-superusers have a hospital assigned."""
        from django.core.exceptions import ValidationError
        
        if not self.is_superuser and not self.hospital:
            raise ValidationError("Non-superusers must be assigned to a hospital.")
        
        super().clean()

    def save(self, *args, **kwargs):
        """Override save to ensure validation."""
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_hospital_admin(self):
        """Check if user is a hospital admin."""
        return self.role == 'admin' and self.hospital is not None

    @property
    def is_doctor(self):
        """Check if user is a doctor."""
        return self.role == 'doctor' and self.hospital is not None
