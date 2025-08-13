from django.contrib import admin
from .models import Profile
# Register your models here.
class ProfileAdmin(admin.ModelAdmin): 
    list_display = ('user', 'bio', 'avatar')
    search_fields = ('user__username', 'bio')

admin.site.register(Profile, ProfileAdmin)
from .models import Seller
class SellerAdmin(admin.ModelAdmin):
    list_display = ('user', 'shop_name', 'phone', 'address')
    search_fields = ('user__username', 'shop_name')

admin.site.register(Seller, SellerAdmin)