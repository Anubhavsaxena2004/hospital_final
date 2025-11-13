from rest_framework import serializers
from .models import Bed


class BedSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = Bed
        fields = [
            'id', 'hospital', 'hospital_name', 'bed_number', 'bed_type',
            'is_occupied', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'hospital_name']


class BedListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = ['id', 'bed_number', 'bed_type', 'is_occupied']
