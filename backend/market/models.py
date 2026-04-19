from django.db import models
from django.conf import settings
from users.models import User
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default="Leaf")
    color = models.CharField(max_length=20, default="#dcfce7")
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductCatalog(models.Model):
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=20, default="kg")
    min_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Minimum price per unit (DA)")
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Maximum price per unit (DA)")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_catalog_items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PriceHistory(models.Model):
    product = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE, related_name='history')
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"History for {self.product.name} at {self.updated_at}"

class Product(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': User.Role.FARMER})
    catalog = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE, related_name='instances', null=True, blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.FloatField(help_text="Quantity in kg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def name(self):
        return self.catalog.name if self.catalog else "Unnamed Product"

    @property
    def description(self):
        return self.catalog.description if self.catalog else "No description available"

    def __str__(self):
        return f"{self.farmer.username}'s {self.catalog.name}"

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders', limit_choices_to={'role': User.Role.BUYER})
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    quantity = models.FloatField(help_text="Quantity in kg")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.product.price_per_kg * Decimal(str(self.quantity))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.id} - {self.product.name}"

class Delivery(models.Model):
    transporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='deliveries', limit_choices_to={'role': User.Role.TRANSPORTER})
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    pickup_date = models.DateTimeField(null=True, blank=True)
    delivery_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='ASSIGNED') 
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if not self.delivery_fee and self.order:
            self.delivery_fee = max(Decimal('5.00'), self.order.total_price * Decimal('0.10'))
        if self.status == 'IN_TRANSIT':
            self.order.status = Order.Status.IN_TRANSIT
            self.order.save()
        elif self.status == 'DELIVERED':
            self.order.status = Order.Status.DELIVERED
            self.order.save()
            if not self.delivery_date:
                from django.utils import timezone
                self.delivery_date = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Delivery for Order #{self.order.id}"

class Complaint(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.subject}"

class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.recipient.username}: {self.message[:20]}..."

class Equipment(models.Model):
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='equipments', limit_choices_to={'role': User.Role.EQUIPMENT_PROVIDER})
    name = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    
    price_per_day = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity_available = models.IntegerField(default=1)
    deposit_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    horsepower = models.CharField(max_length=50, null=True, blank=True)
    weight = models.CharField(max_length=50, null=True, blank=True)
    year_of_manufacture = models.IntegerField(null=True, blank=True)
    transmission = models.CharField(max_length=100, null=True, blank=True)
    max_speed = models.CharField(max_length=50, null=True, blank=True)
    fuel_type = models.CharField(max_length=50, null=True, blank=True)
    hours_of_use = models.CharField(max_length=50, null=True, blank=True)
    
    location = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True, help_text="General notes or extra technical details")
    
    condition = models.CharField(max_length=100)
    usage_instructions = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    expected_available_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.provider.username})"

class EquipmentImage(models.Model):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='images')
    image = models.FileField(upload_to='equipment_images/')
    created_at = models.DateTimeField(auto_now_add=True)

class EquipmentBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        COMPLETED = 'COMPLETED', 'Completed'

    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='bookings')
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='equipment_bookings', limit_choices_to={'role': User.Role.FARMER})
    requested_quantity = models.IntegerField(default=1)
    rental_days = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    expected_return_date = models.DateTimeField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.equipment.price_per_day * Decimal(str(self.requested_quantity)) * Decimal(str(self.rental_days))
        if not self.expected_return_date:
            from django.utils import timezone
            from datetime import timedelta
            self.expected_return_date = timezone.now() + timedelta(days=self.rental_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking for {self.equipment.name} by {self.farmer.username}"
