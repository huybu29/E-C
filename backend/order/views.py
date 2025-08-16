from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from cart.models import Cart, CartItem
from account.models import Seller
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum, Count, F
from django.utils.timezone import now, timedelta
from rest_framework.views import APIView
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        cart, created = Cart.objects.get_or_create(user=user)
        cart_items = CartItem.objects.filter(cart=cart)
        address = request.data.get('address', '')
        shipping_method = request.data.get('shipping_method', '')
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo đơn hàng
        order = Order.objects.create(user=user, shipping_method=shipping_method)

        total = 0
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
                 # hoặc tính động
            )
            
            total += item.product.price * item.quantity

        # Cập nhật tổng giá đơn hàng
        order.shipping_cost = Order.calculate_shipping_cost(shipping_method)
        total += order.shipping_cost
        order.address = address
        order.total_price = total
        order.save()

        # Xoá giỏ hàng
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)
class SellerOrderListView(viewsets.ModelViewSet):
    
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        seller = getattr(user, "seller", None)
        if not seller:
            return Order.objects.none()

        # Lấy tất cả Order có ít nhất 1 sản phẩm thuộc seller này
        return Order.objects.filter(
            items__product__seller=seller
        ).distinct()
class SellerOrderDetailView(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        order = super().get_object()
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn không phải là người bán.")
        
        # Kiểm tra đơn hàng có ít nhất 1 sản phẩm thuộc shop của seller
        seller_products_ids = seller.products.values_list('id', flat=True)
        if not order.items.filter(product_id__in=seller_products_ids).exists():
            raise PermissionDenied("Bạn không có quyền xem đơn hàng này.")
        return order
class SellerStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            seller = Seller.objects.get(user=request.user)
        except Seller.DoesNotExist:
            return Response({"detail": "Bạn không phải là người bán."}, status=403)

        # Doanh thu theo ngày
        today = now().date()
        last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        revenue_by_day = []
        for day in last_7_days:
            total = (
                OrderItem.objects.filter(
                    product__seller=seller,
                    order__created_at__date=day
                )
                .aggregate(total_revenue=Sum(F('price') * F('quantity')))['total_revenue'] or 0
            )
            revenue_by_day.append({"date": day.strftime("%Y-%m-%d"), "revenue": total})

        # Đơn hàng theo trạng thái
        orders_by_status = (
            Order.objects.filter(items__product__seller=seller)
            .values('status')
            .annotate(count=Count('id', distinct=True))
        )

        # Top sản phẩm bán chạy
        top_products = (
            OrderItem.objects.filter(product__seller=seller)
            .values('product__name')
            .annotate(quantity=Sum('quantity'))
            .order_by('-quantity')[:5]
        )
        top_products = [{"name": p["product__name"], "quantity": p["quantity"]} for p in top_products]

        return Response({
            "revenue_by_day": revenue_by_day,
            "orders_by_status": list(orders_by_status),
            "top_products": top_products,
        })  