from django.urls import path
from .views import WeatherDashboardView

urlpatterns = [
    path('', WeatherDashboardView.as_view(), name='weather-dashboard'),
]
