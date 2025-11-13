from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Staff

class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    class Meta:
        model = Staff
        fields = [
            'id',
            'user',
            'full_name',
            'employee_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'department',
            'hire_date',
            'salary',
            'is_active',
            'address',
            'qualifications',
            'emergency_contact_name',
            'emergency_contact_phone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    @transaction.atomic
    def create(self, validated_data):
        """
        Create a related user automatically if none is provided.
        The created user will:
          - have username set to the email
          - be associated to the current request's hospital (if any)
          - have role roughly aligned with staff role
        """
        UserModel = get_user_model()

        request = self.context.get('request')
        hospital = getattr(request, 'hospital', None) if request else None

        email = validated_data.get('email')
        phone = validated_data.get('phone', '')
        role = validated_data.get('role', 'staff')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        # Create a basic user tied to the same hospital
        # If a user with this username already exists, reuse it
        # Validate role against user model choices if available
        try:
            role_field = UserModel._meta.get_field('role')
            role_choices = {choice[0] for choice in getattr(role_field, 'choices', [])}
        except Exception:
            role_choices = set()

        user_role = role if (role and role in role_choices) else getattr(role_field, 'default', 'staff') if role_choices else 'staff'

        user, _created = UserModel.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'role': user_role,
                'hospital': hospital if hospital else None,
            }
        )

        # Ensure names/phone/role are up to date if user existed
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        if hasattr(user, 'phone'):
            user.phone = phone
        if hasattr(user, 'role') and user_role:
            user.role = user_role
        if hospital and hasattr(user, 'hospital'):
            user.hospital = hospital
        user.set_unusable_password()
        user.save()

        # Do not pass hospital explicitly here because the ViewSet's perform_create
        # injects it via serializer.save(hospital=...). It will be present in validated_data.
        staff = Staff.objects.create(user=user, **validated_data)
        return staff
