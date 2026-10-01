from django.db import models
from django.conf import settings
from apps.products.models import Product

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    title = models.CharField(max_length=200, blank=True, default='')
    comment = models.TextField()
    helpful_count = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.product.name} ({self.rating}*)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_stats()

    def delete(self, *args, **kwargs):
        prod = self.product
        super().delete(*args, **kwargs)
        self.recalc_product_stats(prod)

    def update_product_stats(self):
        self.recalc_product_stats(self.product)

    @staticmethod
    def recalc_product_stats(product):
        approved_reviews = product.reviews.filter(is_approved=True)
        count = approved_reviews.count()
        if count > 0:
            avg_rating = approved_reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0.0
            product.rating = round(avg_rating, 2)
            product.review_count = count
        else:
            product.rating = 0.00
            product.review_count = 0
        product.save(update_fields=['rating', 'review_count'])
