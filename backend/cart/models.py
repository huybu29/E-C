from django.db import models

from product.models import Product
from django.contrib.auth.models import User

class CartItem(models.Model):
    """
    Represents an item in a user's cart.
    """
    cart = models.ForeignKey('Cart', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('cart', 'product')
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        ordering = ['product']

    def __str__(self):
        return f"{self.product.name} (x{self.quantity}) in {self.cart.user.username}'s cart"

class Cart(models.Model):
    """
    Represents a user's shopping cart.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.user.username}'s cart - {self.items.count()} items"

    def total_price(self):
        return sum(item.product.price * item.quantity for item in self.items.all())