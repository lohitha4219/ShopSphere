from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.products.models import Product, ProductVariant

class CartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

class AddToCartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response({'error': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, is_active=True)

        variant = None
        if variant_id:
            variant = get_object_or_404(ProductVariant, id=variant_id, product=product)

        # Stock check
        available_stock = variant.stock_quantity if variant else product.stock_quantity
        if available_stock < quantity:
            return Response({
                'error': f"Only {available_stock} item(s) available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > available_stock:
                return Response({
                    'error': f"Cannot add more. Total in cart ({new_qty}) exceeds available stock ({available_stock})."
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_qty
            cart_item.save()

        return Response({
            'message': f"{product.name} added to cart.",
            'cart': CartSerializer(cart).data
        }, status=status.HTTP_200_OK)

class UpdateCartItemView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)

        if quantity <= 0:
            cart_item.delete()
            return Response({
                'message': 'Item removed from cart.',
                'cart': CartSerializer(cart).data
            })

        # Stock check
        available_stock = cart_item.variant.stock_quantity if cart_item.variant else cart_item.product.stock_quantity
        if quantity > available_stock:
            return Response({
                'error': f"Only {available_stock} item(s) available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        return Response({
            'message': 'Cart updated successfully.',
            'cart': CartSerializer(cart).data
        })

class RemoveCartItemView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id=None):
        cart = get_object_or_404(Cart, user=request.user)
        
        # Support item_id from URL or from request body
        target_id = item_id or request.data.get('item_id')
        cart_item = get_object_or_404(CartItem, id=target_id, cart=cart)
        cart_item.delete()

        return Response({
            'message': 'Item removed from cart.',
            'cart': CartSerializer(cart).data
        })

class ClearCartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        cart.coupon = None
        cart.save()
        return Response({
            'message': 'Cart cleared.',
            'cart': CartSerializer(cart).data
        })
