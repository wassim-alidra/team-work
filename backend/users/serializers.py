from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import FarmerProfile, BuyerProfile, TransporterProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = '__all__'

class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = '__all__'

class TransporterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransporterProfile
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)
    
    # Optional profile fields
    farm_name = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    vehicle_type = serializers.CharField(required=False, allow_blank=True)
    license_plate = serializers.CharField(required=False, allow_blank=True)
    capacity = serializers.FloatField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'farm_name', 'location', 
                  'company_name', 'vehicle_type', 'license_plate', 'capacity')

    def create(self, validated_data):
        role = validated_data.get('role')
        # Extract profile data
        profile_data = {k: v for k, v in validated_data.items() if k not in ['username', 'email', 'password', 'role']}
        user_data = {k: v for k, v in validated_data.items() if k in ['username', 'email', 'password', 'role']}
        
        user = User.objects.create_user(**user_data)

        if role == User.Role.FARMER:
            FarmerProfile.objects.create(
                user=user,
                farm_name=profile_data.get('farm_name', ''),
                location=profile_data.get('location', '')
            )
        elif role == User.Role.BUYER:
            BuyerProfile.objects.create(
                user=user,
                company_name=profile_data.get('company_name', '')
            )
        elif role == User.Role.TRANSPORTER:
            TransporterProfile.objects.create(
                user=user,
                vehicle_type=profile_data.get('vehicle_type', ''),
                license_plate=profile_data.get('license_plate', ''),
                capacity=profile_data.get('capacity', 0)
            )
        
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # We check the user object directly before the standard validation attempts authentication.
        # This prevents the generic "No active account found" error from hiding our specific messages.
        username = attrs.get(self.username_field)
        password = attrs.get("password")
        
        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            if hasattr(user, 'is_deleted') and user.is_deleted:
                raise AuthenticationFailed("This account has been deleted and is no longer accessible.")
            if not user.is_active:
                raise AuthenticationFailed("Your account has been suspended. Please contact the administrator.")
                
        return super().validate(attrs)
