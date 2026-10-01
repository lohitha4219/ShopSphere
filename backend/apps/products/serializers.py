from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant
from apps.categories.serializers import CategorySerializer
from apps.sellers.serializers import SellerProfileSerializer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'variant_type', 'name', 'sku', 'price_adjustment', 'stock_quantity', 'is_default']

class ProductListSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True, default='')
    subcategory_slug = serializers.CharField(source='subcategory.slug', read_only=True, default='')
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'seller_name', 'category', 'category_name', 'category_slug',
            'subcategory', 'subcategory_name', 'subcategory_slug',
            'name', 'slug', 'brand', 'sku', 'price', 'discount_price',
            'discount_percentage', 'final_price', 'stock_quantity', 'rating',
            'review_count', 'thumbnail', 'primary_image', 'is_active', 'is_featured',
            'is_best_seller', 'in_stock', 'created_at'
        ]

    def get_primary_image(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url if hasattr(obj.thumbnail, 'url') else str(obj.thumbnail)
        first_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if first_img and first_img.image:
            return first_img.image.url if hasattr(first_img.image, 'url') else str(first_img.image)
        return ''

class ProductDetailSerializer(serializers.ModelSerializer):
    seller = SellerProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'category', 'subcategory', 'name', 'slug',
            'description', 'short_description', 'brand', 'sku', 'price',
            'discount_price', 'discount_percentage', 'final_price',
            'stock_quantity', 'minimum_order_quantity', 'rating',
            'review_count', 'thumbnail', 'images', 'variants',
            'is_active', 'is_featured', 'is_best_seller', 'in_stock',
            'created_at', 'updated_at'
        ]

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'subcategory', 'name', 'slug',
            'description', 'short_description', 'brand', 'sku',
            'price', 'discount_price', 'discount_percentage',
            'stock_quantity', 'minimum_order_quantity', 'thumbnail',
            'is_active', 'is_featured', 'is_best_seller'
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'sku': {'required': False},
        }

    def create(self, validated_data):
        user = self.context['request'].user
        if hasattr(user, 'seller_profile'):
            validated_data['seller'] = user.seller_profile
        elif user.is_staff or user.role == 'ADMIN':
            # If admin creates, assign first approved seller or create dummy seller profile
            from apps.sellers.models import SellerProfile
            seller = SellerProfile.objects.first()
            if not seller:
                seller = SellerProfile.objects.create(
                    user=user,
                    business_name='ShopSphere Official Store',
                    owner_name=user.full_name or 'Admin',
                    email=user.email,
                    phone=user.phone or '9999999999',
                    business_address='ShopSphere HQ',
                    status=SellerProfile.Status.APPROVED
                )
            validated_data['seller'] = seller
        
        # Generate SKU if not provided
        if not validated_data.get('sku'):
            import uuid
            validated_data['sku'] = f"SKU-{uuid.uuid4().hex[:8].upper()}"

        return super().create(validated_data)
