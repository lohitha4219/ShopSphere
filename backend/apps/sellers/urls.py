from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterSellerView, CurrentSellerProfileView,
    SellerDashboardView, AdminSellerViewSet
)

router = DefaultRouter()
router.register(r'admin/all', AdminSellerViewSet, basename='admin-sellers')

urlpatterns = [
    path('register/', RegisterSellerView.as_view(), name='seller-register'),
    path('profile/', CurrentSellerProfileView.as_view(), name='seller-profile'),
    path('dashboard/', SellerDashboardView.as_view(), name='seller-dashboard'),
    path('', include(router.urls)),
]
