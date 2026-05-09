import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from market.models import ProductCatalog, PriceHistory, Season

def populate_history():
    products = ProductCatalog.objects.all()
    seasons = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER]
    years = [2024, 2025]

    for product in products:
        print(f"Creating history for {product.name}...")
        # Create 2-3 history records for each product
        for _ in range(random.randint(2, 4)):
            # Randomize price slightly
            price_change = Decimal(random.uniform(-10, 10))
            min_p = max(Decimal('5.00'), product.min_price + price_change)
            max_p = max(min_p + Decimal('5.00'), product.max_price + price_change)
            
            history = PriceHistory.objects.create(
                product=product,
                min_price=min_p,
                max_price=max_p,
                season=random.choice(seasons),
                year=random.choice(years),
                updated_by=product.updated_by
            )
            print(f"  Added history: {history.season} {history.year} - {history.min_price}-{history.max_price} DA")

if __name__ == "__main__":
    populate_history()
    print("Done populating price history.")
