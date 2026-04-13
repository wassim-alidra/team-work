import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agri_gov_market.settings")
django.setup()

from django.contrib.auth import get_user_model
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

# Registration / Creation logic
test_user = User.objects.filter(username="test_pending_user").first()
if test_user:
    test_user.delete()

test_user = User.objects.create_user(username="test_pending_user", password="secret_password123", email="test@example.com")

print(f"Created user with approval_status: {test_user.approval_status}, is_active: {test_user.is_active}, is_deleted: {test_user.is_deleted}")

# Login logic
serializer = CustomTokenObtainPairSerializer()

try:
    serializer.validate({"username": "test_pending_user", "password": "secret_password123"})
    print("FAILED: Expected AuthenticationFailed to be raised for pending user")
except AuthenticationFailed as e:
    print(f"Login failed as expected with message: {e.detail}")
except Exception as e:
    print(f"FAILED: Expected AuthenticationFailed but got another exception or not caught correctly: {str(e)}")

# Approval logic
test_user.approval_status = "approved"
test_user.save()

try:
    serializer.validate({"username": "test_pending_user", "password": "secret_password123"})
    print("SUCCESS: Logged in successfully after approval")
except AuthenticationFailed as e:
    print(f"FAILED: Login should have succeeded but got: {e.detail}")

test_user.delete()
