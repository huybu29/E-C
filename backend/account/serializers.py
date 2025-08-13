from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

# Serializer cho User
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # mã hóa mật khẩu
        user.save()
        # Tạo profile rỗng cho user
        Profile.objects.create(user=user)
        return user


# Serializer cho Profile
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'avatar']
class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = ['shop_name', 'phone', 'address']

    def create(self, validated_data):
        user = self.context['request'].user
        seller = Seller.objects.create(user=user, **validated_data)
        return seller