from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Profile, Seller, Notification
from .serializers import ProfileSerializer, UserSerializer, AdminUserSerializer , ProfileUpdateSerializer, SellerSerializer, NotificationSerializer
from django.db.models import Q
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
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from .token import account_activation_token
from django.db.models.functions import TruncMonth
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Tạo user chưa active
        user = serializer.save(is_active=False)

        # Tạo link xác nhận
        token = account_activation_token.make_token(user)
        activation_link = request.build_absolute_uri(
            reverse("activate", kwargs={"uid": user.pk, "token": token})
        )

        # Nội dung email
        subject = "Xác nhận tài khoản của bạn"
        message = f"""
        Xin chào {user.username},

        Vui lòng nhấn vào link sau để kích hoạt tài khoản:
        {activation_link}
        """

        # Gửi email
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,  # Gmail chung
            [user.email],                 # Gmail user nhập khi đăng ký
            fail_silently=False,
        )

        return Response(
            {"detail": "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận."},
            status=status.HTTP_201_CREATED,
        )
class GoogleAuthView(APIView):
    def post(self, request):
        try:
            # Lấy ID token từ frontend
            token = request.data.get("token")
            if not token:
                return Response({"error": "Token is required"}, status=400)

            # Xác minh token với Google
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),      # <-- dùng google_requests.Request()
                "505731603497-l5t49j3pmpkfevdb7bgoki9apruatk63.apps.googleusercontent.com"         # thay bằng client_id thật từ Google Console
            )
            # Lấy thông tin từ Google
            email = idinfo["email"]
            name = idinfo.get("name", email.split("@")[0])

            # Tạo user nếu chưa tồn tại
            user, created = User.objects.get_or_create(
                username=email,
                defaults={"email": email, "first_name": name}
            )
            if created:
                fullname = idinfo.get("name", email.split("@")[0])
                avatar_url = idinfo.get("picture", None)  # có thể None nếu Google không gửi
                Profile.objects.create(
                    user=user,
                    fullname=fullname,
                    avatar=avatar_url,  # nếu muốn lưu URL trực tiếp hoặc cần tải về lưu Media
                    role="customer"
                )
            else:
                if not hasattr(user, "profile"):
                    fullname = idinfo.get("name", email.split("@")[0])
                    Profile.objects.create(user=user, fullname=fullname, role="customer")

            # Phát hành JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": created
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)

