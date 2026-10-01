from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserAddress

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'first_name', 'last_name',
            'full_name', 'profile_image', 'role', 'is_active', 'date_joined',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'role', 'date_joined', 'created_at', 'updated_at']

class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=6, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True, required=True)
    role = serializers.ChoiceField(choices=['CUSTOMER', 'SELLER'], default='CUSTOMER', required=False)

    def validate_email(self, value):
        normalized = value.lower().strip()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists. Please login.')
        return normalized

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.get('full_name', '').strip()
        parts = full_name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        email = validated_data['email']
        username = email.split('@')[0]
        # Ensure unique username
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            email=email,
            username=username,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'CUSTOMER')
        )
        return user

from django.db import models
from .google_auth import verify_google_id_token

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True)
    email_or_phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        identifier = attrs.get('email', '') or attrs.get('email_or_phone', '')
        identifier = identifier.strip()
        if not identifier:
            raise serializers.ValidationError({'email': 'Email or mobile number is required.'})
        password = attrs.get('password')

        user_obj = None
        # Check by email
        if '@' in identifier:
            user_obj = User.objects.filter(email__iexact=identifier.lower()).first()
        else:
            # Check by phone or username
            user_obj = User.objects.filter(
                models.Q(phone=identifier) | models.Q(username__iexact=identifier)
            ).first()

        if not user_obj:
            raise serializers.ValidationError({
                'account': 'Account not found. Please register first.',
                'non_field_errors': ['Account not found. Please register first.']
            })

        if not user_obj.check_password(password):
            raise serializers.ValidationError({
                'credentials': 'Invalid email or password.',
                'non_field_errors': ['Invalid email or password.']
            })

        if not user_obj.is_active:
            raise serializers.ValidationError({
                'status': 'Your account is currently inactive. Please contact support.',
                'non_field_errors': ['Your account is currently inactive. Please contact support.']
            })

        attrs['user'] = user_obj
        return attrs

class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=False, allow_blank=True)
    id_token = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        token = attrs.get('credential') or attrs.get('id_token') or attrs.get('token')
        if not token:
            raise serializers.ValidationError({'credential': 'Google ID token/credential is required.'})

        try:
            payload = verify_google_id_token(token)
        except ValueError as e:
            raise serializers.ValidationError({'error': str(e), 'non_field_errors': [str(e)]})

        email = payload.get('email', '').strip().lower()
        if not email:
            raise serializers.ValidationError({'error': 'Unable to retrieve verified email from Google.'})

        user = User.objects.filter(email__iexact=email).first()
        if user:
            if not user.is_active:
                raise serializers.ValidationError({
                    'status': 'Your account is currently inactive. Please contact support.',
                    'non_field_errors': ['Your account is currently inactive. Please contact support.']
                })
        else:
            # Create a new user with CUSTOMER role (never auto-create ADMIN or SELLER)
            name = payload.get('name', '').strip()
            given_name = payload.get('given_name', '').strip()
            family_name = payload.get('family_name', '').strip()
            if not given_name and name:
                parts = name.split(' ', 1)
                given_name = parts[0]
                family_name = parts[1] if len(parts) > 1 else ''

            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                email=email,
                username=username,
                first_name=given_name,
                last_name=family_name,
                role=User.Role.CUSTOMER,
                is_active=True
            )

        attrs['user'] = user
        return attrs

class ForgotPasswordSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(min_length=8, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(min_length=6, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = [
            'id', 'user', 'full_name', 'phone', 'house_flat', 'street',
            'area', 'city', 'state', 'pincode', 'landmark', 'address_type',
            'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # If user has no other addresses, make this one default
        if not UserAddress.objects.filter(user=validated_data['user']).exists():
            validated_data['is_default'] = True
        return super().create(validated_data)

class AdminUserManagementSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'first_name', 'last_name',
            'full_name', 'role', 'is_active', 'is_staff', 'date_joined',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
