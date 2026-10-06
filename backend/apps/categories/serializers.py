import re
from rest_framework import serializers
from django.db.models import Q
from .models import Category

def resolve_category_image(image_field, request=None):
    if not image_field:
        return ''
    val = str(image_field).strip()
    if not val:
        return ''
    if val.startswith('http://') or val.startswith('https://'):
        return val
    try:
        url = image_field.url
        if '/http:/' in url or '/https:/' in url or '/http%3A/' in url or '/https%3A/' in url:
            m = re.search(r'https?://[^\s]+', val)
            if m:
                return m.group(0)
    except Exception:
        url = f"/media/{val.lstrip('/')}"
    if request is not None and not url.startswith('http'):
        return request.build_absolute_uri(url)
    return url

class SubcategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'is_active', 'order', 'product_count']

    def get_image(self, obj):
        return resolve_category_image(obj.image, self.context.get('request'))

    def get_product_count(self, obj):
        from apps.products.models import Product
        from apps.products.filters import ProductFilter
        base_qs = Product.objects.filter(is_active=True)
        return ProductFilter().filter_category(base_qs, 'category', obj.slug).count()

class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    subcategories = SubcategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'parent', 'is_active', 'order', 'subcategories', 'product_count',
            'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        return resolve_category_image(obj.image, self.context.get('request'))

    def get_product_count(self, obj):
        from apps.products.models import Product
        from apps.products.filters import ProductFilter
        base_qs = Product.objects.filter(is_active=True)
        return ProductFilter().filter_category(base_qs, 'category', obj.slug).count()

class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'is_active', 'order']
        extra_kwargs = {'slug': {'required': False}}

