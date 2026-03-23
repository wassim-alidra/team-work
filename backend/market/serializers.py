from rest_framework import serializers
from .models import Product, Order, Delivery, Complaint, Notification

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('farmer',)

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    delivery_status = serializers.CharField(source='delivery.status', read_only=True)
    transporter_name = serializers.CharField(source='delivery.transporter.username', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('buyer', 'total_price')

class DeliverySerializer(serializers.ModelSerializer):
    transporter_name = serializers.CharField(source='transporter.username', read_only=True)
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ('transporter',)

class ComplaintSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user',)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
