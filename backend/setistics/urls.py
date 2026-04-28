from django.urls import path
from .views import FarmersByWilayaView, TopSellingProductsView, StatsProductsListView, ProductWeeklySalesView

urlpatterns = [
    path('farmers-by-wilaya/', FarmersByWilayaView.as_view(), name='farmers-by-wilaya'),
    path('top-selling-products/', TopSellingProductsView.as_view(), name='top-selling-products'),
    path('products-list/', StatsProductsListView.as_view(), name='stats-products-list'),
    path('product-weekly-sales/', ProductWeeklySalesView.as_view(), name='product-weekly-sales'),
]
