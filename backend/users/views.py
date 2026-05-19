import random
import string

from rest_framework import permissions, status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    TransporterProfileSerializer,
    ChangePasswordSerializer,
)
from .models import EmailOTP

from farms.serializers import FarmSerializer
from farms.models import Farm

User = get_user_model()


def generate_otp():
    """Generate a random 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email, code):
    """Send the OTP code to the given email address via Gmail SMTP."""
    subject = "AgriGov – Your Email Verification Code"
    message = (
        f"Welcome to AgriGov Market!\n\n"
        f"Your verification code is:\n\n"
        f"  {code}\n\n"
        f"This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"— The AgriGov Team"
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


class RegisterView(generics.CreateAPIView):
    """
    POST /users/register/
    Creates an *inactive* user account, generates an OTP, and emails it.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save user but keep inactive until email is verified
        user = serializer.save()
        user.is_active = False
        user.save(update_fields=['is_active'])

        # Generate + persist OTP (delete old ones for this email first)
        EmailOTP.objects.filter(email__iexact=user.email).delete()
        code = generate_otp()
        EmailOTP.objects.create(email=user.email, code=code)

        # Send email (best-effort; log but don't crash the API)
        print(f"[DEVELOPMENT ONLY] Generated email verification code for {user.email}: {code}")
        try:
            send_otp_email(user.email, code)
        except Exception as exc:
            # In dev without SMTP configured, just print to console
            print(f"[OTP EMAIL ERROR] Could not send email to {user.email}: {exc}")

        return Response(
            {
                "message": "Account created. A 6-digit verification code has been sent to your email.",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    """
    POST /users/verify-email/
    Body: { "email": "...", "code": "123456" }
    Activates the user if the OTP matches and has not expired.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        code = request.data.get('code', '').strip()

        if not email or not code:
            return Response(
                {"error": "Both 'email' and 'code' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch the most recent OTP for this email (case-insensitive)
        otp_obj = EmailOTP.objects.filter(email__iexact=email).first()

        if not otp_obj:
            return Response(
                {"error": "No verification code found for this email. Please register again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.is_expired():
            otp_obj.delete()
            return Response(
                {"error": "Your verification code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.code != code:
            return Response(
                {"error": "Invalid verification code. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Code is valid – activate the user(s) (case-insensitive)
        users = User.objects.filter(email__iexact=email)
        if not users.exists():
            return Response(
                {"error": "User account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        users.update(is_active=True)
        otp_obj.delete()  # Clean up used OTP

        # Auto-login: generate tokens for the user
        user = users.first()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Email verified successfully! Logging you in...",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    """
    POST /users/resend-otp/
    Body: { "email": "<email or username>" }
    Accepts either email or username for the lookup.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('email', '').strip()
        if not identifier:
            return Response(
                {"error": "'email' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try email first, then username
        user = (
            User.objects.filter(email__iexact=identifier).first() or
            User.objects.filter(username=identifier).first()
        )

        if not user:
            # Don't leak whether the identifier is registered
            return Response(
                {"message": "If this email is registered and unverified, a new code has been sent."},
                status=status.HTTP_200_OK,
            )

        if user.is_active:
            return Response(
                {"error": "This account is already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete any existing OTPs and create a fresh one
        EmailOTP.objects.filter(email__iexact=user.email).delete()
        code = generate_otp()
        EmailOTP.objects.create(email=user.email, code=code)

        print(f"[DEVELOPMENT ONLY] Resent email verification code for {user.email}: {code}")
        try:
            send_otp_email(user.email, code)
        except Exception as exc:
            print(f"[OTP EMAIL ERROR] Could not send email to {user.email}: {exc}")

        return Response(
            {"message": "A new verification code has been sent to your email."},
            status=status.HTTP_200_OK,
        )


# ─── Unchanged views below ────────────────────────────────────────────────────

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


class RequestPasswordResetOTPView(APIView):
    """
    POST /users/forgot-password/
    Body: { "username": "<username>" }
    Generates and emails a 6-digit OTP to the email of the specified user account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        if not username:
            return Response(
                {"error": "Username is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Look up by unique username
        user = User.objects.filter(username=username).first()

        if not user:
            return Response(
                {"error": f"No account found with username '{username}'."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.email:
            return Response(
                {"error": "This account does not have a registered email address. Please contact support."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete any existing OTPs and create a fresh one for this email
        EmailOTP.objects.filter(email__iexact=user.email).delete()
        code = generate_otp()
        EmailOTP.objects.create(email=user.email, code=code)

        # Send email via Gmail SMTP
        subject = "AgriGov – Reset Your Password"
        message = (
            f"Hello {user.username},\n\n"
            f"You requested a password reset for your AgriGov account.\n"
            f"Your 6-digit verification code is:\n\n"
            f"  {code}\n\n"
            f"This code will expire in {settings.OTP_EXPIRY_MINUTES} minutes.\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— The AgriGov Team"
        )

        print(f"[DEVELOPMENT ONLY] Generated password reset code for {user.email} (Username: {user.username}): {code}")
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as exc:
            print(f"[OTP PASSWORD RESET EMAIL ERROR] Could not send email to {user.email}: {exc}")

        # Mask the email for security but return it so they know which inbox to check
        email_parts = user.email.split('@')
        masked_email = f"{email_parts[0][:3]}***@{email_parts[1]}" if len(email_parts) == 2 else user.email

        return Response(
            {
                "message": f"A password reset code has been sent to your email ({masked_email}).",
                "email": user.email,
                "username": user.username
            },
            status=status.HTTP_200_OK,
        )


class ConfirmPasswordResetOTPView(APIView):
    """
    POST /users/reset-password/
    Body: { "username": "...", "code": "123456", "new_password": "..." }
    Resets the password of the unique user account if the code is valid.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        code = request.data.get('code', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not username or not code or not new_password:
            return Response(
                {"error": "All fields ('username', 'code', 'new_password') are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Look up by unique username
        user = User.objects.filter(username=username).first()
        if not user:
            return Response(
                {"error": f"No account found with username '{username}'."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Fetch the most recent OTP for this email
        otp_obj = EmailOTP.objects.filter(email__iexact=user.email).first()

        if not otp_obj:
            return Response(
                {"error": "No password reset code found for this account's email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.is_expired():
            otp_obj.delete()
            return Response(
                {"error": "Your verification code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.code != code:
            return Response(
                {"error": "Invalid verification code. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reset password specifically for this user only
        user.set_password(new_password)
        user.is_active = True
        user.save()
        otp_obj.delete()  # Clean up used OTP

        return Response(
            {"message": f"The password for account '{user.username}' has been successfully reset! You can now log in."},
            status=status.HTTP_200_OK,
        )