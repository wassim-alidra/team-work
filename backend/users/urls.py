from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    ResendOTPView,
    CurrentUserView,
    ProfileImageView,
    ChangePasswordView,
    RequestPasswordResetOTPView,
    ConfirmPasswordResetOTPView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/image/', ProfileImageView.as_view(), name='profile-image-upload'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', RequestPasswordResetOTPView.as_view(), name='forgot-password'),
    path('reset-password/', ConfirmPasswordResetOTPView.as_view(), name='reset-password'),
]