from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user_name', 'user_email', 'rating',
            'title', 'comment', 'helpful_count', 'is_approved', 'created_at'
        ]
        read_only_fields = ['id', 'product', 'user_name', 'user_email', 'helpful_count', 'created_at']

class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment']
