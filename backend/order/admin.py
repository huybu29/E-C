from django.contrib import admin
from .models import Order, OrderItem,Address

class OrderItemInline(admin.TabularInline):  # Hoặc admin.StackedInline nếu muốn dạng khối
    model = OrderItem
    extra = 0  # Không thêm dòng trống thừa
    readonly_fields = ('product', 'quantity', 'price', )  # Nếu muốn chỉ đọc

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]  # Thêm OrderItem vào trong Order

admin.site.register(Order, OrderAdmin)
class AdressAdmin(admin.ModelAdmin):
    model = Address
admin.site.register(Address,AdressAdmin)

    