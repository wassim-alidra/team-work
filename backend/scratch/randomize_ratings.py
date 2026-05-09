import os
import django
import random
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from market.models import Order
from django.utils import timezone

def randomize_ratings():
    # Only rate DELIVERED orders
    orders = Order.objects.filter(status=Order.Status.DELIVERED)
    count = 0
    for order in orders:
        order.rating = random.randint(3, 5) # Farmers usually have decent ratings in this mock data
        order.rating_comment = random.choice([
            "Excellent quality!", 
            "Very fresh products.", 
            "Good service, but a bit slow.", 
            "Highly recommended.", 
            "Fair price for the quality.",
            "Best farmer in the region!",
            "Will buy again."
        ])
        order.save()
        count += 1
    
    print(f"Randomized ratings for {count} delivered orders.")

if __name__ == "__main__":
    randomize_ratings()
