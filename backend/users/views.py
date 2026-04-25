from rest_framework import permissions, status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    TransporterProfileSerializer,
    ChangePasswordSerializer,
)


from farms.serializers import FarmSerializer
from farms.models import Farm

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]






class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data

        if request.user.role == User.Role.FARMER and hasattr(request.user, 'farmer_profile'):
            data['profile'] = {
                'id': request.user.farmer_profile.id,
                'farm_name': request.user.farmer_profile.farm_name,
                'location': request.user.farmer_profile.location,
                'farms': FarmSerializer(request.user.farms.all(), many=True).data
            }

        elif request.user.role == User.Role.BUYER and hasattr(request.user, 'buyer_profile'):
            data['profile'] = {
                'id': request.user.buyer_profile.id,
                'company_name': request.user.buyer_profile.company_name
            }

        elif request.user.role == User.Role.TRANSPORTER and hasattr(request.user, 'transporter_profile'):
            data['profile'] = {
                'id': request.user.transporter_profile.id,
                'vehicle_type': request.user.transporter_profile.vehicle_type,
                'license_plate': request.user.transporter_profile.license_plate,
                'capacity': request.user.transporter_profile.capacity
            }

        return Response(data)

    def patch(self, request):
        user = request.user

        if user.role == User.Role.TRANSPORTER:
            profile = user.transporter_profile
            serializer = TransporterProfileSerializer(profile, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"error": "Profile update only implemented for transporters for now."},
            status=403
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ProfileImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        if 'profile_image' not in request.FILES:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES['profile_image']
        
        # Limit file size: 2MB
        if image.size > 2 * 1024 * 1024:
            return Response({"error": "Image size too large (max 2MB)."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Allow only jpg, png, webp
        ext = image.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'webp']:
            return Response({"error": "Invalid image format (only jpg, jpeg, png, webp allowed)."}, status=status.HTTP_400_BAD_REQUEST)

        user.profile_image = image
        user.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Current password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
            
            if serializer.data.get("old_password") == serializer.data.get("new_password"):
                return Response({"new_password": ["New password must be different from current password."]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)