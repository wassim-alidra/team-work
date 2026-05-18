import os
import sys
import django
from decimal import Decimal
from django.utils import timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agri_gov_market.settings')
django.setup()

from users.models import User, TransporterProfile
from market.models import Order, Delivery

def restore_transporter():
    # 1. Find and reactivate Transporter1
    t1 = User.objects.filter(username__iexact='transporter1').first()
    if not t1:
        print("Transporter1 user not found! Creating one...")
        t1 = User.objects.create_user(
            username='Transporter1',
            email='transporter1@agrigov.dz',
            password='123',
            role=User.Role.TRANSPORTER,
            is_active=True,
            is_deleted=False,
            approval_status='approved'
        )
        TransporterProfile.objects.create(
            user=t1,
            vehicle_type='Semi-truck',
            license_plate='12345-12-16',
            capacity=20.0
        )
        print("Created Transporter1 and profile.")
    else:
        print(f"Found user {t1.username}. Reactivating...")
        t1.is_active = True
        t1.is_deleted = False
        t1.approval_status = 'approved'
        t1.set_password('123')
        t1.save()
        print("Transporter1 reactivated successfully (password reset to '123').")

    # 2. Check and restore missing delivery records for orders that should have a transporter
    # Orders with status > PENDING and CANCELLED that have no delivery assigned
    orphaned_orders = Order.objects.filter(
        status__in=['ACCEPTED', 'ON_WAY', 'CHARGING', 'DELIVERED'],
        delivery__isnull=True
    ).order_by('id')

    print(f"\nFound {orphaned_orders.count()} orphaned orders without delivery records.")

    restored_count = 0
    for order in orphaned_orders:
        fee = max(Decimal('5.00'), order.total_price * Decimal('0.10'))
        delivery = Delivery(
            transporter=t1,
            order=order,
            status=order.status,
            delivery_fee=fee,
            pickup_date=order.created_at
        )
        if order.status == 'DELIVERED':
            delivery.delivery_date = order.delivered_at or timezone.now()
        
        # Save without triggering signals that might modify order status unexpectedly
        delivery.save()
        restored_count += 1
        print(f"- Created Delivery #{delivery.id} for Order #{order.id} (Status: {order.status}) -> Assigned to {t1.username}")

    print(f"\nSuccessfully restored {restored_count} delivery records for Transporter1.")

if __name__ == '__main__':
    restore_transporter()
