from rest_framework import serializers
from .models import Order, OrderItem, OrderTimeline, ReturnRequest

class OrderItemSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.business_name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'product_slug', 'seller', 'seller_name', 'variant_info',
            'quantity', 'unit_price', 'total_price'
        ]

class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = ['id', 'status', 'description', 'timestamp']

class ReturnRequestSerializer(serializers.ModelSerializer):
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    order_ref = serializers.CharField(source='order.order_id', read_only=True)

    class Meta:
        model = ReturnRequest
        fields = [
            'id', 'order', 'order_ref', 'order_item', 'customer',
            'customer_email', 'reason', 'comments', 'status',
            'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order', 'customer', 'status', 'admin_notes', 'created_at', 'updated_at']

class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    first_item_name = serializers.SerializerMethodField()
    first_item_image = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'subtotal', 'discount', 'delivery_fee',
            'coupon_discount', 'coupon_code', 'total_amount',
            'payment_method', 'payment_status', 'order_status',
            'tracking_number', 'courier_name', 'created_at',
            'items', 'items_count', 'first_item_name', 'first_item_image',
            'can_cancel', 'can_return'
        ]

    def get_first_item_name(self, obj):
        first = obj.items.first()
        return first.product_name if first else 'Order'

    def get_first_item_image(self, obj):
        first = obj.items.first()
        return first.product_image if first else ''

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    return_requests = ReturnRequestSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_name', 'customer_email',
            'shipping_address', 'subtotal', 'discount', 'delivery_fee',
            'coupon_discount', 'coupon_code', 'total_amount',
            'payment_method', 'payment_status', 'order_status',
            'tracking_number', 'courier_name', 'customer_notes',
            'cancellation_reason', 'items', 'timeline', 'return_requests',
            'can_cancel', 'can_return', 'created_at', 'updated_at'
        ]

class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=True)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    # For Direct "Buy Now" flow
    direct_product_id = serializers.IntegerField(required=False, allow_null=True)
    direct_variant_id = serializers.IntegerField(required=False, allow_null=True)
    direct_quantity = serializers.IntegerField(required=False, default=1)
