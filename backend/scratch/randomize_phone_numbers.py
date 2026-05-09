import os
import django
import random
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User

def generate_algerian_phone():
    prefix = random.choice(['05', '06', '07'])
    number = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return prefix + number

def randomize_phone_numbers():
    users = User.objects.all()
    count = 0
    for user in users:
        if not user.phone_number:
            user.phone_number = generate_algerian_phone()
            user.save()
            count += 1
            
    print(f"Updated {count} users with random Algerian phone numbers.")

if __name__ == "__main__":
    randomize_phone_numbers()
