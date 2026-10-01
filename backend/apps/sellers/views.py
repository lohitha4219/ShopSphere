from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import SellerProfile
from .serializers import SellerProfileSerializer, SellerRegistrationSerializer
from apps.accounts.permissions import IsAdminRole, IsSellerRole

class RegisterSellerView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'seller_profile'):
            return Response(
                {'error': 'A seller profile already exists for this account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = SellerRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            seller = serializer.save()
            return Response({
                'message': 'Seller application submitted successfully. Pending admin approval.',
                'seller': SellerProfileSerializer(seller).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentSellerProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            seller = request.user.seller_profile
            return Response(SellerProfileSerializer(seller).data)
        except SellerProfile.DoesNotExist:
            return Response({'error': 'No seller profile found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            seller = request.user.seller_profile
            serializer = SellerProfileSerializer(seller, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except SellerProfile.DoesNotExist:
            return Response({'error': 'No seller profile found.'}, status=status.HTTP_404_NOT_FOUND)

class SellerDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            seller = request.user.seller_profile
        except SellerProfile.DoesNotExist:
            return Response({'error': 'User is not a seller.'}, status=status.HTTP_403_FORBIDDEN)

        # Products count
        from apps.products.models import Product
        from apps.orders.models import OrderItem, Order

        products = Product.objects.filter(seller=seller)
        total_products = products.count()
        active_products = products.filter(is_active=True).count()

        # Seller Order Items
        order_items = OrderItem.objects.filter(product__seller=seller)
        total_orders = order_items.values('order').distinct().count()
        pending_orders = order_items.filter(order__order_status__in=['Pending', 'Confirmed', 'Processing']).values('order').distinct().count()

        total_sales_amount = order_items.filter(
            order__payment_status='Paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0.0

        # Unique customers served
        unique_customers = order_items.values('order__customer').distinct().count()

        # Generate sales by day for the last 7 days
        today = timezone.now().date()
        sales_by_day = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_total = order_items.filter(
                order__created_at__date=day,
                order__payment_status='Paid'
            ).aggregate(total=Sum('total_price'))['total'] or 0.0
            sales_by_day.append({
                'date': day.strftime('%b %d'),
                'amount': float(day_total)
            })

        # Top 5 products
        top_products = []
        for p in products.annotate(units_sold=Sum('order_items__quantity')).order_by('-units_sold')[:5]:
            top_products.append({
                'id': p.id,
                'name': p.name,
                'price': float(p.price),
                'stock': p.stock_quantity,
                'units_sold': p.units_sold or 0
            })

        return Response({
            'seller_name': seller.business_name,
            'status': seller.status,
            'total_sales': float(total_sales_amount),
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_products': total_products,
            'active_products': active_products,
            'unique_customers': unique_customers,
            'sales_by_day': sales_by_day,
            'top_products': top_products
        })

class AdminSellerViewSet(viewsets.ModelViewSet):
    serializer_class = SellerProfileSerializer
    permission_classes = [IsAdminRole]
    queryset = SellerProfile.objects.all().order_by('-created_at')
    filterset_fields = ['status']
    search_fields = ['business_name', 'owner_name', 'email', 'phone']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        seller = self.get_object()
        seller.status = SellerProfile.Status.APPROVED
        seller.save()
        return Response({'message': 'Seller approved successfully.', 'seller': SellerProfileSerializer(seller).data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        seller = self.get_object()
        seller.status = SellerProfile.Status.REJECTED
        seller.rejection_reason = request.data.get('reason', '')
        seller.save()
        return Response({'message': 'Seller application rejected.', 'seller': SellerProfileSerializer(seller).data})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        seller = self.get_object()
        seller.status = SellerProfile.Status.SUSPENDED
        seller.save()
        return Response({'message': 'Seller suspended.', 'seller': SellerProfileSerializer(seller).data})
