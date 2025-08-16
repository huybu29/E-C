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
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='reviews/', null=True, blank=True)
    def __str__(self):
        return f"Review for {self.product.name} by {self.user.username}"
    class Meta:
        unique_together = ("product", "user")  # Một người chỉ review 1 lần

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Cập nhật điểm trung bình sản phẩm
        reviews = Review.objects.filter(product=self.product)
        avg = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        self.product.average_rating = round(avg, 1)
        self.product.total_reviews = reviews.count()
        self.product.save()