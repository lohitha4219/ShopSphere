from django.db import models
from django.conf import settings
from decimal import Decimal
from apps.products.models import Product, ProductVariant

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    coupon = models.ForeignKey('coupons.Coupon', on_delete=models.SET_NULL, null=True, blank=True, related_name='applied_carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.email}"

    @property
    def total_items_count(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        # Gross price before discount
        total = Decimal('0.00')
        for item in self.items.all():
            base_price = item.product.price
            if item.variant:
                base_price += item.variant.price_adjustment
            total += base_price * item.quantity
        return total

    @property
    def discount(self):
        # Savings from product discounts
        saved = Decimal('0.00')
        for item in self.items.all():
            orig_price = item.product.price
            final_price = item.product.final_price
            if orig_price > final_price:
                saved += (orig_price - final_price) * item.quantity
        return saved

    @property
    def coupon_discount(self):
        if not self.coupon or not self.coupon.is_valid:
            return Decimal('0.00')
        items_total = self.subtotal - self.discount
        if items_total < self.coupon.minimum_order_amount:
            return Decimal('0.00')
        
        if self.coupon.discount_type == 'PERCENTAGE':
            disc = (items_total * self.coupon.discount_value) / Decimal('100.00')
            if self.coupon.maximum_discount and disc > self.coupon.maximum_discount:
                disc = self.coupon.maximum_discount
            return round(disc, 2)
        else:
            return min(self.coupon.discount_value, items_total)

    @property
    def delivery_fee(self):
        items_total = self.subtotal - self.discount
        if items_total == 0 or items_total >= Decimal('500.00'):
            return Decimal('0.00')
        return Decimal('40.00')

    @property
    def total_amount(self):
        items_net = self.subtotal - self.discount - self.coupon_discount
        if items_net < Decimal('0.00'):
            items_net = Decimal('0.00')
        if items_net == 0:
            return Decimal('0.00')
        return items_net + self.delivery_fee

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product', 'variant')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart"

    @property
    def unit_price(self):
        price = self.product.final_price
        if self.variant:
            price += self.variant.price_adjustment
        return price

    @property
    def original_unit_price(self):
        price = self.product.price
        if self.variant:
            price += self.variant.price_adjustment
        return price

    @property
    def total_price(self):
        return self.unit_price * self.quantity
