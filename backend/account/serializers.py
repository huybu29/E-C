from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Seller

# Serializer cho User
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Seller

# ----------------------------
# Serializer đăng ký User
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [ 'id',
            'username',
            'password',
            'email',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'last_login',]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # Tạo profile mặc định
        Profile.objects.create(user=user)
        return user

# ----------------------------
# Serializer Profile
# ----------------------------
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'bio', 'avatar', 'role', 'user', 'username', 'email','phone_number','fullname']

class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = Profile
        fields = ['id','username', 'email', 'bio', 'avatar', 'role','fullname', 'phone_number']

    def update(self, instance, validated_data):
        # Update User
        user_data = validated_data.pop('user', {})
        if 'username' in user_data:
            instance.user.username = user_data['username']
        if 'email' in user_data:
            instance.user.email = user_data['email']
        instance.user.save()

        # Update Profile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = ['shop_name', 'phone', 'address','user']

    def create(self, validated_data):
        
        return Seller.objects.create( **validated_data)
class CurrentUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    seller = SellerSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser', 'profile', 'seller','phone_number'
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'id',
            'username',
            'email',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
            'last_login']