@api_view(["GET"])
def activate(request, uid, token):
    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response({"detail": "Người dùng không tồn tại"}, status=status.HTTP_400_BAD_REQUEST)

    if account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({"detail": "Tài khoản đã được kích hoạt! Bạn có thể đăng nhập."}, status=status.HTTP_200_OK)
    else:
        return Response({"detail": "Link không hợp lệ hoặc đã hết hạn."}, status=status.HTTP_400_BAD_REQUEST)
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
        # Chỉ hiện seller của user
        return Seller.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Lưu nhưng chưa approved
        seller = serializer.save(user=request.user, is_approved=False)
        Notification.objects.create(
            target_role="admin",
            link=f"/admin/sellers/{seller.id}/",
            message=f"Người dùng {request.user.username} vừa đăng ký seller mới: {seller.shop_name}"
        )
        return Response({
            "detail": "Đăng ký seller thành công. Vui lòng chờ admin duyệt.",
            "seller_id": seller.id
        }, status=status.HTTP_201_CREATED)
   
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
        Notification.objects.create(
            user=product.seller.user,
            target_role="seller",
            link=f"/admin/products/{product.id}/",
            message=f"Sản phẩm {product.name} đã được duyệt."
        )

        return Response({"message": "Product approved"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        product = self.get_object()
        product.status = "rejected"
        product.save()
        Notification.objects.create(
            user=product.seller.user,
            target_role="seller",
            link=f"/admin/products/{product.id}/",
            message=f"Sản phẩm {product.name} đã bị từ chối."
        )

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
        Notification.objects.create(
            user=order.user,
            target_role="customer",
            link=f"/orders/{order.id}/",
            message=f"Đơn hàng #{order.id} đã được cập nhật sang trạng thái {updated_status}"
        )
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
class AdminSellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
    permission_classes = [IsStaffOrSuperUser]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        seller = self.get_object()
        seller.is_approved = True
        seller.save()
        Notification.objects.create(
        user=seller.user,
        target_role="seller",
        message=f"Tài khoản bán hàng {seller.shop_name} đã được duyệt."
)
        return Response({"detail": f"Seller {seller.shop_name} đã được duyệt."})

from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDay
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
import calendar
from django.utils.timezone import now



class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = now().date()

        # --------------------------
        # Tổng số
        # --------------------------
        total_users = User.objects.count()
        total_sellers = Seller.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        revenue = (
            Order.objects.filter(status="delivered").aggregate(Sum("total_price"))[
                "total_price__sum"
            ]
            or 0
        )

        # --------------------------
        # Đơn hàng theo trạng thái
        # --------------------------
        order_status = (
            Order.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("status")
        )

        # --------------------------
        # Sản phẩm theo category
        # --------------------------
        product_categories = (
            Product.objects.values(category_name=F("category__name"))
            .annotate(count=Count("id"))
            .order_by("category_name")
        )

        # --------------------------
        # Tăng trưởng user (ngày / tuần / tháng)
        # --------------------------
        user_by_day = (
            User.objects.annotate(day=TruncDay("date_joined"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        user_by_week = (
            User.objects.filter(date_joined__month=today.month, date_joined__year=today.year)
            .annotate(week=TruncWeek("date_joined"))
            .values("week")
            .annotate(count=Count("id"))
            .order_by("week")
        )

        user_by_month = (
            User.objects.filter(date_joined__year=today.year)
            .annotate(month=TruncMonth("date_joined"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        # --------------------------
        # Doanh thu (ngày / tuần / tháng)
        # --------------------------
        revenue_by_day = (
            Order.objects.filter(status="delivered")
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(total=Sum("total_price"))
            .order_by("day")
        )

        revenue_by_week = (
            Order.objects.filter(
                status="delivered",
                created_at__month=today.month,
                created_at__year=today.year,
            )
            .annotate(week=TruncWeek("created_at"))
            .values("week")
            .annotate(total=Sum("total_price"))
            .order_by("week")
        )

        revenue_by_month = (
            Order.objects.filter(status="delivered", created_at__year=today.year)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("total_price"))
            .order_by("month")
        )

        # --------------------------
        # Format dữ liệu trả về
        # --------------------------
        data = {
            "total_users": total_users,
            "total_sellers": total_sellers,
            "total_products": total_products,
            "total_orders": total_orders,
            "revenue": revenue,
            "orderStatus": list(order_status),
            "productCategories": list(product_categories),

            # User growth
            "userGrowthByDay": [
                {"day": u["day"].strftime("%Y-%m-%d"), "count": u["count"]}
                for u in user_by_day
            ],
            "userGrowthByWeek": [
                {"week": f"Tuần {u['week'].strftime('%W (%d-%m-%Y)')}", "count": u["count"]}
                for u in user_by_week
            ],
            "userGrowthByMonth": [
                {"month": u["month"].strftime("%m-%Y"), "count": u["count"]}
                for u in user_by_month
            ],

            # Revenue growth
            "revenueByDay": [
                {"day": r["day"].strftime("%Y-%m-%d"), "total": r["total"]}
                for r in revenue_by_day
            ],
            "revenueByWeek": [
                {"week": f"Tuần {r['week'].strftime('%W (%d-%m-%Y)')}", "count": r["total"]}
                for r in revenue_by_week
            ],
            "revenueByMonth": [
                {"month": r["month"].strftime("%m-%Y"), "total": r["total"]}
                for r in revenue_by_month
            ],
        }

        return Response(data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or user.is_staff:
            role = "admin"
        elif hasattr(user, "profile"):
            role = user.profile.role
        else:
            role = None

        return Notification.objects.filter(
            Q(user=user) | Q(target_role=role)
        ).order_by("-created_at")