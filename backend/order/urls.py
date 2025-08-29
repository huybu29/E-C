from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet, SellerOrderViewSet, SellerOrderDetailView, SellerStatsView, AddressViewSet
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')
router.register(r'address', AddressViewSet, basename='address')
router.register(r'seller-orders', SellerOrderViewSet, basename='seller-order')
router.register(r'seller-order-detail', SellerOrderDetailView, basename='seller-order-detail')

urlpatterns = [
    path('', include(router.urls)),
    path('seller-stats/', SellerStatsView.as_view(), name='seller-stats'),
]