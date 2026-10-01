from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import WishlistItem
from .serializers import WishlistItemSerializer
from apps.products.models import Product
from apps.cart.models import Cart, CartItem

class WishlistListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user)
        return Response(WishlistItemSerializer(items, many=True).data)

class WishlistIdsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        product_ids = WishlistItem.objects.filter(user=request.user).values_list('product_id', flat=True)
        return Response(list(product_ids))

class AddToWishlistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id, is_active=True)
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        return Response({
            'message': f"{product.name} added to wishlist.",
            'item': WishlistItemSerializer(item).data,
            'is_in_wishlist': True
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class RemoveFromWishlistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id=None):
        target_id = product_id or request.data.get('product_id')
        WishlistItem.objects.filter(user=request.user, product_id=target_id).delete()
        return Response({'message': 'Removed from wishlist.', 'is_in_wishlist': False})

class MoveToCartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.stock_quantity < 1:
            return Response({'error': 'Product is currently out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        if not created:
            cart_item.quantity += 1
            cart_item.save()

        # Remove from wishlist
        WishlistItem.objects.filter(user=request.user, product=product).delete()

        return Response({
            'message': f"{product.name} moved to cart successfully."
        })
