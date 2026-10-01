from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from apps.products.models import Product, ProductVariant
from apps.sellers.models import SellerProfile

class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        PROCESSING = 'Processing', 'Processing'
        PACKED = 'Packed', 'Packed'
        SHIPPED = 'Shipped', 'Shipped'
        OUT_FOR_DELIVERY = 'Out for Delivery', 'Out for Delivery'
        DELIVERED = 'Delivered', 'Delivered'
        CANCELLED = 'Cancelled', 'Cancelled'
        RETURNED = 'Returned', 'Returned'

    class PaymentStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PROCESSING = 'Processing', 'Processing'
        PAID = 'Paid', 'Paid'
        FAILED = 'Failed', 'Failed'
        REFUNDED = 'Refunded', 'Refunded'

    class PaymentMethod(models.TextChoices):
        COD = 'COD', 'Cash on Delivery'
        RAZORPAY = 'RAZORPAY', 'Razorpay Online'
        UPI = 'UPI', 'UPI'
        CARD = 'CARD', 'Credit / Debit Card'
        NET_BANKING = 'NET_BANKING', 'Net Banking'

    order_id = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    
    # Snapshot of shipping address at time of checkout
    shipping_address = models.JSONField(default=dict)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon_code = models.CharField(max_length=50, blank=True, default='')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    order_status = models.CharField(max_length=30, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    courier_name = models.CharField(max_length=100, blank=True, default='')
    customer_notes = models.TextField(blank=True, default='')
    cancellation_reason = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_id']),
            models.Index(fields=['order_status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.order_id} - {self.customer.email} (₹{self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.order_id:
            import datetime
            year = datetime.date.today().year
            rand_code = uuid.uuid4().hex[:6].upper()
            self.order_id = f"ORD-{year}-{rand_code}"
        super().save(*args, **kwargs)

    @property
    def can_cancel(self):
        return self.order_status in [self.OrderStatus.PENDING, self.OrderStatus.CONFIRMED, self.OrderStatus.PROCESSING]

    @property
    def can_return(self):
        return self.order_status == self.OrderStatus.DELIVERED

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    seller = models.ForeignKey(SellerProfile, on_delete=models.SET_NULL, null=True, related_name='order_items')
    product_name = models.CharField(max_length=255)
    product_image = models.CharField(max_length=500, blank=True, default='')
    variant_info = models.CharField(max_length=150, blank=True, default='')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_id}"

class OrderTimeline(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.order.order_id} - {self.status} at {self.timestamp}"

class ReturnRequest(models.Model):
    class ReturnReason(models.TextChoices):
        DAMAGED = 'Damaged product', 'Damaged product'
        WRONG = 'Wrong product', 'Wrong product'
        NOT_AS_DESCRIBED = 'Product not as described', 'Product not as described'
        SIZE = 'Size issue', 'Size issue'
        QUALITY = 'Quality issue', 'Quality issue'
        OTHER = 'Other', 'Other'

    class ReturnStatus(models.TextChoices):
        REQUESTED = 'Requested', 'Requested'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'
        REFUNDED = 'Refunded', 'Refunded'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='return_requests')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, null=True, blank=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.CharField(max_length=50, choices=ReturnReason.choices)
    comments = models.TextField()
    status = models.CharField(max_length=20, choices=ReturnStatus.choices, default=ReturnStatus.REQUESTED)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Return for {self.order.order_id} ({self.status})"
