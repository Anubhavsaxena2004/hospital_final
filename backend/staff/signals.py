from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Staff
from doctors.models import Doctor


@receiver(post_save, sender=Staff)
def create_or_sync_doctor_profile(sender, instance: Staff, created: bool, **kwargs):
    """
    Ensure a Doctor entry exists and is synced when Staff role is 'doctor'.
    If role changes away from 'doctor', deactivate related Doctor profile.
    """
    try:
        # Only act if staff is attached to a hospital and active
        if not instance.hospital:
            return

        if instance.role == 'doctor':
            # Try to find existing doctor by user or email/phone match
            # We require a user for Doctor; ensure a user exists
            User = get_user_model()
            user = getattr(instance, 'user', None)
            if user is None:
                # Create or fetch a user for this staff
                username = instance.email
                user, _ = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': instance.email,
                        'hospital': instance.hospital,
                        'role': 'doctor',
                        'is_active': instance.is_active,
                    }
                )

            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    'hospital': instance.hospital,
                    'first_name': instance.first_name,
                    'last_name': instance.last_name,
                    'specialization': 'general',
                    'license_number': f"AUTO-{instance.employee_id}",
                    'experience_years': 0,
                    'phone': instance.phone,
                    'email': instance.email,
                    'education': instance.qualifications or '',
                    'certifications': '',
                    'bio': '',
                    'consultation_fee': 0,
                    'is_available': True,
                    'is_active': instance.is_active,
                }
            )

            # Sync basic fields if already existed
            updated = False
            if doctor.hospital != instance.hospital:
                doctor.hospital = instance.hospital; updated = True
            if doctor.first_name != instance.first_name:
                doctor.first_name = instance.first_name; updated = True
            if doctor.last_name != instance.last_name:
                doctor.last_name = instance.last_name; updated = True
            if doctor.phone != instance.phone:
                doctor.phone = instance.phone; updated = True
            if doctor.email != instance.email:
                doctor.email = instance.email; updated = True
            if doctor.is_active != instance.is_active:
                doctor.is_active = instance.is_active; updated = True
            if updated:
                doctor.save()
        else:
            # If staff is no longer a doctor, deactivate the Doctor profile if exists
            try:
                # If Staff had a user mapping and corresponding doctor
                User = get_user_model()
                user = getattr(instance, 'user', None)
                if user:
                    doc = Doctor.objects.filter(user=user).first()
                    if doc and doc.is_active:
                        doc.is_active = False
                        doc.save()
            except Exception:
                pass
    except Exception:
        # Fail-safe: never break staff save due to sync issues
        return


