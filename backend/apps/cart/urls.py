from django.urls import path
from .views import CartView, AddToCartView, UpdateCartItemView, RemoveCartItemView, ClearCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart-detail'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('update/', UpdateCartItemView.as_view(), name='cart-update'),
    path('remove/', RemoveCartItemView.as_view(), name='cart-remove-body'),
    path('remove/<int:item_id>/', RemoveCartItemView.as_view(), name='cart-remove-param'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),
]
