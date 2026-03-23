import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User

def ensure_minister():
    # Attempt to get the admin user
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    
    if created or not user.check_password('admin123'):
        user.set_password('admin123')
        user.save()
        print("Minister (Admin) account created/updated with password 'admin123'.")
    else:
        print("Minister (Admin) account already exists.")

if __name__ == "__main__":
    ensure_minister()
