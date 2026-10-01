from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductReviewsView, MarkReviewHelpfulView, AdminReviewViewSet

router = DefaultRouter()
router.register(r'admin/all', AdminReviewViewSet, basename='admin-reviews')

urlpatterns = [
    path('product/<str:product_id_or_slug>/', ProductReviewsView.as_view(), name='product-reviews'),
    path('<int:pk>/helpful/', MarkReviewHelpfulView.as_view(), name='review-helpful'),
    path('', include(router.urls)),
]
