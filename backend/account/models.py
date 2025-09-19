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
    @property
    def avatar_url(self):
        if self.avatar:  # nếu user đã upload
            return self.avatar.url
        # nếu chưa upload → trả URL mặc định
        return f"https://ui-avatars.com/api/?name={self.user.username}&background=random&color=fff"
# ----------------------------
# Seller chỉ tạo khi user.role == 'seller'
# ----------------------------
class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller')
    shop_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False) 
    logo = models.ImageField(upload_to='seller/logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='seller/banners/', blank=True, null=True)
    description = models.TextField(blank=True)
    email_contact = models.EmailField(blank=True)
    def __str__(self):
        return self.shop_name

    

    def save(self, *args, **kwargs):
        self.clean()  # gọi validate trước khi save
        super().save(*args, **kwargs)
    
class Notification(models.Model):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("seller", "Seller"),
        ("staff", "Staff"),
        ("admin", "Admin"),
    )

    # Nếu gửi riêng thì có user, nếu gửi chung thì có target_role
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True
    )
    target_role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=True, blank=True)

    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, null=True, blank=True)
    def __str__(self):
        if self.user:
            return f"{self.user.username} - {self.title}"
        return f"{self.target_role} - {self.title}"