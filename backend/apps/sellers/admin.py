from django.contrib import admin
from .models import SellerProfile

@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'owner_name', 'email', 'phone', 'status', 'commission_rate', 'created_at')
    list_filter = ('status',)
    search_fields = ('business_name', 'owner_name', 'email', 'phone')
    list_editable = ('status', 'commission_rate')
    ordering = ('-created_at',)
