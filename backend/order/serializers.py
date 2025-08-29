from rest_framework import serializers
from .models import Order, OrderItem
from product.models import Product
from product.serializers import ProductSerializer
from django.contrib.auth.models import User

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# OrderItem Serializer cho output
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


# Order Serializer cho output
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'created_at', 'updated_at',
            'status', 'total_price', 'items',
            'address', 'shipping_cost', 'shipping_method', 'seller'
        ]


# OrderItem Serializer cho input (tạo mới)
class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity', 'price', 'seller_id']


# Order Create Serializer cho input (tạo mới)
class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['address', 'shipping_method', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        order = Order.objects.create(user=user, **validated_data)

        total_price = 0
        for item in items_data:
            product = item['product']
            quantity = item['quantity']
            price = product.price * quantity
            OrderItem.objects.create(order=order, product=product, quantity=quantity, price=price)
            total_price += price

        order.shipping_cost = 30000
        order.total_price = total_price + order.shipping_cost
        order.save()

        return order

from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'province', 'ward', 'detail_address', 'is_default']
