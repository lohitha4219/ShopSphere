from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from apps.categories.models import Category
from apps.sellers.models import SellerProfile
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from apps.wishlist.models import WishlistItem
from apps.accounts.models import UserAddress
from apps.orders.models import Order

User = get_user_model()

class ShopSphereCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Test Users
        self.customer = User.objects.create_user(
            email='test_cust@shopsphere.local',
            username='test_cust',
            password='Password@123',
            first_name='Test',
            last_name='Customer',
            role=User.Role.CUSTOMER
        )

        self.seller_user = User.objects.create_user(
            email='test_sell@shopsphere.local',
            username='test_sell',
            password='Password@123',
            first_name='Test',
            last_name='Seller',
            role=User.Role.SELLER
        )

        self.seller_profile = SellerProfile.objects.create(
            user=self.seller_user,
            business_name='Apex Electronics',
            owner_name='Test Seller',
            email='test_sell@shopsphere.local',
            phone='9876543210',
            business_address='Apex Tower, Bangalore',
            status=SellerProfile.Status.APPROVED
        )

        self.admin_user = User.objects.create_superuser(
            email='test_admin@shopsphere.local',
            username='test_admin',
            password='Password@123',
            first_name='System',
            last_name='Admin'
        )

        # Test Category & Product
        self.category = Category.objects.create(name='Gadgets', slug='gadgets')
        self.product = Product.objects.create(
            seller=self.seller_profile,
            category=self.category,
            name='Apex Wireless Earbuds',
            slug='apex-wireless-earbuds',
            brand='Apex',
            sku='APX-001',
            price=Decimal('2999.00'),
            discount_price=Decimal('1999.00'),
            stock_quantity=20,
            is_active=True
        )

    def test_customer_registration(self):
        resp = self.client.post('/api/auth/register/', {
            'full_name': 'New User',
            'email': 'new_user@example.com',
            'phone': '9898989898',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'role': 'CUSTOMER'
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data.get('message'), 'Account created successfully. Please login.')

        # Verification of subsequent login
        login_resp = self.client.post('/api/auth/login/', {
            'email': 'new_user@example.com',
            'password': 'Password@123'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_resp.data)
        self.assertIn('access', login_resp.data['tokens'])

    def test_customer_login(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'test_cust@shopsphere.local',
            'password': 'Password@123'
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)

    def test_product_listing_and_filter(self):
        resp = self.client.get('/api/products/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data['results']) >= 1)

        # Filter by brand
        resp_brand = self.client.get('/api/products/?brand=Apex')
        self.assertEqual(resp_brand.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_brand.data['results'][0]['brand'], 'Apex')

    def test_cart_operations(self):
        self.client.force_authenticate(user=self.customer)
        
        # Add to cart
        add_resp = self.client.post('/api/cart/add/', {
            'product_id': self.product.id,
            'quantity': 2
        })
        self.assertEqual(add_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(add_resp.data['cart']['total_items_count'], 2)

        # View Cart
        view_resp = self.client.get('/api/cart/')
        self.assertEqual(view_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(float(view_resp.data['total_amount']), 2 * 1999.00)

    def test_wishlist_operations(self):
        self.client.force_authenticate(user=self.customer)
        
        # Add to wishlist
        resp = self.client.post('/api/wishlist/add/', {'product_id': self.product.id})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # Move to cart
        move_resp = self.client.post('/api/wishlist/move-to-cart/', {'product_id': self.product.id})
        self.assertEqual(move_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(WishlistItem.objects.filter(user=self.customer, product=self.product).exists())

    def test_checkout_and_order_flow(self):
        self.client.force_authenticate(user=self.customer)

        # Create address
        address = UserAddress.objects.create(
            user=self.customer,
            full_name='Test Customer',
            phone='9876543210',
            house_flat='101, Lake View',
            street='Central Road',
            area='Tech Park',
            city='Bengaluru',
            state='Karnataka',
            pincode='560001',
            is_default=True
        )

        # Direct Order Buy Now
        order_resp = self.client.post('/api/orders/create/', {
            'address_id': address.id,
            'payment_method': 'COD',
            'direct_product_id': self.product.id,
            'direct_quantity': 1
        })
        self.assertEqual(order_resp.status_code, status.HTTP_201_CREATED)
        order_data = order_resp.data['order']
        self.assertEqual(order_data['payment_method'], 'COD')
        self.assertEqual(order_data['order_status'], 'Confirmed')

        # Check stock deduction
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 19)

    def test_role_based_permissions(self):
        # Customer cannot access seller dashboard
        self.client.force_authenticate(user=self.customer)
        cust_resp = self.client.get('/api/sellers/dashboard/')
        self.assertEqual(cust_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Seller can access seller dashboard
        self.client.force_authenticate(user=self.seller_user)
        seller_resp = self.client.get('/api/sellers/dashboard/')
        self.assertEqual(seller_resp.status_code, status.HTTP_200_OK)

        # Non-admin cannot access admin dashboard
        non_admin_resp = self.client.get('/api/admin/dashboard/')
        self.assertEqual(non_admin_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access admin dashboard
        self.client.force_authenticate(user=self.admin_user)
        admin_resp = self.client.get('/api/admin/dashboard/')
        self.assertEqual(admin_resp.status_code, status.HTTP_200_OK)
