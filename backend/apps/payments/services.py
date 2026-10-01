import os
import hmac
import hashlib
import uuid
from decimal import Decimal
from django.conf import settings

class PaymentGatewayService:
    """
    Modular abstraction for online payments (Razorpay ready).
    Supports seamless test/dev simulation and production integration
    via environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
    """
    def __init__(self):
        self.key_id = getattr(settings, 'RAZORPAY_KEY_ID', '') or os.getenv('RAZORPAY_KEY_ID', '')
        self.key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '') or os.getenv('RAZORPAY_KEY_SECRET', '')
        self.is_live = bool(self.key_id and self.key_secret and not self.key_id.startswith('rzp_test_placeholder'))

    def create_online_order(self, amount: Decimal, order_id_str: str):
        amount_in_paise = int(amount * 100)
        
        if self.is_live:
            # Here standard razorpay client would be called
            try:
                import razorpay
                client = razorpay.Client(auth=(self.key_id, self.key_secret))
                rzp_order = client.order.create({
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': order_id_str,
                    'payment_capture': 1
                })
                return {
                    'gateway_order_id': rzp_order['id'],
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'key_id': self.key_id,
                    'is_live': True
                }
            except Exception as e:
                # Fallback to simulated gateway order for local dev if client fails
                pass

        # Development / Simulation mode
        mock_gateway_id = f"order_sim_{uuid.uuid4().hex[:12]}"
        return {
            'gateway_order_id': mock_gateway_id,
            'amount': amount_in_paise,
            'currency': 'INR',
            'key_id': self.key_id or 'rzp_test_shopsphere_mock',
            'is_live': False,
            'simulated': True
        }

    def verify_payment_signature(self, gateway_order_id: str, gateway_payment_id: str, signature: str) -> bool:
        if self.is_live:
            try:
                generated_signature = hmac.new(
                    self.key_secret.encode(),
                    f"{gateway_order_id}|{gateway_payment_id}".encode(),
                    hashlib.sha256
                ).hexdigest()
                return hmac.compare_digest(generated_signature, signature)
            except Exception:
                return False
        # Development fallback: signature is valid if non-empty
        return bool(signature)
