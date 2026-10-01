from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'transaction_id', 'payment_method',
            'amount', 'currency', 'status', 'gateway_order_id',
            'gateway_payment_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']

class VerifyPaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=True)
    gateway_order_id = serializers.CharField(required=True)
    gateway_payment_id = serializers.CharField(required=True)
    gateway_signature = serializers.CharField(required=False, default='simulated_signature')
