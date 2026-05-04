from rest_framework import serializers
from .models import Category, ProductCatalog, Product, Order, Delivery, Complaint, Notification, Equipment, EquipmentImage, PriceHistory, EquipmentBooking
from users.models import User

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_products_count(self, obj):
        return obj.products.count()

class PriceHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    class Meta:
        model = PriceHistory
        fields = ['id', 'product', 'min_price', 'max_price', 'season', 'year', 'updated_by', 'updated_by_name', 'updated_at']

class ProductCatalogSerializer(serializers.ModelSerializer):
    history = PriceHistorySerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = ProductCatalog
        fields = ['id', 'name', 'category', 'category_name', 'description', 'unit', 'min_price', 'max_price', 'season', 'year', 'image', 'updated_by', 'created_at', 'updated_at', 'history']

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
        fields = ['id', 'farmer', 'farmer_name', 'name', 'description', 'farm', 'farm_name', 'farm_wilaya', 'catalog', 'catalog_name', 'catalog_unit', 'catalog_image', 'price_per_kg', 'quantity_available', 'quality_grade', 'avg_rating', 'rating_count', 'created_at', 'updated_at']
        read_only_fields = ('farmer',)

    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)

    def get_catalog_image(self, obj):
        if obj.catalog and obj.catalog.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.catalog.image.url)
            return obj.catalog.image.url
        return None

    def get_catalog_name(self, obj):
        return obj.catalog.name if obj.catalog else "Unnamed Product"

class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    product_name = serializers.CharField(source='product.catalog.name', read_only=True)
    farmer_name = serializers.CharField(source='product.farmer.username', read_only=True)
    delivery_status = serializers.SerializerMethodField()
    transporter_name = serializers.SerializerMethodField()
    product_unit = serializers.ReadOnlyField(source='product.catalog.unit')
    farmer_wilaya = serializers.SerializerMethodField()
    buyer_wilaya = serializers.CharField(source='buyer.wilaya', read_only=True)
    product_image = serializers.SerializerMethodField()

    def get_product_image(self, obj):
        if obj.product and obj.product.catalog and obj.product.catalog.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.catalog.image.url)
            return obj.product.catalog.image.url
        return None

    def get_farmer_wilaya(self, obj):
        # Use the farm's wilaya if available, otherwise the farmer's registered wilaya
        if obj.product and obj.product.farm:
            return obj.product.farm.wilaya
        return obj.product.farmer.wilaya if obj.product and obj.product.farmer else None

    def get_delivery_status(self, obj):
        return obj.delivery.status if hasattr(obj, 'delivery') else "PENDING"

    def get_transporter_name(self, obj):
        return obj.delivery.transporter.username if hasattr(obj, 'delivery') and obj.delivery.transporter else "N/A"
    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_name', 'buyer_wilaya', 'product', 'product_name', 'product_image', 'product_unit', 'farmer_name', 'farmer_wilaya', 'quantity', 'total_price', 'status', 'delivery_status', 'transporter_name', 'rating', 'rating_comment', 'created_at', 'delivered_at']
        read_only_fields = ('buyer', 'total_price')

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        return super().create(validated_data)

class DeliverySerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    buyer_name = serializers.CharField(source='order.buyer.username', read_only=True)
    farmer_name = serializers.CharField(source='order.product.farmer.username', read_only=True)
    product_name = serializers.CharField(source='order.product.catalog.name', read_only=True)
    
    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ('transporter',)

class ComplaintSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user',)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class EquipmentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentImage
        fields = ('id', 'image')

class EquipmentSerializer(serializers.ModelSerializer):
    images = EquipmentImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.FileField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )
    deleted_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True, required=False
    )
    provider_name = serializers.CharField(source='provider.username', read_only=True)
    earliest_return_date = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ('provider',)

    def get_earliest_return_date(self, obj):
        if obj.quantity_available == 0:
            earliest_booking = obj.bookings.filter(status='ACCEPTED', expected_return_date__isnull=False).order_by('expected_return_date').first()
            if earliest_booking:
                return earliest_booking.expected_return_date.date().isoformat()
        return None

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        validated_data.pop('deleted_images', [])
        validated_data['provider'] = self.context['request'].user
        equipment = Equipment.objects.create(**validated_data)
        for image_data in uploaded_images:
            EquipmentImage.objects.create(equipment=equipment, image=image_data)
        return equipment

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        deleted_images = validated_data.pop('deleted_images', [])
        instance = super().update(instance, validated_data)
        
        if deleted_images:
            EquipmentImage.objects.filter(id__in=deleted_images, equipment=instance).delete()

        if uploaded_images:
            for image_data in uploaded_images:
                EquipmentImage.objects.create(equipment=instance, image=image_data)
        return instance

class EquipmentBookingSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    provider_name = serializers.CharField(source='equipment.provider.username', read_only=True)
    equipment_total_quantity = serializers.IntegerField(source='equipment.quantity_available', read_only=True)
    
    class Meta:
        model = EquipmentBooking
        fields = '__all__'
        read_only_fields = ('farmer', 'total_price')

    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)
