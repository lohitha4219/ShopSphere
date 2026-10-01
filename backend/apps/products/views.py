from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Product, ProductImage, ProductVariant
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, ProductImageSerializer,
    ProductVariantSerializer
)
from .filters import ProductFilter
from apps.accounts.permissions import IsSellerOrAdmin, IsAdminRole

from rest_framework.pagination import PageNumberPagination

class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'brand', 'description', 'short_description', 'sku', 'category__name']
    ordering_fields = ['price', 'created_at', 'rating', 'review_count', 'discount_percentage']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'brands', 'featured', 'deals', 'best_sellers', 'similar']:
            return [permissions.AllowAny()]
        return [IsSellerOrAdmin()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = Product.objects.select_related('seller', 'category', 'subcategory').prefetch_related('images', 'variants')
        
        # If user is viewing seller's own products
        if self.request.query_params.get('seller_only') == 'true' and self.request.user.is_authenticated:
            if hasattr(self.request.user, 'seller_profile'):
                return qs.filter(seller=self.request.user.seller_profile)
            elif self.request.user.role == 'ADMIN' or self.request.user.is_staff:
                return qs

        # If user is admin viewing admin table
        if self.request.query_params.get('admin_view') == 'true' and self.request.user.is_authenticated:
            if self.request.user.role == 'ADMIN' or self.request.user.is_staff:
                return qs

        # Default public view: only active products
        qs = qs.filter(is_active=True)

        # Handle custom sort shortcuts
        sort_by = self.request.query_params.get('ordering')
        if sort_by == 'price_asc':
            qs = qs.order_by('price')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-price')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating', '-review_count')
        elif sort_by == 'popularity':
            qs = qs.order_by('-review_count', '-rating')
        elif sort_by == 'discount':
            qs = qs.order_by('-discount_percentage')

        return qs

    def get_object(self):
        lookup_val = self.kwargs.get(self.lookup_field)
        if lookup_val and lookup_val.isdigit():
            # Support lookup by primary key ID as well
            obj = get_object_or_404(
                Product.objects.select_related('seller', 'category').prefetch_related('images', 'variants'),
                pk=lookup_val
            )
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def perform_destroy(self, instance):
        # Validate seller ownership
        user = self.request.user
        if not (user.is_staff or user.role == 'ADMIN'):
            if not (hasattr(user, 'seller_profile') and instance.seller == user.seller_profile):
                return Response({'error': 'You do not have permission to delete this product.'}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()

    @action(detail=False, methods=['get'])
    def brands(self, request):
        brands = Product.objects.filter(is_active=True).exclude(brand='').values_list('brand', flat=True).distinct()
        return Response(list(brands))

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = Product.objects.filter(is_active=True, is_featured=True)[:10]
        return Response(ProductListSerializer(products, many=True).data)

    @action(detail=False, methods=['get'])
    def deals(self, request):
        products = Product.objects.filter(is_active=True, discount_percentage__gt=10).order_by('-discount_percentage')[:12]
        return Response(ProductListSerializer(products, many=True).data)

    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        products = Product.objects.filter(is_active=True, is_best_seller=True)[:12]
        if not products.exists():
            products = Product.objects.filter(is_active=True).order_by('-rating')[:12]
        return Response(ProductListSerializer(products, many=True).data)

    @action(detail=True, methods=['get'])
    def similar(self, request, slug=None):
        product = self.get_object()
        similar_items = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:8]
        return Response(ProductListSerializer(similar_items, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsSellerOrAdmin])
    def add_image(self, request, slug=None):
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsSellerOrAdmin])
    def add_variant(self, request, slug=None):
        product = self.get_object()
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
