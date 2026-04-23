from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from .models import Product, Order, Delivery, Complaint, Notification, ProductCatalog, Category, PriceHistory, Equipment, EquipmentBooking
from .serializers import (
    ProductSerializer, OrderSerializer, DeliverySerializer, 
    ComplaintSerializer, NotificationSerializer, ProductCatalogSerializer,
    CategorySerializer, PriceHistorySerializer, EquipmentSerializer, EquipmentBookingSerializer
)
from users.models import User
from django.db.models import Sum

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

class ProductCatalogViewSet(viewsets.ModelViewSet):
    serializer_class = ProductCatalogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProductCatalog.objects.all().order_by('name')
        category_id = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if category_id and category_id != 'all':
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        # Track history before saving new values
        PriceHistory.objects.create(
            product=instance,
            min_price=instance.min_price,
            max_price=instance.max_price,
            updated_by=instance.updated_by
        )
        serializer.save(updated_by=self.request.user)

class PriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PriceHistory.objects.all().order_by('-id')
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == User.Role.FARMER:
            # Farmers see all their own products
            queryset = Product.objects.filter(farmer=user)
        else:
            # Buyers and others only see properly catalogued products from approved farms
            queryset = Product.objects.filter(catalog__isnull=False)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(catalog__name__icontains=search)
            
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(catalog__category_id=category)
            
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price_per_kg__gte=min_price)
            
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price_per_kg__lte=max_price)

        return queryset

    def _validate_price(self, serializer):
        catalog = serializer.validated_data.get('catalog')
        price = serializer.validated_data.get('price_per_kg')
        if catalog and price is not None:
            if catalog.min_price is not None and price < catalog.min_price:
                raise ValidationError(
                    {"price_per_kg": f"Price too low. Minimum allowed for '{catalog.name}' is {catalog.min_price} DA/kg."}
                )
            if catalog.max_price is not None and price > catalog.max_price:
                raise ValidationError(
                    {"price_per_kg": f"Price too high. Maximum allowed for '{catalog.name}' is {catalog.max_price} DA/kg."}
                )

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.FARMER:
             raise permissions.PermissionDenied("Only farmers can add products.")
        
        farm = serializer.validated_data.get('farm')
        if farm and farm.farmer != self.request.user:
            raise ValidationError({"farm": "You can only list products for your own farms."})
            
        self._validate_price(serializer)
        serializer.save(farmer=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().farmer != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own products.")
        self._validate_price(serializer)
        serializer.save()

    def perform_destroy(self, instance):
        if instance.farmer != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own products.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Farmer-specific statistics"""
        if request.user.role != User.Role.FARMER:
             return Response({"error": "Only farmers can view these stats."}, status=403)
        
        user = request.user
        total_products = Product.objects.filter(farmer=user).count()
        total_quantity = sum(p.quantity_available for p in Product.objects.filter(farmer=user))
        
        farmer_orders = Order.objects.filter(product__farmer=user)
        total_orders = farmer_orders.count()
        pending_orders = farmer_orders.filter(status='PENDING').count()
        completed_orders = farmer_orders.filter(status='DELIVERED').count()
        total_revenue = sum(o.total_price for o in farmer_orders.filter(status='DELIVERED'))
        
        return Response({
            "total_products": total_products,
            "total_quantity": total_quantity,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "total_revenue": total_revenue
        })

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-id')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.BUYER:
            return Order.objects.filter(buyer=user)
        elif user.role == User.Role.FARMER:
            return Order.objects.filter(product__farmer=user)
        elif user.role == User.Role.TRANSPORTER:
            return Order.objects.filter(delivery__transporter=user) # Only assigned
        return Order.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.BUYER:
            raise permissions.PermissionDenied("Only buyers can place orders.")
            
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        
        if quantity > product.quantity_available:
            raise ValidationError(
                {"quantity": f"Cannot order {quantity}kg. Only {product.quantity_available}kg available."}
            )
            
        product.quantity_available -= quantity
        product.save()
        
        serializer.save(buyer=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        order = self.get_object()
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if user.role == User.Role.FARMER and order.product.farmer == user:
                 if new_status == 'CANCELLED' and order.status != 'CANCELLED':
                     order.product.quantity_available += order.quantity
                     order.product.save()
                 serializer.save()
            elif user.role == User.Role.BUYER and order.buyer == user:
                if order.status == 'PENDING' and new_status == 'CANCELLED':
                    order.product.quantity_available += order.quantity
                    order.product.save()
                    serializer.save()
                else:
                    raise permissions.PermissionDenied("Buyers can only cancel PENDING orders.")
            elif user.role == User.Role.ADMIN:
                 serializer.save()
            else:
                raise permissions.PermissionDenied("You do not have permission to update this order status.")
        else:
             super().perform_update(serializer)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Buyer-specific statistics"""
        if request.user.role != User.Role.BUYER:
             return Response({"error": "Only buyers can view these stats."}, status=403)
        
        user = request.user
        buyer_orders = Order.objects.filter(buyer=user)
        total_orders = buyer_orders.count()
        pending_deliveries = buyer_orders.filter(status__in=['ACCEPTED', 'IN_TRANSIT']).count()
        delivered_count = buyer_orders.filter(status='DELIVERED').count()
        total_spent = sum(o.total_price for o in buyer_orders.filter(status='DELIVERED'))
        
        return Response({
            "total_orders": total_orders,
            "pending_deliveries": pending_deliveries,
            "delivered_count": delivered_count,
            "total_spent": total_spent
        })

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all().order_by('-id')
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Delivery.objects.all()
        if user.role == User.Role.TRANSPORTER:
            queryset = queryset.filter(transporter=user)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
         if self.request.user.role != User.Role.TRANSPORTER:
             raise permissions.PermissionDenied("Only transporters can accept deliveries.")
         serializer.save(transporter=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        delivery = self.get_object()
        
        if user.role != User.Role.TRANSPORTER or delivery.transporter != user:
             raise permissions.PermissionDenied("You can only update your own assigned deliveries.")
        
        # Valid status transitions
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if delivery.status == 'ASSIGNED' and new_status != 'IN_TRANSIT':
                raise permissions.PermissionDenied("From ASSIGNED, you must move to IN_TRANSIT.")
            if delivery.status == 'IN_TRANSIT' and new_status != 'DELIVERED':
                raise permissions.PermissionDenied("From IN_TRANSIT, you must move to DELIVERED.")
        
        serializer.save()

    @action(detail=False, methods=['get'])
    def available_orders(self, request):
        """List orders ready for delivery assignment"""
        queryset = Order.objects.filter(status='ACCEPTED', delivery__isnull=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
             serializer = OrderSerializer(page, many=True)
             return self.get_paginated_response(serializer.data)
        
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        """Calculate total earnings for the transporter"""
        if request.user.role != User.Role.TRANSPORTER:
            return Response({"error": "Only transporters can view earnings."}, status=403)
        
        completed_deliveries = Delivery.objects.filter(transporter=request.user, status='DELIVERED')
        total_earnings = sum(d.delivery_fee for d in completed_deliveries)
        
        return Response({
            "total_earnings": total_earnings,
            "completed_count": completed_deliveries.count(),
            "history": DeliverySerializer(completed_deliveries, many=True).data
        })

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-id')
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Complaint.objects.all()
        return Complaint.objects.filter(user=user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            raise ValidationError({"detail": str(e)})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-id')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def send_broadcast(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Only Admin can send notifications."}, status=status.HTTP_403_FORBIDDEN)
        
        message = request.data.get('message')
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        target = request.data.get('target', 'all')  # 'farmers', 'buyers', or 'all'
        if target == 'farmers':
            roles = [User.Role.FARMER]
        elif target == 'buyers':
            roles = [User.Role.BUYER]
        else:
            roles = [User.Role.FARMER, User.Role.BUYER]

        try:
            recipients = User.objects.filter(role__in=roles)
            notifications = [Notification(recipient=r, message=message) for r in recipients]
            Notification.objects.bulk_create(notifications)
            return Response({"detail": f"Notification sent to {len(notifications)} users."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Backend Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminStatsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            "total_users": User.objects.filter(is_deleted=False).count(),
            "farmers_count": User.objects.filter(role=User.Role.FARMER, is_deleted=False).count(),
            "buyers_count": User.objects.filter(role=User.Role.BUYER, is_deleted=False).count(),
            "transporters_count": User.objects.filter(role=User.Role.TRANSPORTER, is_deleted=False).count(),
            "total_products": Product.objects.count(),
            "total_orders": Order.objects.count(),
            "total_revenue": Order.objects.filter(status='DELIVERED').aggregate(Sum('total_price'))['total_price__sum'] or 0,
            "pending_complaints": Complaint.objects.filter(is_resolved=False).count()
        }
        return Response(stats)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != User.Role.ADMIN:
            return User.objects.none()
        return User.objects.all().order_by('-date_joined')

    def list(self, request):
        users = self.get_queryset()
        data = []
        for u in users:
            item = {
                "id": u.id,
                "username": u.username,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
                "email": u.email,
                "date_joined": u.date_joined,
                "is_active": u.is_active,
                "is_deleted": getattr(u, 'is_deleted', False),
                "approval_status": getattr(u, 'approval_status', 'approved'),
            }
            if u.role == User.Role.FARMER and hasattr(u, 'farmer_profile'):
                item['extra_info'] = f"Farm: {u.farmer_profile.farm_name}"
                item['documents'] = []
                if u.farmer_profile.farmer_card_file:
                    item['documents'].append({'name': 'Farmer Card', 'url': request.build_absolute_uri(u.farmer_profile.farmer_card_file.url)})
            elif u.role == User.Role.BUYER and hasattr(u, 'buyer_profile'):
                item['extra_info'] = f"Company: {u.buyer_profile.company_name}"
                item['documents'] = []
                if u.buyer_profile.commercial_register_file:
                    item['documents'].append({'name': 'Commercial Register', 'url': request.build_absolute_uri(u.buyer_profile.commercial_register_file.url)})
            elif u.role == User.Role.TRANSPORTER and hasattr(u, 'transporter_profile'):
                item['extra_info'] = f"Vehicle: {u.transporter_profile.vehicle_type}"
                item['documents'] = []
                if u.transporter_profile.driving_license_file:
                    item['documents'].append({'name': 'Driving License', 'url': request.build_absolute_uri(u.transporter_profile.driving_license_file.url)})
                if u.transporter_profile.car_license_file:
                    item['documents'].append({'name': 'Car License', 'url': request.build_absolute_uri(u.transporter_profile.car_license_file.url)})
            elif u.role == User.Role.EQUIPMENT_PROVIDER and hasattr(u, 'equipment_provider_profile'):
                item['extra_info'] = f"Machinery Co: {u.equipment_provider_profile.company_name}"
                item['documents'] = []
                if u.equipment_provider_profile.commercial_register_file:
                    item['documents'].append({'name': 'Business License', 'url': request.build_absolute_uri(u.equipment_provider_profile.commercial_register_file.url)})
            else:
                item['extra_info'] = ''
                item['documents'] = []
            data.append(item)
        return Response(data)

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"detail": "User suspended successfully."})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"detail": "User activated successfully."})

    @action(detail=True, methods=['post'])
    def delete_account(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.is_active = False
        user.is_deleted = True
        user.save()
        return Response({"detail": "User deleted successfully."})

    @action(detail=True, methods=['post'])
    def approve_account(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        user.approval_status = 'approved'
        user.save()
        return Response({"detail": "User approved successfully."})

class EquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Auto-restore expired bookings
        from django.utils import timezone
        from .models import EquipmentBooking
        expired_bookings = EquipmentBooking.objects.filter(status='ACCEPTED', expected_return_date__lte=timezone.now())
        for booking in expired_bookings:
            equipment = booking.equipment
            equipment.quantity_available += booking.requested_quantity
            equipment.is_available = True
            equipment.save()
            booking.status = 'COMPLETED'
            booking.save()

        if user.role == User.Role.EQUIPMENT_PROVIDER:
            return Equipment.objects.filter(provider=user)
        # Farmers and others can browse equipment
        queryset = Equipment.objects.all()
        is_available = self.request.query_params.get('is_available')
        if is_available:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.EQUIPMENT_PROVIDER:
             raise permissions.PermissionDenied("Only equipment providers can add equipment.")
        serializer.save(provider=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().provider != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own equipment.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.provider != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own equipment.")
        instance.delete()

class EquipmentBookingViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.FARMER:
            return EquipmentBooking.objects.filter(farmer=user).order_by('-created_at')
        elif user.role == User.Role.EQUIPMENT_PROVIDER:
            return EquipmentBooking.objects.filter(equipment__provider=user).order_by('-created_at')
        return EquipmentBooking.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.FARMER:
            raise permissions.PermissionDenied("Only farmers can book equipment.")
            
        equipment = serializer.validated_data['equipment']
        requested_quantity = serializer.validated_data.get('requested_quantity', 1)
        
        if equipment.quantity_available < requested_quantity:
            raise ValidationError({"detail": f"Only {equipment.quantity_available} units available."})
            
        booking = serializer.save(farmer=self.request.user)
        # Create notification for provider
        Notification.objects.create(
            recipient=booking.equipment.provider,
            message=f"New booking request from {self.request.user.username} for {booking.equipment.name}."
        )

    def perform_update(self, serializer):
        user = self.request.user
        booking = self.get_object()
        
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if user.role == User.Role.EQUIPMENT_PROVIDER and booking.equipment.provider == user:
                if new_status == 'ACCEPTED' and booking.status == 'PENDING':
                    if booking.equipment.quantity_available >= booking.requested_quantity:
                        booking.equipment.quantity_available -= booking.requested_quantity
                        booking.equipment.save()
                    else:
                        raise ValidationError({"detail": "Not enough available quantity to accept this booking."})
                serializer.save()
                Notification.objects.create(
                    recipient=booking.farmer,
                    message=f"Your booking for {booking.equipment.name} has been {new_status.lower()}."
                )
            else:
                 super().perform_update(serializer)
        else:
            super().perform_update(serializer)


