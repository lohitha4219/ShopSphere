from django.contrib import admin
from .models import Order, OrderItem, OrderTimeline, ReturnRequest

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'variant_info', 'quantity', 'unit_price', 'total_price')

class OrderTimelineInline(admin.TabularInline):
    model = OrderTimeline
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer', 'order_status', 'payment_status', 'payment_method', 'total_amount', 'created_at')
    list_filter = ('order_status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer__email', 'customer__username')
    readonly_fields = ('order_id', 'created_at', 'updated_at')
    inlines = [OrderItemInline, OrderTimelineInline]
    ordering = ('-created_at',)

@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ('order', 'order_item', 'customer', 'status', 'reason', 'created_at')
    list_filter = ('status', 'reason')
    search_fields = ('order__order_id', 'customer__email')
