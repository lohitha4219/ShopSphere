from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem, OrderTimeline, ReturnRequest
from .serializers import (
    OrderListSerializer, OrderDetailSerializer,
    CreateOrderSerializer, ReturnRequestSerializer
)
from apps.accounts.models import UserAddress
from apps.accounts.permissions import IsAdminRole, IsSellerOrAdmin
from apps.cart.models import Cart
from apps.products.models import Product, ProductVariant
from apps.notifications.models import Notification

class CreateOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        address_id = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')

        address = get_object_or_404(UserAddress, id=address_id, user=request.user)
        address_snapshot = {
            'full_name': address.full_name,
            'phone': address.phone,
            'house_flat': address.house_flat,
            'street': address.street,
            'area': address.area,
            'city': address.city,
            'state': address.state,
            'pincode': address.pincode,
            'landmark': address.landmark,
            'address_type': address.address_type,
        }

        items_to_process = []
        direct_product_id = serializer.validated_data.get('direct_product_id')

        if direct_product_id:
            # Direct "Buy Now" flow
            product = get_object_or_404(Product, id=direct_product_id, is_active=True)
            variant_id = serializer.validated_data.get('direct_variant_id')
            variant = None
            if variant_id:
                variant = get_object_or_404(ProductVariant, id=variant_id, product=product)
            quantity = serializer.validated_data.get('direct_quantity', 1)
            
            unit_price = product.final_price + (variant.price_adjustment if variant else Decimal('0.00'))
            items_to_process.append({
                'product': product,
                'variant': variant,
                'quantity': quantity,
                'unit_price': unit_price,
                'original_price': product.price + (variant.price_adjustment if variant else Decimal('0.00')),
            })
            coupon = None
        else:
            # Cart Checkout flow
            cart = Cart.objects.filter(user=request.user).first()
            if not cart or not cart.items.exists():
                return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

            coupon = cart.coupon if cart.coupon and cart.coupon.is_valid else None

            for ci in cart.items.all():
                items_to_process.append({
                    'product': ci.product,
                    'variant': ci.variant,
                    'quantity': ci.quantity,
                    'unit_price': ci.unit_price,
                    'original_price': ci.original_unit_price,
                })

        # Validate stock and compute totals
        subtotal = Decimal('0.00')
        discount = Decimal('0.00')

        for item_data in items_to_process:
            prod = item_data['product']
            var = item_data['variant']
            qty = item_data['quantity']

            available_stock = var.stock_quantity if var else prod.stock_quantity
            if available_stock < qty:
                return Response({
                    'error': f"Insufficient stock for {prod.name}. Available: {available_stock}."
                }, status=status.HTTP_400_BAD_REQUEST)

            subtotal += item_data['original_price'] * qty
            diff = (item_data['original_price'] - item_data['unit_price']) * qty
            if diff > 0:
                discount += diff

        # Calculate Coupon discount
        net_before_coupon = subtotal - discount
        coupon_discount = Decimal('0.00')
        coupon_code = ''
        if coupon and net_before_coupon >= coupon.minimum_order_amount:
            coupon_code = coupon.code
            if coupon.discount_type == 'PERCENTAGE':
                coupon_discount = (net_before_coupon * coupon.discount_value) / Decimal('100.00')
                if coupon.maximum_discount and coupon_discount > coupon.maximum_discount:
                    coupon_discount = coupon.maximum_discount
            else:
                coupon_discount = min(coupon.discount_value, net_before_coupon)
            
            coupon.times_used += 1
            coupon.save()

        # Delivery fee
        net_items = net_before_coupon - coupon_discount
        delivery_fee = Decimal('0.00') if net_items >= Decimal('500.00') else Decimal('40.00')
        total_amount = max(Decimal('0.00'), net_items) + delivery_fee

        # Initial status
        order_status = Order.OrderStatus.CONFIRMED if payment_method == Order.PaymentMethod.COD else Order.OrderStatus.PENDING
        payment_status = Order.PaymentStatus.PENDING

        order = Order.objects.create(
            customer=request.user,
            shipping_address=address_snapshot,
            subtotal=subtotal,
            discount=discount,
            delivery_fee=delivery_fee,
            coupon_discount=coupon_discount,
            coupon_code=coupon_code,
            total_amount=total_amount,
            payment_method=payment_method,
            payment_status=payment_status,
            order_status=order_status,
            customer_notes=notes
        )

        # Create Order Items & deduct inventory
        for item_data in items_to_process:
            prod = item_data['product']
            var = item_data['variant']
            qty = item_data['quantity']

            # Deduct stock
            if var:
                var.stock_quantity = max(0, var.stock_quantity - qty)
                var.save()
            prod.stock_quantity = max(0, prod.stock_quantity - qty)
            prod.save()

            var_info = f"{var.variant_type}: {var.name}" if var else ''
            thumb_url = prod.thumbnail.url if prod.thumbnail else ''

            OrderItem.objects.create(
                order=order,
                product=prod,
                seller=prod.seller,
                product_name=prod.name,
                product_image=thumb_url,
                variant_info=var_info,
                quantity=qty,
                unit_price=item_data['unit_price'],
                total_price=item_data['unit_price'] * qty
            )

        # Initial Timeline
        OrderTimeline.objects.create(
            order=order,
            status='Order Placed',
            description='Your order has been placed successfully.'
        )
        if payment_method == Order.PaymentMethod.COD:
            OrderTimeline.objects.create(
                order=order,
                status='Confirmed',
                description='Cash on Delivery order confirmed.'
            )

        # Clear cart if this was cart checkout
        if not direct_product_id:
            cart = Cart.objects.filter(user=request.user).first()
            if cart:
                cart.items.all().delete()
                cart.coupon = None
                cart.save()

        # Create Customer Notification
        Notification.objects.create(
            user=request.user,
            title='Order Placed Successfully',
            message=f"Order #{order.order_id} for ₹{order.total_amount} has been placed.",
            notification_type='ORDER'
        )

        return Response({
            'message': 'Order placed successfully!',
            'order': OrderDetailSerializer(order).data
        }, status=status.HTTP_201_CREATED)

class CustomerOrderListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(customer=request.user).prefetch_related('items')
        return Response(OrderListSerializer(orders, many=True).data)

class CustomerOrderDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk_or_id):
        if pk_or_id.isdigit():
            order = get_object_or_404(Order, pk=pk_or_id)
        else:
            order = get_object_or_404(Order, order_id=pk_or_id)

        # Permissions check
        user = request.user
        if not (user.is_staff or user.role == 'ADMIN' or order.customer == user):
            # Check if seller has items in this order
            if hasattr(user, 'seller_profile'):
                has_items = order.items.filter(seller=user.seller_profile).exists()
                if not has_items:
                    return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(OrderDetailSerializer(order).data)

class CancelOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk_or_id):
        if str(pk_or_id).isdigit():
            order = get_object_or_404(Order, pk=pk_or_id)
        else:
            order = get_object_or_404(Order, order_id=pk_or_id)

        if order.customer != request.user and not (request.user.is_staff or request.user.role == 'ADMIN'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if not order.can_cancel:
            return Response({'error': f"Cannot cancel order in status '{order.order_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        order.order_status = Order.OrderStatus.CANCELLED
        order.cancellation_reason = request.data.get('reason', 'Cancelled by customer')
        order.save()

        # Restore inventory
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()

        OrderTimeline.objects.create(
            order=order,
            status='Cancelled',
            description=f"Order was cancelled: {order.cancellation_reason}"
        )

        Notification.objects.create(
            user=order.customer,
            title='Order Cancelled',
            message=f"Order #{order.order_id} has been cancelled.",
            notification_type='ORDER'
        )

        return Response({
            'message': 'Order cancelled successfully.',
            'order': OrderDetailSerializer(order).data
        })

class RequestReturnView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk_or_id):
        if str(pk_or_id).isdigit():
            order = get_object_or_404(Order, pk=pk_or_id, customer=request.user)
        else:
            order = get_object_or_404(Order, order_id=pk_or_id, customer=request.user)

        if not order.can_return:
            return Response({'error': 'Returns can only be requested for delivered orders.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason')
        comments = request.data.get('comments', '')
        if not reason:
            return Response({'error': 'Return reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        return_req = ReturnRequest.objects.create(
            order=order,
            customer=request.user,
            reason=reason,
            comments=comments,
            status=ReturnRequest.ReturnStatus.REQUESTED
        )

        OrderTimeline.objects.create(
            order=order,
            status='Return Requested',
            description=f"Return request initiated ({reason})"
        )

        return Response({
            'message': 'Return request submitted successfully.',
            'return_request': ReturnRequestSerializer(return_req).data
        })

class SellerOrderListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'seller_profile'):
            return Response({'error': 'Seller profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        seller = request.user.seller_profile
        order_ids = OrderItem.objects.filter(seller=seller).values_list('order_id', flat=True).distinct()
        orders = Order.objects.filter(id__in=order_ids).order_by('-created_at')

        return Response(OrderListSerializer(orders, many=True).data)

class SellerUpdateOrderStatusView(views.APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, pk_or_id):
        if str(pk_or_id).isdigit():
            order = get_object_or_404(Order, pk=pk_or_id)
        else:
            order = get_object_or_404(Order, order_id=pk_or_id)

        new_status = request.data.get('order_status')
        tracking_number = request.data.get('tracking_number')
        courier_name = request.data.get('courier_name')

        valid_transitions = [
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.PROCESSING,
            Order.OrderStatus.PACKED,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.DELIVERED,
        ]

        if new_status and new_status in valid_transitions:
            order.order_status = new_status
            if tracking_number:
                order.tracking_number = tracking_number
            if courier_name:
                order.courier_name = courier_name
            if new_status == Order.OrderStatus.DELIVERED and order.payment_method == Order.PaymentMethod.COD:
                order.payment_status = Order.PaymentStatus.PAID
            order.save()

            OrderTimeline.objects.create(
                order=order,
                status=new_status,
                description=f"Status updated to {new_status}." + (f" Tracking: {tracking_number} via {courier_name}." if tracking_number else "")
            )

            Notification.objects.create(
                user=order.customer,
                title=f"Order Status: {new_status}",
                message=f"Your order #{order.order_id} is now {new_status}.",
                notification_type='ORDER'
            )

            return Response({
                'message': f"Order status updated to {new_status}.",
                'order': OrderDetailSerializer(order).data
            })

        return Response({'error': 'Invalid status transition.'}, status=status.HTTP_400_BAD_REQUEST)

class AdminOrderListView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = Order.objects.all().order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(order_status=status_filter)
        return Response(OrderListSerializer(qs, many=True).data)

class AdminReturnManagementViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAdminRole]
    queryset = ReturnRequest.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ret = self.get_object()
        ret.status = ReturnRequest.ReturnStatus.APPROVED
        ret.admin_notes = request.data.get('admin_notes', 'Return approved by admin.')
        ret.save()

        ret.order.order_status = Order.OrderStatus.RETURNED
        ret.order.payment_status = Order.PaymentStatus.REFUNDED
        ret.order.save()

        OrderTimeline.objects.create(
            order=ret.order,
            status='Return Approved',
            description='Return request approved. Refund initiated.'
        )

        return Response({'message': 'Return approved and refund initiated.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ret = self.get_object()
        ret.status = ReturnRequest.ReturnStatus.REJECTED
        ret.admin_notes = request.data.get('admin_notes', 'Return rejected.')
        ret.save()

        OrderTimeline.objects.create(
            order=ret.order,
            status='Return Rejected',
            description=f"Return request rejected: {ret.admin_notes}"
        )

        return Response({'message': 'Return request rejected.'})
