from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router=DefaultRouter()
router.register(r'seller', views.SellerProductViewSet, basename='seller-product')
router.register(r'reviews', views.ReviewViewSet, basename='product-reviews')
router.register(r'', views.ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls))
]
