import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from django.core.files.base import ContentFile
from market.models import Product, ProductCatalog
from users.models import User
from farms.models import Farm

def test_upload():
    try:
        farmer = User.objects.filter(role=User.Role.FARMER).first()
        if not farmer:
            print("No farmer found")
            return
            
        catalog = ProductCatalog.objects.first()
        farm = Farm.objects.filter(farmer=farmer).first()
        
        if not catalog or not farm:
            print(f"Missing catalog ({catalog}) or farm ({farm})")
            return

        print(f"Attempting to create product for {farmer.username} with dummy image...")
        p = Product(
            farmer=farmer,
            catalog=catalog,
            farm=farm,
            price_per_kg=catalog.min_price or 10,
            quantity_available=100,
            quality_grade='HIGH'
        )
        
        # Dummy image content
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        p.image.save('test_image.gif', ContentFile(image_content))
        p.save()
        print(f"Product created successfully! ID: {p.id}")
        print(f"Image URL: {p.image.url}")
        
        # Cleanup
        # p.delete()
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_upload()
