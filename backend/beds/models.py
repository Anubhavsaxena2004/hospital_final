from django.db import models
from hospitals.models import Hospital


class Bed(models.Model):
    BED_TYPE_CHOICES = [
        ('general', 'General'),
        ('icu', 'ICU'),
        ('emergency', 'Emergency'),
        ('pediatric', 'Pediatric'),
        ('private', 'Private'),
    ]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=50)
    bed_type = models.CharField(max_length=20, choices=BED_TYPE_CHOICES, default='general')
    is_occupied = models.BooleanField(default=False, db_index=True)
    # Reservation fields for incoming incidents
    is_reserved_for_incident = models.BooleanField(default=False, db_index=True)
    reserved_incident_id = models.IntegerField(null=True, blank=True, db_index=True)
    reserved_expiry_time = models.DateTimeField(null=True, blank=True)
    severity_level = models.CharField(max_length=20, default='medium', db_index=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['hospital', 'bed_number']
        ordering = ['bed_type', 'bed_number']

    def __str__(self):
        return f"{self.hospital.name} - {self.bed_type} #{self.bed_number}"
