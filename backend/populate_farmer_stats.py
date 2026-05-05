import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User
from market.models import Product, Order

def populate_stats():
    farmer = User.objects.filter(role='FARMER').first()
    if not farmer:
        print("No farmer found.")
        return

    products = Product.objects.filter(farmer=farmer)
    if not products:
        print(f"No products found for farmer {farmer.username}.")
        return

    buyer = User.objects.filter(role='BUYER').first()
    if not buyer:
        # Create a buyer if none exists
        buyer, _ = User.objects.get_or_create(
            username='test_buyer', 
            role='BUYER', 
            email='buyer@test.com'
        )

    print(f"Populating stats for farmer: {farmer.username}")

    # Create orders for the last 7 days
    now = timezone.now()
    for i in range(14): # Last 14 days
        date = now - timedelta(days=i)
        # Create 1-3 orders per day
        for _ in range(random.randint(1, 3)):
            product = random.choice(products)
            quantity = random.randint(10, 100)
            order = Order.objects.create(
                buyer=buyer,
                product=product,
                quantity=quantity,
                total_price=quantity * product.price_per_kg,
                status=Order.Status.DELIVERED,
                created_at=date
            )
            # Add a rating
            order.rating = random.randint(3, 5)
            order.save()
            # Update created_at (auto_now_add makes it tricky, so we update it manually)
            Order.objects.filter(id=order.id).update(created_at=date)

    print("Stats populated successfully!")

if __name__ == "__main__":
    populate_stats()
