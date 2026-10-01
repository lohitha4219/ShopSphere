from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count
from .models import Review
from .serializers import ReviewSerializer, CreateReviewSerializer
from apps.products.models import Product
from apps.orders.models import OrderItem
from apps.accounts.permissions import IsAdminRole

class ProductReviewsView(views.APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, product_id_or_slug):
        if str(product_id_or_slug).isdigit():
            product = get_object_or_404(Product, id=product_id_or_slug)
        else:
            product = get_object_or_404(Product, slug=product_id_or_slug)

        reviews = product.reviews.filter(is_approved=True)

        # Rating distribution
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        counts = reviews.values('rating').annotate(count=Count('id'))
        for c in counts:
            distribution[c['rating']] = c['count']

        user_has_purchased = False
        user_has_reviewed = False
        if request.user.is_authenticated:
            user_has_purchased = OrderItem.objects.filter(
                order__customer=request.user,
                product=product
            ).exists()
            user_has_reviewed = reviews.filter(user=request.user).exists()

        return Response({
            'average_rating': float(product.rating),
            'review_count': product.review_count,
            'distribution': distribution,
            'user_can_review': user_has_purchased and not user_has_reviewed,
            'user_has_reviewed': user_has_reviewed,
            'reviews': ReviewSerializer(reviews, many=True).data
        })

    def post(self, request, product_id_or_slug):
        if str(product_id_or_slug).isdigit():
            product = get_object_or_404(Product, id=product_id_or_slug)
        else:
            product = get_object_or_404(Product, slug=product_id_or_slug)

        # Check purchase eligibility: customers can review only products they purchased
        has_purchased = OrderItem.objects.filter(
            order__customer=request.user,
            product=product
        ).exists()

        # In dev/demo, allow admins or customers who purchased
        if not has_purchased and not (request.user.role == 'ADMIN' or request.user.is_staff):
            return Response({
                'error': 'You can only review products that you have ordered.'
            }, status=status.HTTP_403_FORBIDDEN)

        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CreateReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(product=product, user=request.user)
            return Response({
                'message': 'Review submitted successfully!',
                'review': ReviewSerializer(review).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MarkReviewHelpfulView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        review = get_object_or_404(Review, id=pk)
        review.helpful_count += 1
        review.save(update_fields=['helpful_count'])
        return Response({'message': 'Thank you for your feedback.', 'helpful_count': review.helpful_count})

class AdminReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminRole]
    queryset = Review.objects.all().select_related('product', 'user').order_by('-created_at')

    def perform_destroy(self, instance):
        instance.delete()
