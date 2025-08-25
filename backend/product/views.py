from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Product
from .serializers import ProductSerializer, ReviewSerializer
from .permissions import IsSellerOrReadOnly
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from account.models import Seller
from django.shortcuts import get_object_or_404
from rest_framework.exceptions  import PermissionDenied
from .models import Review
from django.db.models import Sum, F
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response    

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
   
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, status="approved")
        keyword = self.request.query_params.get('keyword')
        categories = self.request.query_params.get('categories')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')  
        rating = self.request.query_params.get('rating')
        sort = self.request.query_params.get('sort')  # filter ngang

        # Search theo từ khóa
        if keyword:
            queryset = queryset.filter(Q(name__icontains=keyword))

        # Filter theo categories
        if categories:
            ids = categories.split(',')
            queryset = queryset.filter(category__id__in=ids)

        # Filter theo khoảng giá
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter theo rating
        if rating:
            queryset = queryset.filter(average_rating__gte=rating)

        # Filter ngang (sort)
        if sort == 'relevance':
            queryset = queryset.order_by('-id')  # mặc định
        elif sort == 'bestselling':
            queryset = queryset.annotate(total_sold=Sum('orderitem__quantity')).order_by('-total_sold')
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


class SellerProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    

    def get_queryset(self):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            return Product.objects.none()
        return Product.objects.filter(seller=seller)

    def perform_update(self, serializer):
        product = self.get_object()
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn không phải là người bán.")
        if product.seller != seller:
            raise PermissionDenied("Bạn không có quyền sửa sản phẩm này.")
        serializer.save(seller=seller, status="pending")

    def perform_create(self, serializer):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn chưa đăng ký làm người bán.")
        serializer.save(seller=seller)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        product_id = self.request.query_params.get("product")
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()

    @action(detail=True, methods=["post"], url_path="reply")
    def reply(self, request, pk=None):
        review = self.get_object()
        reply_text = request.data.get("reply")
        if not reply_text:
            return Response({"error": "Nội dung reply không được để trống"}, status=400)
        review.reply = reply_text
        review.save()
        return Response(self.get_serializer(review).data)
