from django.db import models
from django.utils.text import slugify
from apps.categories.models import Category
from apps.sellers.models import SellerProfile

class Product(models.Model):
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    subcategory = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategory_products'
    )
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=350, blank=True, default='')
    brand = models.CharField(max_length=100, db_index=True, blank=True, default='')
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.PositiveIntegerField(default=0)
    
    stock_quantity = models.PositiveIntegerField(default=0)
    minimum_order_quantity = models.PositiveIntegerField(default=1)
    
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['sku']),
            models.Index(fields=['brand']),
            models.Index(fields=['is_active', 'is_featured']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            candidate = base_slug
            counter = 1
            while Product.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{counter}"
                counter += 1
            self.slug = candidate

        # Calculate discount percentage or discount price
        if self.discount_price and self.price > 0 and self.discount_price < self.price:
            self.discount_percentage = round(((self.price - self.discount_price) / self.price) * 100)
        elif self.discount_percentage > 0 and self.price > 0 and not self.discount_price:
            discount_amount = (self.price * self.discount_percentage) / 100
            self.discount_price = round(self.price - discount_amount, 2)

        super().save(*args, **kwargs)

    @property
    def final_price(self):
        return self.discount_price if self.discount_price and self.discount_price < self.price else self.price

    @property
    def in_stock(self):
        return self.stock_quantity > 0

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-is_primary', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"

class ProductVariant(models.Model):
    class VariantType(models.TextChoices):
        SIZE = 'Size', 'Size'
        COLOR = 'Color', 'Color'
        STORAGE = 'Storage', 'Storage'
        RAM = 'RAM', 'RAM'
        WEIGHT = 'Weight', 'Weight'
        OTHER = 'Other', 'Other'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    variant_type = models.CharField(max_length=50, choices=VariantType.choices, default=VariantType.SIZE)
    name = models.CharField(max_length=100)  # e.g. "XL", "Midnight Blue", "256GB"
    sku = models.CharField(max_length=100, blank=True, default='')
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ['variant_type', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.variant_type}: {self.name}"
