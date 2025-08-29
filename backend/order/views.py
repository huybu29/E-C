from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum, F, Count, Q
from django.utils.timezone import now, timedelta
from django.db import transaction

from .models import Order, OrderItem, Address
from .serializers import OrderSerializer, OrderItemSerializer,AddressSerializer
from product.models import Product   # 🔥 cần import
from account.models import Seller


# ------------------------ ORDER VIEWSET ------------------------
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Tạo order và tự động tách đơn theo từng seller
        """
        data = request.data
        user = request.user
        items = data.get("items", [])

        if not items:
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Gom sản phẩm theo seller
        grouped_items = {}
        for item in items:
            seller_id = item.get("seller_id")
            if not seller_id:
                return Response({"error": "Each item must include seller_id"}, status=status.HTTP_400_BAD_REQUEST)
            grouped_items.setdefault(seller_id, []).append(item)

        created_orders = []

        # Tạo order riêng cho từng seller
        for seller_id, seller_items in grouped_items.items():
            order = Order.objects.create(
                user=user,
                seller_id=seller_id,   # 🔥 mỗi order gắn với 1 seller
                address=data.get("address"),
                shipping_method=data.get("shipping_method", "standard"),
                status="pending",
                shipping_cost=data.get("shipping_cost", 0),
            )

            total_price = 0
            for item in seller_items:
                try:
                    product = Product.objects.get(id=item["product_id"])
                except Product.DoesNotExist:
                    transaction.set_rollback(True)
                    return Response({"error": f"Product {item['product_id']} not found"}, status=status.HTTP_400_BAD_REQUEST)

                quantity = int(item.get("quantity", 1))
                price = float(item.get("price", product.price))

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price,
                )
                total_price += price * quantity

            order.total_price = total_price + float(order.shipping_cost)
            order.save()
            created_orders.append(order)

        serializer = self.get_serializer(created_orders, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        # User chỉ thấy đơn của mình
        return Order.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        previous_status = order.status

        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        updated_status = serializer.validated_data.get('status', previous_status)

        if previous_status != 'delivered' and updated_status == 'delivered':
            for item in order.items.all():
                product = item.product
                if product.stock < item.quantity:
                    raise PermissionDenied(f"Sản phẩm {product.name} không đủ tồn kho")
                product.stock -= item.quantity
                product.save()

        return Response(serializer.data, status=status.HTTP_200_OK)


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# ------------------------ SELLER ORDER LIST ------------------------
class SellerOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            seller = Seller.objects.get(user=self.request.user)
        except Seller.DoesNotExist:
            raise PermissionDenied("Bạn không phải là người bán.")

        qs = Order.objects.filter(seller=seller)  # 🔥 dùng trực tiếp trường seller

        # --- Bộ lọc ---
        status_val = self.request.query_params.get("status")
        if status_val:
            qs = qs.filter(status=status_val)

        shipping_method = self.request.query_params.get("shipping_method")
        if shipping_method:
            qs = qs.filter(shipping_method=shipping_method)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            qs = qs.filter(total_price__gte=min_price)

        max_price = self.request.query_params.get("max_price")
        if max_price:
            qs = qs.filter(total_price__lte=max_price)

        created_after = self.request.query_params.get("created_after")
        if created_after:
            qs = qs.filter(created_at__date__gte=created_after)

        created_before = self.request.query_params.get("created_before")
        if created_before:
            qs = qs.filter(created_at__date__lte=created_before)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(user__username__icontains=search) |
                Q(id__icontains=search)
            )

        return qs


# ------------------------ SELLER ORDER DETAIL ------------------------
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

        if order.seller != seller:
            raise PermissionDenied("Bạn không có quyền xem đơn hàng này.")
        return order

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        previous_status = order.status

        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        updated_status = serializer.validated_data.get('status', previous_status)

        if previous_status != 'delivered' and updated_status == 'delivered':
            for item in order.items.all():  # chỉ đơn của seller hiện tại
                product = item.product
                if product.stock < item.quantity:
                    raise PermissionDenied(f"Sản phẩm {product.name} không đủ tồn kho")
                product.stock -= item.quantity
                product.save()

        return Response(serializer.data, status=status.HTTP_200_OK)


# ------------------------ SELLER STATS ------------------------
class SellerStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            seller = Seller.objects.get(user=request.user)
        except Seller.DoesNotExist:
            return Response({"detail": "Bạn không phải là người bán."}, status=403)

        today = now().date()
        last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

        # Doanh thu theo ngày
        revenue_by_day = []
        for day in last_7_days:
            total = (
                OrderItem.objects.filter(
                    order__seller=seller,
                    order__created_at__date=day,
                    order__status='delivered'
                ).aggregate(total_revenue=Sum(F('price') * F('quantity')))['total_revenue'] or 0
            )
            revenue_by_day.append({"date": day.strftime("%Y-%m-%d"), "revenue": total})

        # Đơn hàng theo trạng thái
        orders_by_status = (
            Order.objects.filter(seller=seller)
            .values('status')
            .annotate(count=Count('id', distinct=True))
        )

        # Top sản phẩm
        top_products = (
            OrderItem.objects.filter(order__seller=seller, order__status='delivered')
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
