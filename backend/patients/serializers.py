# backend/patients/serializers.py

from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from .models import Patient
from hospitals.models import Hospital

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, used for retrieving user details.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration. Includes password confirmation and validation.
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, attrs):
        """
        Check that the two password entries match.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user with an encrypted password.
        """
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model in patient context."""
    class Meta:
        model = Hospital
        fields = ['id', 'name']

class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model with hospital information."""
    hospital = HospitalSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'hospital', 'first_name', 'last_name', 'full_name', 'date_of_birth', 
            'age', 'gender', 'blood_group', 'phone', 'email', 'address',
            'emergency_contact_name', 'emergency_contact_phone', 'medical_history',
            'allergies', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'hospital', 'created_at', 'updated_at']

class PatientCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new patients."""
    
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group',
            'phone', 'email', 'address', 'emergency_contact_name', 
            'emergency_contact_phone', 'medical_history', 'allergies'
        ]

    def validate_phone(self, value):
        """Validate phone number uniqueness within hospital."""
        request = self.context.get('request')
        if request and hasattr(request, 'hospital'):
            # Check if phone already exists for this hospital
            if Patient.objects.filter(hospital=request.hospital, phone=value).exists():
                raise serializers.ValidationError("A patient with this phone number already exists in this hospital.")
        return value

    def validate_email(self, value):
        """Validate email uniqueness within hospital if provided."""
        if value:
            request = self.context.get('request')
            if request and hasattr(request, 'hospital'):
                # Check if email already exists for this hospital
                if Patient.objects.filter(hospital=request.hospital, email=value).exists():
                    raise serializers.ValidationError("A patient with this email already exists in this hospital.")
        return value

class PatientUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating patient information."""
    
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group',
            'phone', 'email', 'address', 'emergency_contact_name', 
            'emergency_contact_phone', 'medical_history', 'allergies', 'is_active'
        ]

    def validate_phone(self, value):
        """Validate phone number uniqueness within hospital."""
        request = self.context.get('request')
        instance = self.instance
        
        if request and hasattr(request, 'hospital'):
            # Check if phone already exists for this hospital (excluding current instance)
            existing_patient = Patient.objects.filter(
                hospital=request.hospital, 
                phone=value
            ).exclude(id=instance.id if instance else None).first()
            
            if existing_patient:
                raise serializers.ValidationError("A patient with this phone number already exists in this hospital.")
        return value

    def validate_email(self, value):
        """Validate email uniqueness within hospital if provided."""
        if value:
            request = self.context.get('request')
            instance = self.instance
            
            if request and hasattr(request, 'hospital'):
                # Check if email already exists for this hospital (excluding current instance)
                existing_patient = Patient.objects.filter(
                    hospital=request.hospital, 
                    email=value
                ).exclude(id=instance.id if instance else None).first()
                
                if existing_patient:
                    raise serializers.ValidationError("A patient with this email already exists in this hospital.")
        return value

class PatientListSerializer(serializers.ModelSerializer):
    """Simplified serializer for patient lists."""
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'full_name', 'age', 'gender', 'phone', 'email', 
            'emergency_contact_name', 'is_active', 'created_at'
        ]
