from rest_framework import serializers
from .models import Product, Category
from account.models import Seller

class ProductSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        min_value=0,
        help_text="Product price (must be non-negative)"
    )
    stock = serializers.IntegerField(
        min_value=0,
        help_text="Available stock (must be non-negative)"
    )
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Product image"
    )
    is_active = serializers.BooleanField(
        default=True,
        help_text="Is the product active?"
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    seller = serializers.PrimaryKeyRelatedField(read_only=True)
    shop_name = serializers.CharField(source='seller.shop_name', read_only=True)
    final_price = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'image', 
            'is_active', 'created_at', 'updated_at', 'category_name', 
            'category', 'status', 'average_rating', 'total_reviews', 'seller','shop_name', 'discount_price', 'discount_percent', 'discount_start', 'discount_end', 'final_price'
        ]
        extra_kwargs = {
            'name': {'help_text': 'Product name'},
            'description': {'help_text': 'Product description'},
        }

    def create(self, validated_data):
        # Gán seller tự động từ request.user
        seller = Seller.objects.get(user=self.context['request'].user)
        validated_data['seller'] = seller
        return super().create(validated_data)
    def get_final_price(self, obj):
        return obj.get_final_price()
from .models import Review
from account.serializers import UserSerializer
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'comment','reply', 'image', 'created_at']
        read_only_fields = ['user']
