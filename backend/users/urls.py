from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]