from django.urls import path
from .views import WishlistListView, WishlistIdsView, AddToWishlistView, RemoveFromWishlistView, MoveToCartView

urlpatterns = [
    path('', WishlistListView.as_view(), name='wishlist-list'),
    path('ids/', WishlistIdsView.as_view(), name='wishlist-ids'),
    path('add/', AddToWishlistView.as_view(), name='wishlist-add'),
    path('remove/', RemoveFromWishlistView.as_view(), name='wishlist-remove-body'),
    path('remove/<int:product_id>/', RemoveFromWishlistView.as_view(), name='wishlist-remove-param'),
    path('move-to-cart/', MoveToCartView.as_view(), name='wishlist-move-to-cart'),
]
