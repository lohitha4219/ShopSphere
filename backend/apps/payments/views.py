from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import PaymentSerializer, VerifyPaymentSerializer
from .services import PaymentGatewayService
from apps.orders.models import Order
from apps.accounts.permissions import IsAdminRole

class CreatePaymentOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, customer=request.user)

        if order.payment_status == 'Paid':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        gateway = PaymentGatewayService()
        session_data = gateway.create_online_order(order.total_amount, order.order_id)

        # Record payment intent
        payment, _ = Payment.objects.get_or_create(
            order=order,
            user=request.user,
            defaults={
                'amount': order.total_amount,
                'payment_method': Payment.PaymentMethod.RAZORPAY,
                'status': Payment.PaymentStatus.PROCESSING,
                'gateway_order_id': session_data['gateway_order_id']
            }
        )
        payment.gateway_order_id = session_data['gateway_order_id']
        payment.status = Payment.PaymentStatus.PROCESSING
        payment.save()

        return Response({
            'order_id': order.id,
            'order_ref': order.order_id,
            'amount': float(order.total_amount),
            'gateway_session': session_data
        })

class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        gateway_order_id = serializer.validated_data['gateway_order_id']
        gateway_payment_id = serializer.validated_data['gateway_payment_id']
        signature = serializer.validated_data.get('gateway_signature', '')

        order = get_object_or_404(Order, id=order_id, customer=request.user)
        gateway = PaymentGatewayService()

        is_valid = gateway.verify_payment_signature(gateway_order_id, gateway_payment_id, signature)
        if not is_valid:
            return Response({'error': 'Payment verification failed: Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        payment, _ = Payment.objects.get_or_create(
            order=order,
            user=request.user,
            defaults={
                'amount': order.total_amount,
                'payment_method': order.payment_method,
            }
        )
        payment.gateway_order_id = gateway_order_id
        payment.gateway_payment_id = gateway_payment_id
        payment.gateway_signature = signature
        payment.status = Payment.PaymentStatus.PAID
        payment.save()

        order.payment_status = 'Paid'
        order.order_status = 'Confirmed'
        order.save()

        return Response({
            'message': 'Payment successful and verified.',
            'order_id': order.id,
            'payment_status': 'Paid'
        })

class AdminPaymentListView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        payments = Payment.objects.all().select_related('order', 'user')
        return Response(PaymentSerializer(payments, many=True).data)
