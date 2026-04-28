from django.urls import path
from .views import FarmersByWilayaView, TopSellingProductsView

urlpatterns = [
    path('farmers-by-wilaya/', FarmersByWilayaView.as_view(), name='farmers-by-wilaya'),
    path('top-selling-products/', TopSellingProductsView.as_view(), name='top-selling-products'),
]
