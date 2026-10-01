from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplyCouponView, RemoveCouponView, AvailableCouponsView, AdminCouponViewSet

router = DefaultRouter()
router.register(r'admin/all', AdminCouponViewSet, basename='admin-coupons')

urlpatterns = [
    path('apply/', ApplyCouponView.as_view(), name='coupon-apply'),
    path('remove/', RemoveCouponView.as_view(), name='coupon-remove'),
    path('available/', AvailableCouponsView.as_view(), name='coupon-available'),
    path('', include(router.urls)),
]
