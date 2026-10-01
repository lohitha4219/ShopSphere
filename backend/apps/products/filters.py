import django_filters
from django.db.models import Q
from .models import Product

class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(method='filter_category')
    subcategory = django_filters.CharFilter(method='filter_subcategory')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    min_discount = django_filters.NumberFilter(field_name='discount_percentage', lookup_expr='gte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='iexact')
    seller = django_filters.NumberFilter(field_name='seller_id')
    featured = django_filters.BooleanFilter(field_name='is_featured')
    best_seller = django_filters.BooleanFilter(field_name='is_best_seller')

    class Meta:
        model = Product
        fields = ['category', 'subcategory', 'brand', 'min_price', 'max_price', 'min_rating', 'min_discount', 'in_stock', 'seller', 'featured', 'best_seller']

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        val_str = str(value).strip()
        if val_str.isdigit():
            val_id = int(val_str)
            return queryset.filter(
                Q(category_id=val_id) |
                Q(category__parent_id=val_id) |
                Q(subcategory_id=val_id) |
                Q(subcategory__parent_id=val_id)
            ).distinct()

        from django.utils.text import slugify
        slug_val = slugify(val_str).lower()
        raw_lower = val_str.lower()

        # Special Category Mappings for Task 5 departments
        CATEGORY_MAPPINGS = {
            'mens-wear': Q(category__slug__in=['mens-wear', 'mens-fashion']) | Q(subcategory__slug__in=['mens-wear', 'mens-fashion']) | Q(name__icontains="Men's"),
            'men-s-wear': Q(category__slug__in=['mens-wear', 'mens-fashion']) | Q(subcategory__slug__in=['mens-wear', 'mens-fashion']) | Q(name__icontains="Men's"),
            'mens-fashion': Q(category__slug__in=['mens-wear', 'mens-fashion']) | Q(subcategory__slug__in=['mens-wear', 'mens-fashion']) | Q(name__icontains="Men's"),
            
            'womens-wear': Q(category__slug__in=['womens-wear', 'womens-fashion']) | Q(subcategory__slug__in=['womens-wear', 'womens-fashion']) | Q(name__icontains="Women's"),
            'women-s-wear': Q(category__slug__in=['womens-wear', 'womens-fashion']) | Q(subcategory__slug__in=['womens-wear', 'womens-fashion']) | Q(name__icontains="Women's"),
            'womens-fashion': Q(category__slug__in=['womens-wear', 'womens-fashion']) | Q(subcategory__slug__in=['womens-wear', 'womens-fashion']) | Q(name__icontains="Women's"),

            'kids-wear': Q(category__slug__in=['kids-wear', 'kids-fashion']) | Q(subcategory__slug__in=['kids-wear', 'kids-fashion']) | Q(name__icontains="Kids"),
            'kid-s-wear': Q(category__slug__in=['kids-wear', 'kids-fashion']) | Q(subcategory__slug__in=['kids-wear', 'kids-fashion']) | Q(name__icontains="Kids"),
            'kids-fashion': Q(category__slug__in=['kids-wear', 'kids-fashion']) | Q(subcategory__slug__in=['kids-wear', 'kids-fashion']) | Q(name__icontains="Kids"),

            'sarees': Q(category__slug='sarees') | Q(subcategory__slug='sarees') | Q(name__icontains='saree'),
            'saree': Q(category__slug='sarees') | Q(subcategory__slug='sarees') | Q(name__icontains='saree'),

            'dresses': Q(category__slug='dresses') | Q(subcategory__slug='dresses') | Q(name__icontains='kurti') | Q(name__icontains='dress') | Q(name__icontains='anarkali'),
            'dress': Q(category__slug='dresses') | Q(subcategory__slug='dresses') | Q(name__icontains='kurti') | Q(name__icontains='dress') | Q(name__icontains='anarkali'),

            'college-wear': Q(category__slug='college-wear') | Q(subcategory__slug='college-wear') | Q(name__icontains='shirt') | Q(name__icontains='jeans') | Q(name__icontains='sneakers') | Q(name__icontains='t-shirt'),
            'party-wear': Q(category__slug='party-wear') | Q(subcategory__slug='party-wear') | Q(name__icontains='saree') | Q(name__icontains='anarkali') | Q(name__icontains='perfume') | Q(name__icontains='fragrance') | Q(name__icontains='handbag'),
            'office-wear': Q(category__slug='office-wear') | Q(subcategory__slug='office-wear') | Q(name__icontains='shirt') | Q(name__icontains='watch') | Q(name__icontains='laptop'),

            'footwear': Q(category__slug='footwear') | Q(subcategory__parent__slug='footwear') | Q(category__parent__slug='footwear') | Q(subcategory__slug__in=['sneakers', 'running-shoes', 'formal-shoes', 'casual-sandals']) | Q(name__icontains='shoes') | Q(name__icontains='sneakers'),
            'accessories': Q(category__slug__in=['accessories', 'audio-accessories']) | Q(subcategory__slug__in=['accessories', 'audio-accessories']) | Q(name__icontains='headphones') | Q(name__icontains='watch') | Q(name__icontains='mouse') | Q(name__icontains='keyboard') | Q(name__icontains='charger') | Q(name__icontains='power bank') | Q(name__icontains='handbag'),
            'electronics': Q(category__slug='electronics') | Q(category__parent__slug='electronics') | Q(subcategory__parent__slug='electronics'),
            'beauty': Q(category__slug='beauty') | Q(category__parent__slug='beauty') | Q(subcategory__parent__slug='beauty'),
            'home-living': Q(category__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']) | Q(category__parent__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']) | Q(subcategory__parent__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']),
            'home-kitchen': Q(category__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']) | Q(category__parent__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']) | Q(subcategory__parent__slug__in=['home-living', 'home-kitchen', 'furniture', 'appliances']),
        }

        if slug_val in CATEGORY_MAPPINGS:
            return queryset.filter(CATEGORY_MAPPINGS[slug_val]).distinct()
        if raw_lower in CATEGORY_MAPPINGS:
            return queryset.filter(CATEGORY_MAPPINGS[raw_lower]).distinct()

        # Standard resolution matching category, subcategory, or their parents
        return queryset.filter(
            Q(category__slug__iexact=val_str) |
            Q(category__slug__iexact=slug_val) |
            Q(category__name__iexact=val_str) |
            Q(category__parent__slug__iexact=val_str) |
            Q(category__parent__slug__iexact=slug_val) |
            Q(subcategory__slug__iexact=val_str) |
            Q(subcategory__slug__iexact=slug_val) |
            Q(subcategory__name__iexact=val_str) |
            Q(subcategory__parent__slug__iexact=val_str) |
            Q(subcategory__parent__slug__iexact=slug_val)
        ).distinct()

    def filter_subcategory(self, queryset, name, value):
        if not value:
            return queryset
        val_str = str(value).strip()
        if val_str.isdigit():
            val_id = int(val_str)
            return queryset.filter(Q(subcategory_id=val_id) | Q(category_id=val_id)).distinct()
        from django.utils.text import slugify
        slug_val = slugify(val_str).lower()
        return queryset.filter(
            Q(subcategory__slug__iexact=val_str) |
            Q(subcategory__slug__iexact=slug_val) |
            Q(subcategory__name__iexact=val_str) |
            Q(category__slug__iexact=val_str) |
            Q(category__slug__iexact=slug_val)
        ).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_quantity__gt=0)
        return queryset
