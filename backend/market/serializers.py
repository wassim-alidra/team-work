from rest_framework import serializers
from .models import Product, Order, Delivery, Complaint, Notification, ProductCatalog, Category, PriceHistory

class CategorySerializer(serializers.ModelSerializer):
    productsCount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_productsCount(self, obj): 
        return obj.products.count()

class ProductCatalogSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = ProductCatalog
        fields = '__all__'

class PriceHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = PriceHistory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    name = serializers.ReadOnlyField()
    description = serializers.ReadOnlyField()
    catalog_name = serializers.SerializerMethodField()
    catalog_unit = serializers.ReadOnlyField(source='catalog.unit')
    catalog_image = serializers.SerializerMethodField()
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    farm_wilaya = serializers.CharField(source='farm.wilaya', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('farmer',)

    def get_catalog_name(self, obj):
        return obj.catalog.name if obj.catalog else "Uncategorized"

    def get_catalog_image(self, obj):
        if obj.catalog and obj.catalog.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.catalog.image.url)
            return obj.catalog.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    farmer_name = serializers.CharField(source='product.farmer.username', read_only=True)
    delivery_status = serializers.SerializerMethodField()
    transporter_name = serializers.SerializerMethodField()
    product_unit = serializers.ReadOnlyField(source='product.catalog.unit')
    farmer_wilaya = serializers.SerializerMethodField()
    buyer_wilaya = serializers.CharField(source='buyer.wilaya', read_only=True)

    def get_farmer_wilaya(self, obj):
        # Use the farm's wilaya if available, otherwise the farmer's registered wilaya
        if obj.product and obj.product.farm:
            return obj.product.farm.wilaya
        return obj.product.farmer.wilaya if obj.product and obj.product.farmer else None

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('buyer', 'total_price')

    def get_delivery_status(self, obj):
        return getattr(obj, 'delivery').status if hasattr(obj, 'delivery') else "PENDING"

    def get_transporter_name(self, obj):
        if hasattr(obj, 'delivery') and obj.delivery.transporter:
            return obj.delivery.transporter.username
        return "Not Assigned"

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
