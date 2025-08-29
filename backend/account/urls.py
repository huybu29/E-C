from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, RegisterViewSet, SellerRegisterView, AdminOrderViewSet, AdminProductViewSet, AdminReviewViewSet, AdminUserViewSet, AdminStatsView , CurrentUserView, change_password

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register('register', RegisterViewSet, basename='register')
router.register(r'seller', SellerRegisterView, basename='seller-register')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')

router.register(r'admin/products', AdminProductViewSet, basename='admin-products')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'admin/reviews', AdminReviewViewSet, basename='admin-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path('change-password/', change_password, name='change-password'),
    
]
