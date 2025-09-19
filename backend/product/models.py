from django.db import models
from decimal import Decimal
from category.models import Category
from account.models import Seller
from django.utils import timezone
from django.contrib.auth.models import User
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products',null=True, blank=True)
    price = models.IntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    STATUS_CHOICES = (
        ("pending", "Pending"),   # chờ staff duyệt
        ("approved", "Approved"), # đã được duyệt
        ("rejected", "Rejected"), # bị từ chối
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    average_rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    discount_percent = models.PositiveIntegerField(null=True, blank=True)
    discount_start = models.DateTimeField(null=True, blank=True)
    discount_end = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return self.name
    def get_final_price(self):
            
        now = timezone.now()
        if self.discount_start and self.discount_end:
            if self.discount_start <= now <= self.discount_end:
                if self.discount_price and self.discount_price < self.price:
                    return self.discount_price
                if self.discount_percent and 0 < self.discount_percent <= 100:
                    return self.price * (100 - self.discount_percent) / 100
        return self.price
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    comment = models.TextField(blank=True)
    image = models.ImageField(upload_to='reviews/', null=True, blank=True)
    reply = models.TextField(blank=True, null=True)  # phản hồi của seller
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.username}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_rating()

    def update_product_rating(self):
        reviews = Review.objects.filter(product=self.product)
        avg = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        self.product.average_rating = round(avg, 1)
        self.product.total_reviews = reviews.count()
        self.product.save()
