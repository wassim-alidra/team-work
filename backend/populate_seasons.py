import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from market.models import ProductCatalog, PriceHistory, Season

def populate():
    seasons = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER]
    years = [2023, 2024, 2025]

    print("Updating ProductCatalog...")
    for product in ProductCatalog.objects.all():
        product.season = random.choice(seasons)
        product.year = random.choice(years)
        product.save()
        print(f"Updated {product.name}: {product.season} {product.year}")

    print("\nUpdating PriceHistory...")
    for history in PriceHistory.objects.all():
        history.season = random.choice(seasons)
        history.year = random.choice(years)
        history.save()
        print(f"Updated history for {history.product.name}: {history.season} {history.year}")

if __name__ == "__main__":
    populate()
