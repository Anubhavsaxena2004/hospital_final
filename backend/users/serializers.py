from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from .models import CustomUser
from hospitals.models import Hospital

class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model."""
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'subscription_plan', 'is_active']

class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model."""
    hospital = HospitalSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'hospital', 'role', 'phone', 'is_active')
        read_only_fields = ('id', 'is_active')

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with hospital assignment."""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    hospital_id = serializers.IntegerField(required=True, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'hospital_id', 'role', 'phone')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        hospital_id = attrs.get('hospital_id')
        if not hospital_id:
            raise serializers.ValidationError({"hospital_id": "This field is required."})

        try:
            hospital = Hospital.objects.get(id=hospital_id, is_active=True)
            attrs['hospital'] = hospital
        except Hospital.DoesNotExist:
            raise serializers.ValidationError({"hospital_id": "Invalid or inactive hospital."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('hospital_id')  # we already replaced it with 'hospital'

        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            hospital=validated_data['hospital'],
            role=validated_data.get('role', 'staff'),
            phone=validated_data.get('phone', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for user login with hospital context."""
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    hospital_id = serializers.IntegerField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        hospital_id = attrs.get('hospital_id')

        if not (username and password and hospital_id):
            raise serializers.ValidationError('Must include username, password, and hospital ID.')

        try:
            user = CustomUser.objects.get(username=username, is_active=True)
            if not user.check_password(password):
                raise serializers.ValidationError('Invalid credentials.')
            if not user.hospital or user.hospital.id != hospital_id:
                raise serializers.ValidationError('Invalid hospital ID.')
            attrs['user'] = user
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')

        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates."""
    hospital = HospitalSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'hospital', 'role', 'phone')
        read_only_fields = ('id', 'username', 'hospital')

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance