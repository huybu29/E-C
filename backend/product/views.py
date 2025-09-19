from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Product
from .serializers import ProductSerializer, ReviewSerializer
from .permissions import IsSellerOrReadOnly
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from account.models import Seller, Notification
from django.shortcuts import get_object_or_404
from rest_framework.exceptions  import PermissionDenied
from .models import Review
from django.db.models import Sum, F
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.utils.dateparse import parse_datetime
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Q, Sum
from rest_framework.pagination import PageNumberPagination
from .models import Product, Seller
from .serializers import ProductSerializer
from .permissions import IsSellerOrReadOnly
from account.models import Seller, Notification
from django.contrib.auth.models import User
from django.contrib.postgres.search import SearchVector, SearchRank
# Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]

    search_fields = ['name']
    
    filter_backends = [filters.SearchFilter]  
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        keyword = self.request.query_params.get('keyword')
        categories = self.request.query_params.get('categories')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        rating = self.request.query_params.get('rating')
        sort = self.request.query_params.get('sort')

        # Search
        if keyword:
            queryset = queryset.filter(Q(name__icontains=keyword))

        # Categories filter
        if categories:
            ids = [int(cid) for cid in categories.split(',') if cid.isdigit()]
            queryset = queryset.filter(category__id__in=ids)

        # Price filter
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Rating filter
        if rating:
            queryset = queryset.filter(average_rating__gte=rating)

        # Sorting
        if sort == 'relevance' and keyword:
            queryset = queryset.annotate(
                search=SearchVector('name', 'description'),
            ).annotate(
                rank=SearchRank(SearchVector('name', 'description'), keyword)
            ).order_by('-rank')
        elif sort == 'bestselling':
            queryset = queryset.annotate(
                total_sold=Sum(
                    'order_items__quantity',
                    filter=Q(order_items__order__status='delivered')
                )
            ).order_by('total_sold')
        elif sort == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price')

        return queryset

    def perform_create(self, serializer):
        seller = Seller.objects.get(user=self.request.user)
        serializer.save(seller=seller)
class PublicSellerProductViewSet(viewsets.ReadOnlyModelViewSet):
   
    serializer_class = ProductSerializer
    
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["price", "updated_at", "average_rating", "stock", "name"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        seller_id = self.request.query_params.get("seller_id")
        qs = Product.objects.all()

        if seller_id:
            qs = qs.filter(seller_id=seller_id, is_active=True)  # chỉ hiển thị sản phẩm đang hoạt động

        # có thể reuse lại filter giống SellerProductViewSet nếu muốn
        search = self.request.query_params.get("search")
        category_id = self.request.query_params.get("category")

        if search:
            qs = qs.filter(name__icontains=search)
        if category_id:
            qs = qs.filter(category_id=category_id)

        return qs

class SellerProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["price", "updated_at", "average_rating", "stock", "name"]  
    ordering = ["-updated_at"]  # mặc định mới nhất lên đầu

    def get_queryset(self):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            return Product.objects.none()

        qs = Product.objects.filter(seller=seller)

        # --- Các bộ lọc thủ công ---
        search = self.request.query_params.get("search")  # thêm search
        category_id = self.request.query_params.get("category")
        status = self.request.query_params.get("status")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        min_stock = self.request.query_params.get("min_stock")
        max_stock = self.request.query_params.get("max_stock")
        is_active = self.request.query_params.get("is_active")
        updated_after = self.request.query_params.get("updated_after")
        updated_before = self.request.query_params.get("updated_before")
        min_rating = self.request.query_params.get("min_rating")
        max_rating = self.request.query_params.get("max_rating")

        if search:
            qs = qs.filter(name__icontains=search)  # filter search theo tên

        if category_id:
            qs = qs.filter(category_id=category_id)
        if status:
            qs = qs.filter(status=status)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if min_stock:
            qs = qs.filter(stock__gte=min_stock)
        if max_stock:
            qs = qs.filter(stock__lte=max_stock)
        if is_active is not None:
            if is_active.lower() in ["true", "1"]:
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ["false", "0"]:
                qs = qs.filter(is_active=False)
        if updated_after:
            qs = qs.filter(updated_at__gte=updated_after)
        if updated_before:
            qs = qs.filter(updated_at__lte=updated_before)
        if min_rating:
            qs = qs.filter(average_rating__gte=min_rating)
        if max_rating:
            qs = qs.filter(average_rating__lte=max_rating)

        return qs

    def perform_update(self, serializer):
        product = self.get_object()
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn không phải là người bán.")
        if product.seller != seller:
            raise PermissionDenied("Bạn không có quyền sửa sản phẩm này.")
        serializer.save()

    def perform_create(self, serializer):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn chưa đăng ký làm người bán.")

       
        product = serializer.save(seller=seller)

        
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                target_role="admin",
                title="Sản phẩm mới",
                link=f"/admin/products/{product.id}",
                message=f"{seller.user.username} vừa thêm sản phẩm {product.name}"
            )


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        Notification.objects.create(
        user=review.product.seller.user,
        title="Đánh giá mới",
        message=f"Sản phẩm {review.product.name} vừa nhận được 1 đánh giá."
    )
    def get_queryset(self):
        product_id = self.request.query_params.get("product")
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()
    @action(detail=True, methods=["patch"], url_path="reply", permission_classes=[IsAuthenticated])
    def reply(self, request, pk=None):
        review = self.get_object()
        try:
            seller = Seller.objects.get(user=request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn không phải là seller.")

        if review.product.seller != seller:
            raise PermissionDenied("Bạn không có quyền trả lời review này.")

        reply_text = request.data.get("reply", "")
        review.reply = reply_text
        review.save()

        # Gửi thông báo cho user đã review
        Notification.objects.create(
            user=review.user,
            title="Phản hồi từ người bán",
            message=f"Người bán {seller.shop_name} đã trả lời review của bạn về {review.product.name}."
        )

        serializer = self.get_serializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)

