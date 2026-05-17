from django.urls import path
from .views import WeatherDashboardView, DeviceControlView

urlpatterns = [
    path('', WeatherDashboardView.as_view(), name='weather-dashboard'),
    path('device-control/', DeviceControlView.as_view(), name='device-control'),
]