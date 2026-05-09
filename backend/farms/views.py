from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from .models import Farm
from .serializers import FarmSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Admins (Ministers) see all farms
        if getattr(self.request.user, 'role', None) == 'ADMIN':
            return Farm.objects.all().select_related('farmer')
        # Farmers only see their own farms
        return Farm.objects.filter(farmer=self.request.user).select_related('farmer')

    def perform_create(self, serializer):
        if self.request.user.role != 'FARMER':
            raise permissions.PermissionDenied("Only farmers can create farms.")

        # Limit to 5 farms
        if Farm.objects.filter(farmer=self.request.user).count() >= 5:
            raise ValidationError({"detail": "Maximum of 5 farms allowed per farmer."})

        farm = serializer.save(farmer=self.request.user, is_approved=False)

        # Notify all admins that a new farm is waiting for approval
        try:
            from market.models import Notification
            admins = User.objects.filter(role='ADMIN')
            notifications = [
                Notification(
                    recipient=admin,
                    message=f"New farm '{farm.name}' submitted by {self.request.user.username} is awaiting approval."
                )
                for admin in admins
            ]
            if notifications:
                Notification.objects.bulk_create(notifications)
        except Exception:
            pass  # Don't block farm creation if notification fails

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'ADMIN':
            raise permissions.PermissionDenied("Only admins can approve farms.")
        farm = self.get_object()
        farm.is_approved = True
        farm.save()

        # Notify the farmer
        try:
            from market.models import Notification
            Notification.objects.create(
                recipient=farm.farmer,
                message=f"Your farm '{farm.name}' has been approved by the Ministry and is now active on the platform."
            )
        except Exception:
            pass

        return Response({'status': 'farm approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'ADMIN':
            raise permissions.PermissionDenied("Only admins can reject farms.")
        farm = self.get_object()
        farmer = farm.farmer
        farm_name = farm.name
        farm.delete()

        # Notify the farmer
        try:
            from market.models import Notification
            Notification.objects.create(
                recipient=farmer,
                message=f"Your farm registration '{farm_name}' was not approved by the Ministry. Please contact support for more details."
            )
        except Exception:
            pass

        return Response({'status': 'farm rejected'})

