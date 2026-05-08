from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import FireAlert
from farms.models import Farm
from market.models import Notification
from rest_framework.permissions import AllowAny

class FireAlertView(APIView):
    permission_classes = [AllowAny]  # IoT devices might not have easy JWT handling

    def post(self, request, farm_id):
        farm = get_object_or_404(Farm, id=farm_id)
        
        # Create fire alert record
        alert = FireAlert.objects.create(farm=farm)
        
        # Create notification for the farmer
        Notification.objects.create(
            recipient=farm.farmer,
            message=f"🔥 CRITICAL ALERT: Fire detected at your farm '{farm.name}'! Please check immediately."
        )
        
        return Response({"status": "Alert received and notification sent"}, status=status.HTTP_201_CREATED)

class ActiveFireAlertsView(APIView):
    # This will be used by the frontend to poll for active alerts
    def get(self, request):
        active_alerts = FireAlert.objects.filter(farm__farmer=request.user, is_resolved=False).order_by('-timestamp')
        return Response({
            "has_fire": active_alerts.exists(),
            "alerts": [
                {
                    "id": a.id,
                    "farm_name": a.farm.name,
                    "timestamp": a.timestamp
                } for a in active_alerts
            ]
        })

class ResolveFireAlertView(APIView):
    def post(self, request, alert_id):
        alert = get_object_or_404(FireAlert, id=alert_id, farm__farmer=request.user)
        alert.is_resolved = True
        alert.save()
        return Response({"status": "Alert marked as resolved"})
