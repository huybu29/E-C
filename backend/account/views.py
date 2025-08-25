from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Profile, Seller
from .serializers import ProfileSerializer, UserSerializer, SellerSerializer, AdminUserSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from account.models import Seller
from product.models import Product, Review
from order.models import Order
from order.serializers import OrderSerializer
from product.serializers import ProductSerializer, ReviewSerializer
from django.db.models import Sum
from .serializers import AdminUserSerializer
from .permissions import IsStaffOrSuperUser
from rest_framework.decorators import action
# API quản lý Profile
class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


# API Đăng ký User
class RegisterViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        })
class SellerRegisterView(viewsets.ModelViewSet):
    serializer_class = SellerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Seller.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsStaffOrSuperUser]
class AdminSellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
    permission_classes = [IsStaffOrSuperUser]

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsStaffOrSuperUser]
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        product = self.get_object()
        product.status = "approved"
        product.save()
        return Response({"message": "Product approved"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        product = self.get_object()
        product.status = "rejected"
        product.save()
        return Response({"message": "Product rejected"})

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrSuperUser]


class AdminReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsStaffOrSuperUser]
class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            "total_users": User.objects.count(),
            "total_sellers": Seller.objects.count(),
            "total_products": Product.objects.count(),
            "total_orders": Order.objects.count(),
            "revenue": Order.objects.filter(status="completed").aggregate(Sum("total_price"))["total_price__sum"] or 0
        }
        return Response(data)