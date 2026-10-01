from django.urls import path
from .views import CreatePaymentOrderView, VerifyPaymentView, AdminPaymentListView

urlpatterns = [
    path('create-session/', CreatePaymentOrderView.as_view(), name='payment-create-session'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('admin/all/', AdminPaymentListView.as_view(), name='payment-admin-all'),
]
