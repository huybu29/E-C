from rest_framework import serializers
from .models import Product
from account.models import Seller
class ProductSerializer(serializers.HyperlinkedModelSerializer):
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
    created_at = serializers.DateTimeField(
        read_only=True,
        help_text="Product creation timestamp"
    )
    updated_at = serializers.DateTimeField(
        read_only=True,
        help_text="Product last update timestamp"
    )
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'url', 'id', 'name', 'description', 'price', 'stock',
            'image', 'is_active', 'created_at', 'updated_at', 'category_name'
        ]
        extra_kwargs = {
            'name': {'help_text': 'Product name'},
            'description': {'help_text': 'Product description'},
        }
    def create(self, validated_data):
        seller = Seller.objects.get(user=self.context['request'].user)  # ✅ đúng kiểu
        validated_data['seller'] = seller
        return super().create(validated_data)
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'comment', 'image', 'created_at']
        read_only_fields = ['user']
