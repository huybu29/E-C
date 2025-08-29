from django.contrib import admin
from .models import Product, Review
# Register your models here.
class ReviewInline(admin.TabularInline):
    model = Review
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'price', 'stock', 'image', 
            'is_active', 'created_at', 'updated_at', 
            'status', 'average_rating', 'total_reviews', )
    search_fields = ('name',)  # Assuming you have a name field in your Product model
    inlines = [ReviewInline]
admin.site.register(Product, ProductAdmin)
