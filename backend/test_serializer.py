import os
import django
from django.core.files.base import ContentFile
from rest_framework import serializers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from market.models import Product, ProductCatalog
from market.serializers import ProductSerializer
from users.models import User
from farms.models import Farm

def test_serializer():
    try:
        farmer = User.objects.filter(role=User.Role.FARMER).first()
        catalog = ProductCatalog.objects.first()
        farm = Farm.objects.filter(farmer=farmer).first()
        
        data = {
            'catalog': catalog.id,
            'farm': farm.id,
            'price_per_kg': 100,
            'quantity_available': 50,
            'quality_grade': 'HIGH'
        }
        
        # Add a dummy file
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        files = {'image': ContentFile(image_content, name='test.gif')}
        
        print("Testing serializer validation and save...")
        # In a real request, it's serializer = ProductSerializer(data=request.data)
        # request.data is a combination of request.POST and request.FILES
        combined_data = data.copy()
        combined_data.update(files)
        
        class MockRequest:
            def __init__(self, user):
                self.user = user
            def build_absolute_uri(self, url):
                return f"http://testserver{url}"

        serializer = ProductSerializer(data=combined_data, context={'request': MockRequest(farmer)})
        if serializer.is_valid():
            print("Serializer is valid.")
            p = serializer.save()
            print(f"Product saved! ID: {p.id}")
            print(f"Data: {serializer.data}")
        else:
            print(f"Serializer errors: {serializer.errors}")
            
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_serializer()
