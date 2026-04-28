from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum
from users.models import User
from market.models import Order, ProductCatalog
from farms.models import Farm

class FarmersByWilayaView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Count distinct farmers with approved farms per wilaya
        stats = Farm.objects.filter(is_approved=True) \
            .values('wilaya') \
            .annotate(count=Count('farmer', distinct=True)) \
            .order_by('-count')[:10]
        
        return Response(stats)

class TopSellingProductsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Most selling products by total quantity sold (excluding cancelled orders)
        stats = Order.objects.exclude(status=Order.Status.CANCELLED) \
            .values('product__catalog__name') \
            .annotate(total_quantity=Sum('quantity')) \
            .order_by('-total_quantity')[:5] # Top 5 for Pie Chart
        
        # Rename for frontend convenience
        formatted_stats = [
            {'name': item['product__catalog__name'], 'value': item['total_quantity'] or 0}
            for item in stats
        ]
        
        return Response(formatted_stats)
