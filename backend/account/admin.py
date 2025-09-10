from django.contrib import admin
from .models import Profile, Notification
# Register your models here.
class ProfileAdmin(admin.ModelAdmin): 
    list_display = ('user', 'bio', 'avatar')
    search_fields = ('user__username', 'bio')

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_role', 'title', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'target_role')
admin.site.register(Notification, NotificationAdmin)
admin.site.register(Profile, ProfileAdmin)
from .models import Seller
class SellerAdmin(admin.ModelAdmin):
    list_display = ('user', 'shop_name', 'phone', 'address')
    search_fields = ('user__username', 'shop_name')

admin.site.register(Seller, SellerAdmin)