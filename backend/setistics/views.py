from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum, Avg
from users.models import User
from market.models import Order, ProductCatalog
from farms.models import Farm
from django.db.models.functions import TruncWeek

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

class StatsProductsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Return list of products that have at least one order
        products = Order.objects.exclude(status=Order.Status.CANCELLED) \
            .values('product__catalog__id', 'product__catalog__name') \
            .distinct()
        
        formatted_products = [
            {'id': item['product__catalog__id'], 'name': item['product__catalog__name']}
            for item in products
        ]
        return Response(formatted_products)

class ProductWeeklySalesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({"error": "Product ID required"}, status=400)

        # Sales quantity over the weeks for the selected product
        stats = Order.objects.filter(product__catalog_id=product_id) \
            .exclude(status=Order.Status.CANCELLED) \
            .annotate(week=TruncWeek('created_at')) \
            .values('week') \
            .annotate(total_quantity=Sum('quantity')) \
            .order_by('week')
        
        formatted_stats = [
            {
                'week': item['week'].strftime('%Y-%m-%d'), 
                'quantity': item['total_quantity'] or 0
            }
            for item in stats
        ]
        
        return Response(formatted_stats)

class TopRatedFarmersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Top 5 farmers by average rating (only from delivered orders with ratings)
        stats = Order.objects.filter(status=Order.Status.DELIVERED, rating__isnull=False) \
            .values('product__farmer__username') \
            .annotate(avg_rating=Avg('rating')) \
            .order_by('-avg_rating')[:5]
        
        formatted_stats = [
            {
                'username': item['product__farmer__username'], 
                'rating': round(item['avg_rating'], 2)
            }
            for item in stats
        ]
        
        return Response(formatted_stats)
