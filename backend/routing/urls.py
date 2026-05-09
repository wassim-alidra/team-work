from django.urls import path
from .views import WilayaListView, CalculateRouteView

urlpatterns = [
    path('wilayas/', WilayaListView.as_view(), name='wilaya-list'),
    path('calculate/', CalculateRouteView.as_view(), name='calculate-route'),
]
