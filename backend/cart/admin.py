from django.contrib import admin
from .models import Cart, CartItem
# Register your models here.
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at')

admin.site.register(Cart, CartAdmin)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product', 'quantity', 'updated_at')
    search_fields = ('cart__user__username', 'product__name') 
admin.site.register(CartItem, CartItemAdmin)