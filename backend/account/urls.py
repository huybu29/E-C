from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, RegisterViewSet, SellerRegisterView

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register('register', RegisterViewSet, basename='register')
router.register(r'seller', SellerRegisterView, basename='seller-register')
urlpatterns = [
    path('', include(router.urls)),
]