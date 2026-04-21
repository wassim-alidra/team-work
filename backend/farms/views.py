from rest_framework import viewsets, permissions, status
from .models import Farm
from .serializers import FarmSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Farmers only see their own farms
        return Farm.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'FARMER':
            raise permissions.PermissionDenied("Only farmers can create farms.")
        
        # Limit to 5 farms
        if Farm.objects.filter(farmer=self.request.user).count() >= 5:
            raise status.ValidationError({"detail": "Maximum of 5 farms allowed per farmer."})
            
        serializer.save(farmer=self.request.user)
