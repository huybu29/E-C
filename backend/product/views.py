from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Product
from .serializers import ProductSerializer
from .permissions import IsSellerOrReadOnly
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from account.models import Seller
from django.shortcuts import get_object_or_404
from rest_framework.exceptions  import PermissionDenied
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsSellerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        seller = Seller.objects.get(user=self.request.user)  # lấy Seller instance từ User
        serializer.save(seller=seller)

    def get_queryset(self):
        queryset = Product.objects.all()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)

        if search:
            queryset = queryset.filter(name__icontains=search)
        if category:
            queryset = queryset.filter(category_id=category)  # Lọc theo category_id

        return queryset
class SellerProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Lấy seller tương ứng với user
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

        serializer.save()

    def get_object(self):
        obj = get_object_or_404(Product, pk=self.kwargs["pk"])
        
        return obj
    def perform_create(self, serializer):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn chưa đăng ký làm người bán.")

        serializer.save(seller=seller)