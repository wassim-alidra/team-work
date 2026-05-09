from django.urls import path
from .views import FireAlertView, ActiveFireAlertsView, ResolveFireAlertView

urlpatterns = [
    path('fire-alert/<int:farm_id>/', FireAlertView.as_view(), name='fire-alert'),
    path('active-alerts/', ActiveFireAlertsView.as_view(), name='active-alerts'),
    path('resolve-alert/<int:alert_id>/', ResolveFireAlertView.as_view(), name='resolve-alert'),
]
