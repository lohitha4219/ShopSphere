from rest_framework import serializers
from django.db.models import Q
from .models import Category

class SubcategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'is_active', 'order', 'product_count']

    def get_product_count(self, obj):
        from apps.products.models import Product
        from apps.products.filters import ProductFilter
        base_qs = Product.objects.filter(is_active=True)
        return ProductFilter().filter_category(base_qs, 'category', obj.slug).count()

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image',
            'parent', 'is_active', 'order', 'subcategories', 'product_count',
            'created_at', 'updated_at'
        ]

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

