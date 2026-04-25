from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, CurrentUserView, ProfileImageView, ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/image/', ProfileImageView.as_view(), name='profile-image-upload'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]