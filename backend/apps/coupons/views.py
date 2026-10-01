from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Coupon
from .serializers import CouponSerializer, CouponApplySerializer
from apps.cart.models import Cart
from apps.cart.serializers import CartSerializer
from apps.accounts.permissions import IsAdminRole

class ApplyCouponView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code'].strip().upper()
        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid:
            return Response({'error': 'This coupon has expired or is inactive.'}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        items_total = cart.subtotal - cart.discount

        if items_total < coupon.minimum_order_amount:
            return Response({
                'error': f"Minimum order amount of ₹{coupon.minimum_order_amount} required to use coupon '{coupon.code}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart.coupon = coupon
        cart.save()

        return Response({
            'message': f"Coupon '{coupon.code}' applied successfully!",
            'coupon': CouponSerializer(coupon).data,
            'cart': CartSerializer(cart).data
        })

class RemoveCouponView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.coupon = None
            cart.save()
            return Response({
                'message': 'Coupon removed.',
                'cart': CartSerializer(cart).data
            })
        return Response({'message': 'No coupon applied.'})

class AvailableCouponsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        coupons = Coupon.objects.filter(
            is_active=True,
            start_date__lte=now
        ).exclude(expiry_date__lt=now)
        return Response(CouponSerializer(coupons, many=True).data)

class AdminCouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    permission_classes = [IsAdminRole]
    queryset = Coupon.objects.all().order_by('-created_at')
    search_fields = ['code', 'description']
    filterset_fields = ['discount_type', 'is_active']
