from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    ChangePasswordView, AddressViewSet, AdminUserViewSet,
    ForgotPasswordView, ResetPasswordView, GoogleAuthView
)

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='user-address')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('google/', GoogleAuthView.as_view(), name='auth-google'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh-alt'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('me/', ProfileView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('', include(router.urls)),
]
