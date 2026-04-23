from rest_framework import serializers
from .models import Farm

class FarmSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Farm
        fields = ('id', 'farmer', 'farmer_name', 'name', 'wilaya', 'location', 'image', 'is_approved', 'created_at')
        read_only_fields = ('id', 'farmer', 'is_approved', 'created_at')

    def get_farmer_name(self, obj):
        return obj.farmer.username if obj.farmer else None

    def update(self, instance, validated_data):
        # Prevent wilaya from being changed
        validated_data.pop('wilaya', None)
        return super().update(instance, validated_data)
