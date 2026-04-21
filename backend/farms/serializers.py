from rest_framework import serializers
from .models import Farm

class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ('id', 'name', 'wilaya', 'location', 'created_at')
        read_only_fields = ('id', 'created_at')
