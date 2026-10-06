from django.contrib import admin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'minimum_order_amount', 'times_used', 'usage_limit', 'is_active', 'expiry_date')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code', 'description')
    list_editable = ('is_active',)
