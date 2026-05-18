import os
import sys
import django
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User
from market.models import Product, ProductCatalog, Order, Delivery
from farms.models import Farm

def generate_sales():
    f3 = User.objects.get(username='farmer3')
    b3 = User.objects.get(username='buyer3')
    t3 = User.objects.get(username__iexact='transporter3')
    
    # Ensure t3 is active
    if not t3.is_active or t3.is_deleted:
        t3.is_active = True
        t3.is_deleted = False
        t3.save()
        print("Reactivated Transporter3.")

    farm = Farm.objects.filter(farmer=f3, is_approved=True).first()
    if not farm:
        print("No approved farm found for farmer3!")
        return

    # Product catalogs to ensure
    catalogs = [
        ('Potato', Decimal('45.00'), 2500),
        ('Tomatoes', Decimal('65.00'), 1800),
        ('Wheat', Decimal('35.00'), 6000),
        ('Orange', Decimal('115.00'), 1200),
        ('Onion', Decimal('85.00'), 2000),
        ('Corn', Decimal('90.00'), 3000),
    ]

    products = []
    for cat_name, price, qty in catalogs:
        catalog = ProductCatalog.objects.filter(name__iexact=cat_name).first()
        if not catalog:
            continue
        prod, created = Product.objects.get_or_create(
            farmer=f3,
            catalog=catalog,
            defaults={
                'farm': farm,
                'price_per_kg': price,
                'quantity_available': qty,
                'quality_grade': 'HIGH'
            }
        )
        if not created and prod.quantity_available < 500:
            prod.quantity_available = qty
            prod.save()
        products.append(prod)
        print(f"Product ready: {prod.catalog.name} | Qty: {prod.quantity_available} | DA/kg: {prod.price_per_kg}")

    print(f"\nCreating 28 transactions between {f3.username}, {b3.username}, and {t3.username} over the last 7 days...")

    now = timezone.now()
    comments = [
        "Excellent quality, fast transport!",
        "Very fresh vegetables, highly recommended.",
        "Perfect transaction, arrived on time.",
        "Great communication with farmer and transporter.",
        "Top-notch quality, will order again next week.",
        "Smooth loading and quick delivery."
    ]

    orders_created = 0
    for i in range(28):
        prod = random.choice(products)
        qty = round(random.uniform(50, 250), 1)
        days_ago = random.uniform(1, 7)
        order_time = now - timedelta(days=days_ago)
        delivery_time = order_time + timedelta(hours=random.uniform(3, 8))
        pickup_time = order_time + timedelta(hours=1)

        total_p = round(Decimal(str(qty)) * prod.price_per_kg, 2)

        order = Order(
            buyer=b3,
            product=prod,
            quantity=qty,
            total_price=total_p,
            status='DELIVERED',
            rating=random.choice([4, 5]),
            rating_comment=random.choice(comments)
        )
        order.save()

        # Update timestamps since auto_now_add overrides initial values on save
        Order.objects.filter(id=order.id).update(created_at=order_time, delivered_at=delivery_time)

        # Create delivery
        fee = round(max(Decimal('5.00'), total_p * Decimal('0.10')), 2)
        delivery = Delivery(
            transporter=t3,
            order=order,
            status='DELIVERED',
            delivery_fee=fee
        )
        delivery.save()
        
        Delivery.objects.filter(id=delivery.id).update(pickup_date=pickup_time, delivery_date=delivery_time)
        orders_created += 1

    print(f"Successfully generated {orders_created} transactions with deliveries!")

if __name__ == '__main__':
    generate_sales()
