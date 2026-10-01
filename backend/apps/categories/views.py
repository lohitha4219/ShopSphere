from rest_framework import viewsets, permissions, filters
from django.db.models import Count, Q
from .models import Category
from .serializers import CategorySerializer, CategoryWriteSerializer
from apps.accounts.permissions import IsAdminRole

class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CategoryWriteSerializer
        return CategorySerializer

    def get_queryset(self):
        qs = Category.objects.all().annotate(
            product_count=Count('products', filter=Q(products__is_active=True))
        )
        # If 'flat' is requested, return all (parents and subcategories)
        if self.request.query_params.get('flat') == 'true':
            if not (self.request.user and self.request.user.is_authenticated and (self.request.user.role == 'ADMIN' or self.request.user.is_staff)):
                qs = qs.filter(is_active=True)
            return qs
            
        # By default, list top-level parent categories
        if self.action == 'list':
            qs = qs.filter(parent__isnull=True)
            if not (self.request.user and self.request.user.is_authenticated and (self.request.user.role == 'ADMIN' or self.request.user.is_staff)):
                qs = qs.filter(is_active=True)
        return qs

    def get_object(self):
        # Support lookup by either pk (numeric) or slug
        lookup_val = self.kwargs.get(self.lookup_field)
        if lookup_val and lookup_val.isdigit():
            return Category.objects.annotate(
                product_count=Count('products', filter=Q(products__is_active=True))
            ).get(pk=lookup_val)
        return super().get_object()
