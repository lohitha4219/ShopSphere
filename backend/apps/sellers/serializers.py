from rest_framework import serializers
from .models import SellerProfile
from apps.accounts.serializers import UserSerializer

class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            'id', 'user', 'business_name', 'owner_name', 'email', 'phone',
            'business_address', 'gst_number', 'pan_number', 'bank_name',
            'bank_account_number', 'bank_ifsc', 'store_logo', 'status',
            'rejection_reason', 'commission_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'commission_rate', 'created_at', 'updated_at']

class SellerRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            'business_name', 'owner_name', 'email', 'phone',
            'business_address', 'gst_number', 'pan_number',
            'bank_name', 'bank_account_number', 'bank_ifsc', 'store_logo'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        if hasattr(user, 'seller_profile'):
            raise serializers.ValidationError('You already have a seller application submitted.')
        
        # Update user role to SELLER
        user.role = 'SELLER'
        user.save()

        seller = SellerProfile.objects.create(user=user, **validated_data)
        return seller
