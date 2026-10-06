from django.contrib import admin
from .models import Product, ProductImage, ProductVariant

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('variant_type', 'name', 'sku', 'price_adjustment', 'stock_quantity', 'is_default')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'sku', 'brand', 'category', 'price',
        'discount_price', 'stock_quantity', 'rating',
        'is_active', 'is_featured', 'is_best_seller'
    )
    list_filter = ('is_active', 'is_featured', 'is_best_seller', 'category', 'brand')
    search_fields = ('name', 'sku', 'brand', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'discount_price', 'stock_quantity', 'is_active', 'is_featured', 'is_best_seller')
    inlines = [ProductImageInline, ProductVariantInline]
    ordering = ('-created_at',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'brand', 'sku', 'seller', 'category', 'subcategory')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'discount_price', 'discount_percentage', 'stock_quantity', 'minimum_order_quantity')
        }),
        ('Descriptions & Media', {
            'fields': ('short_description', 'description', 'thumbnail')
        }),
        ('Flags & Status', {
            'fields': ('is_active', 'is_featured', 'is_best_seller', 'rating', 'review_count')
        }),
    )

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary',)
    search_fields = ('product__name', 'alt_text')

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'variant_type', 'name', 'sku', 'price_adjustment', 'stock_quantity', 'is_default')
    list_filter = ('variant_type', 'is_default')
    search_fields = ('product__name', 'name', 'sku')
