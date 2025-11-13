from django.db import models
from django.conf import settings
from hospitals.models import Hospital

class Staff(models.Model):
    ROLE_CHOICES = [
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('admin', 'Administrator'),
        ('receptionist', 'Receptionist'),
        ('pharmacist', 'Pharmacist'),
        ('technician', 'Technician'),
        ('manager', 'Manager'),
        ('other', 'Other'),
    ]

    DEPARTMENT_CHOICES = [
        ('emergency', 'Emergency'),
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('surgery', 'Surgery'),
        ('radiology', 'Radiology'),
        ('pharmacy', 'Pharmacy'),
        ('administration', 'Administration'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    # Multi-tenant field - associate staff to a hospital
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='staff_members', null=True, blank=True)
    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='other')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='other')
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    address = models.TextField(blank=True)
    qualifications = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Staff Member'
        verbose_name_plural = 'Staff Members'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.get_role_display()}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
