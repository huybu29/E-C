from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Profile, Seller
from .serializers import ProfileSerializer, UserSerializer, AdminUserSerializer , ProfileUpdateSerializer, SellerSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from category.models import Category
from product.models import Product, Review
from order.models import Order, OrderItem
from order.serializers import OrderSerializer
from product.serializers import ProductSerializer, ReviewSerializer
from django.db.models.functions import TruncMonth
from django.db.models import Count, Sum, F, Func, Value
from .serializers import AdminUserSerializer
from .permissions import IsStaffOrSuperUser
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from django.db.models.functions import TruncMonth

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return ProfileSerializer
# API Đăng ký User
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response({"detail": "Mật khẩu hiện tại không đúng"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"detail": "Đổi mật khẩu thành công"})
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
   
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsStaffOrSuperUser]

    # PATCH/PUT toàn bộ user (update tất cả field)
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# ================== ADMIN PRODUCT ==================
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

# ================== ADMIN ORDER ==================
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrSuperUser]

    # PATCH/PUT toàn bộ đơn hàng
    def update(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # Xóa một sản phẩm trong đơn hàng
    @action(detail=True, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def delete_item(self, request, pk=None, item_id=None):
        try:
            item = OrderItem.objects.get(id=item_id, order_id=pk)
            item.delete()
            return Response({"message": "Item deleted"}, status=status.HTTP_204_NO_CONTENT)
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

    # Chỉnh sửa quantity hoặc price của sản phẩm trong đơn
    @action(detail=True, methods=["patch"], url_path="items/(?P<item_id>[^/.]+)")
    def update_item(self, request, pk=None, item_id=None):
        try:
            item = OrderItem.objects.get(id=item_id, order_id=pk)
            item.quantity = request.data.get("quantity", item.quantity)
            item.price = request.data.get("price", item.price)
            item.save()
            return Response({
                "id": item.id,
                "quantity": item.quantity,
                "price": item.price
            }, status=status.HTTP_200_OK)
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsStaffOrSuperUser]
    
from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDay
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Tổng số
        total_users = User.objects.count()
        total_sellers = Seller.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        revenue = Order.objects.filter(status="delivered").aggregate(
            Sum("total_price")
        )["total_price__sum"] or 0

        # Thống kê order theo status
        order_status = (
            Order.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        # Sản phẩm theo category
        product_categories = (
            Product.objects.values(category_name=F("category__name"))
            .annotate(count=Count("id"))
            .order_by("category_name")
        )

        # Tăng trưởng user theo ngày
        user_growth = (
            User.objects.annotate(day=TruncDay("date_joined"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        # Doanh thu theo ngày (chỉ các đơn đã delivered)
        revenue_per_day = (
            Order.objects.filter(status="delivered")
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(total=Sum("total_price"))
            .order_by("day")
        )

        data = {
            "total_users": total_users,
            "total_sellers": total_sellers,
            "total_products": total_products,
            "total_orders": total_orders,
            "revenue": revenue,
            "orderStatus": list(order_status),
            "productCategories": list(product_categories),
            "userGrowth": [
                {"day": u["day"].strftime("%Y-%m-%d"), "count": u["count"]}
                for u in user_growth
            ],
            "revenuePerDay": [
                {"day": r["day"].strftime("%Y-%m-%d"), "total": r["total"]}
                for r in revenue_per_day
            ],
        }

        return Response(data)
