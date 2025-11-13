from django.db import models
from django.core.validators import RegexValidator

class Hospital(models.Model):
    """
    Hospital model representing a tenant in the multi-tenant SaaS system.
    Each hospital is a separate tenant with isolated data.
    """
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    email = models.EmailField(unique=True)
    # Geolocation for hospital (used by locator/ranking)
    lat = models.FloatField(null=True, blank=True, db_index=True)
    lng = models.FloatField(null=True, blank=True, db_index=True)
    # Notification / alerting defaults for this hospital
    alert_family_enabled = models.BooleanField(default=True)
    alert_police_enabled = models.BooleanField(default=False)
    # Optional SLA / ETA tuning: average_handling_minutes helps locator estimate capacity
    average_handling_minutes = models.PositiveIntegerField(default=15)
    subscription_plan = models.CharField(
        max_length=20,
        choices=[
            ('basic', 'Basic'),
            ('premium', 'Premium'),
            ('enterprise', 'Enterprise'),
        ],
        default='basic'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospitals'
        verbose_name = 'Hospital'
        verbose_name_plural = 'Hospitals'

    def __str__(self):
        return self.name

    @property
    def patient_count(self):
        """Get the number of patients for this hospital."""
        return self.patients.count()

    @property
    def doctor_count(self):
        """Get the number of doctors for this hospital."""
        return self.doctors.count()

    def available_beds_summary(self):
        """Return a simple summary dict of available beds grouped by type."""
        summary = {}
        for bed in self.beds.filter(is_occupied=False, is_reserved_for_incident=False).values('bed_type'):
            summary.setdefault(bed['bed_type'], 0)
            summary[bed['bed_type']] += 1
        return summary
