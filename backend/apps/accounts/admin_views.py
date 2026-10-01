from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.accounts.permissions import IsAdminRole
from apps.sellers.models import SellerProfile
from apps.products.models import Product
from apps.orders.models import Order, OrderItem, ReturnRequest
from apps.categories.models import Category

User = get_user_model()

class AdminDashboardStatsView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        total_sellers = SellerProfile.objects.count()
        pending_sellers = SellerProfile.objects.filter(status=SellerProfile.Status.PENDING).count()
        
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(order_status__in=['Pending', 'Confirmed', 'Processing']).count()
        pending_returns = ReturnRequest.objects.filter(status=ReturnRequest.ReturnStatus.REQUESTED).count()

        total_revenue = Order.objects.filter(payment_status='Paid').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Recent 7 days revenue & orders trend
        today = timezone.now().date()
        daily_trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_orders = Order.objects.filter(created_at__date=day)
            day_rev = day_orders.filter(payment_status='Paid').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            daily_trend.append({
                'date': day.strftime('%b %d'),
                'revenue': float(day_rev),
                'orders': day_orders.count()
            })

        # Sales by category
        category_distribution = []
        categories = Category.objects.filter(parent__isnull=True)[:6]
        for cat in categories:
            items_count = OrderItem.objects.filter(product__category=cat).aggregate(qty=Sum('quantity'))['qty'] or 0
            category_distribution.append({
                'category': cat.name,
                'count': items_count
            })

        # Recent 5 orders
        from apps.orders.serializers import OrderListSerializer
        recent_orders = Order.objects.all().order_by('-created_at')[:5]

        # Recent 5 sellers
        from apps.sellers.serializers import SellerProfileSerializer
        recent_sellers = SellerProfile.objects.all().order_by('-created_at')[:5]

        return Response({
            'total_users': total_users,
            'total_sellers': total_sellers,
            'pending_sellers': pending_sellers,
            'total_products': total_products,
            'active_products': active_products,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'pending_returns': pending_returns,
            'total_revenue': float(total_revenue),
            'daily_trend': daily_trend,
            'category_distribution': category_distribution,
            'recent_orders': OrderListSerializer(recent_orders, many=True).data,
            'recent_sellers': SellerProfileSerializer(recent_sellers, many=True).data,
        })

class AdminReportsView(views.APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        report_type = request.query_params.get('type', 'sales')  # sales, orders, products, sellers, customers
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        orders_qs = Order.objects.all()
        if start_date:
            orders_qs = orders_qs.filter(created_at__date__gte=start_date)
        if end_date:
            orders_qs = orders_qs.filter(created_at__date__lte=end_date)

        if report_type == 'sales':
            paid_orders = orders_qs.filter(payment_status='Paid')
            total_sales = paid_orders.aggregate(total=Sum('total_amount'))['total'] or 0.0
            total_items = OrderItem.objects.filter(order__in=paid_orders).aggregate(qty=Sum('quantity'))['qty'] or 0
            
            records = []
            for o in paid_orders.order_by('-created_at')[:50]:
                records.append({
                    'id': o.order_id,
                    'customer': o.customer.email,
                    'amount': float(o.total_amount),
                    'payment_method': o.payment_method,
                    'date': o.created_at.strftime('%Y-%m-%d %H:%M')
                })

            return Response({
                'report_type': 'Sales & Revenue Report',
                'summary': {
                    'total_revenue': float(total_sales),
                    'total_orders_paid': paid_orders.count(),
                    'total_items_sold': total_items
                },
                'records': records
            })

        elif report_type == 'products':
            products = Product.objects.all().order_by('-created_at')[:50]
            records = []
            for p in products:
                sold_qty = p.order_items.aggregate(qty=Sum('quantity'))['qty'] or 0
                records.append({
                    'id': p.id,
                    'sku': p.sku,
                    'name': p.name,
                    'category': p.category.name,
                    'seller': p.seller.business_name,
                    'price': float(p.price),
                    'stock': p.stock_quantity,
                    'sold': sold_qty,
                    'status': 'Active' if p.is_active else 'Inactive'
                })
            return Response({
                'report_type': 'Product Inventory & Sales Report',
                'summary': {
                    'total_products': Product.objects.count(),
                    'active_products': Product.objects.filter(is_active=True).count(),
                    'out_of_stock': Product.objects.filter(stock_quantity=0).count()
                },
                'records': records
            })

        # Default fallback orders report
        records = []
        for o in orders_qs.order_by('-created_at')[:50]:
            records.append({
                'order_id': o.order_id,
                'customer': o.customer.email,
                'items_count': o.items.count(),
                'total_amount': float(o.total_amount),
                'order_status': o.order_status,
                'payment_status': o.payment_status,
                'date': o.created_at.strftime('%Y-%m-%d %H:%M')
            })

        return Response({
            'report_type': 'Orders Report',
            'summary': {
                'total_orders': orders_qs.count(),
                'delivered': orders_qs.filter(order_status='Delivered').count(),
                'cancelled': orders_qs.filter(order_status='Cancelled').count()
            },
            'records': records
        })
