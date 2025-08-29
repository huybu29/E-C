from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Profile(models.Model):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('seller', 'Seller'),
        ('staff', 'Staff'),      
        ('admin', 'Admin'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone_number = models.TextField(null=True) 
    fullname = models.TextField(null=True)
    def __str__(self):
        return f"{self.user.username} ({self.role})"

    # property helper để kiểm tra role
    @property
    def is_seller(self):
        return self.role == 'seller'

    @property
    def is_customer(self):
        return self.role == 'customer'

    @property
    def is_staff_member(self):
        return self.role == 'staff'

    @property
    def is_admin(self):
        return self.role == 'admin'

# ----------------------------
# Seller chỉ tạo khi user.role == 'seller'
# ----------------------------
class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller')
    shop_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.shop_name

    

    def save(self, *args, **kwargs):
        self.clean()  # gọi validate trước khi save
        super().save(*args, **kwargs)
