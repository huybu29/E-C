from django.db import models
from django.contrib.auth.models import User
from product.models import Product

class Order(models.Model):
    SHIPPING_METHOD_CHOICE={
        'standard': 'Giao hàng tiêu chuẩn (3-5 ngày)',
        'express': 'Giao hàng nhanh (1-2 ngày)',
        'pickup': 'Nhận tại cửa hàng',
    }
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, default='pending')
    total_price = models.IntegerField(default=0)
    address = models.CharField(max_length=255, blank=True)
    shipping_method=models.CharField(
        max_length=20,
        choices=SHIPPING_METHOD_CHOICE.items(),
        default='standard'
    )
    shipping_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"
    @staticmethod
    def calculate_shipping_cost(method):
        if method == 'express':
            return 30000  # 30k VND
        elif method == 'standard':
            return 15000  # 15k VND
        return 0

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} (Order #{self.order.id})"
