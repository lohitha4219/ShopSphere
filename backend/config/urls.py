from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.accounts.admin_views import AdminDashboardStatsView, AdminReportsView
from apps.accounts.views import AdminUserViewSet

admin_router = DefaultRouter()
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation (OpenAPI / Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # ShopSphere Core APIs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/sellers/', include('apps.sellers.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # Admin Management & Analytics APIs
    path('api/admin/dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('api/admin/reports/', AdminReportsView.as_view(), name='admin-reports'),
    path('api/admin/', include(admin_router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
