from rest_framework import serializers
from .models import Doctor
from users.models import CustomUser

class DoctorSerializer(serializers.ModelSerializer):
    """Full doctor serializer with all fields."""
    full_name = serializers.ReadOnlyField()
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'hospital', 'hospital_name', 'user', 'user_email',
            'first_name', 'last_name', 'full_name', 'specialization',
            'license_number', 'experience_years', 'phone', 'email',
            'education', 'certifications', 'bio', 'consultation_fee',
            'is_available', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'hospital_name', 'user_email']

class DoctorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating doctors."""
    user_email = serializers.EmailField(write_only=True)
    user_password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = Doctor
        fields = [
            'user_email', 'user_password', 'first_name', 'last_name',
            'specialization', 'license_number', 'experience_years',
            'phone', 'email', 'education', 'certifications', 'bio',
            'consultation_fee', 'is_available'
        ]
    
    def create(self, validated_data):
        """Create doctor and associated user account."""
        user_email = validated_data.pop('user_email')
        user_password = validated_data.pop('user_password')
        
        # Create user account
        user = CustomUser.objects.create_user(
            username=user_email,
            email=user_email,
            password=user_password,
            hospital=self.context['request'].hospital
        )
        
        # Create doctor profile
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

class DoctorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating doctors."""
    
    class Meta:
        model = Doctor
        fields = [
            'first_name', 'last_name', 'specialization', 'license_number',
            'experience_years', 'phone', 'email', 'education', 'certifications',
            'bio', 'consultation_fee', 'is_available', 'is_active'
        ]

class DoctorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing doctors."""
    full_name = serializers.ReadOnlyField()
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'full_name', 'specialization', 'specialization_display',
            'license_number', 'experience_years', 'phone', 'email',
            'consultation_fee', 'is_available', 'is_active'
        ]
