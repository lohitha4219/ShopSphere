from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreateOrderView, CustomerOrderListView, CustomerOrderDetailView,
    CancelOrderView, RequestReturnView, SellerOrderListView,
    SellerUpdateOrderStatusView, AdminOrderListView, AdminReturnManagementViewSet
)

router = DefaultRouter()
router.register(r'admin/returns', AdminReturnManagementViewSet, basename='admin-returns')

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='order-create'),
    path('', CustomerOrderListView.as_view(), name='order-list'),
    path('seller/', SellerOrderListView.as_view(), name='seller-order-list'),
    path('admin/all/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('<str:pk_or_id>/', CustomerOrderDetailView.as_view(), name='order-detail'),
    path('<str:pk_or_id>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('<str:pk_or_id>/return/', RequestReturnView.as_view(), name='order-return'),
    path('<str:pk_or_id>/update-status/', SellerUpdateOrderStatusView.as_view(), name='order-update-status'),
    path('', include(router.urls)),
]
