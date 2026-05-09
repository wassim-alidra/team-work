import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User
from market.models import Order, Product

username = 'farmer5' # or 'famer5'
try:
    user = User.objects.get(username__iexact=username)
    print(f"User found: {user.username} (ID: {user.id}) Role: {user.role}")
    
    products = Product.objects.filter(farmer=user)
    print(f"Products count: {products.count()}")
    for p in products:
        print(f"  - {p.catalog.name if p.catalog else '?'}: {p.quantity_available}kg")
        
    orders = Order.objects.filter(product__farmer=user)
    print(f"Orders count for this farmer: {orders.count()}")
    for o in orders:
        print(f"  - Order #{o.id}: Status={o.status}, Buyer={o.buyer.username}, Product={o.product.catalog.name if o.product and o.product.catalog else '?'}")

except User.DoesNotExist:
    print(f"User '{username}' not found.")
except Exception as e:
    print(f"Error: {e}")
