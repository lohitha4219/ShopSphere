from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'minimum_order_amount', 'maximum_discount', 'start_date', 'expiry_date',
            'usage_limit', 'times_used', 'per_user_limit', 'is_active', 'is_valid',
            'created_at', 'updated_at'
        ]

class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50, required=True)
