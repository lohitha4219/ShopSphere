from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.accounts.models import UserAddress
from apps.categories.models import Category
from apps.sellers.models import SellerProfile
from apps.products.models import Product, ProductImage, ProductVariant
from apps.coupons.models import Coupon
from apps.reviews.models import Review
from apps.orders.models import Order, OrderItem, OrderTimeline
from apps.notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds realistic demo accounts, categories, products with matching images, and orders'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting ShopSphere database seeding with realistic product images...'))

        # 1. Demo Accounts
        default_pwd = 'ShopSphere@123'

        admin_user, _ = User.objects.get_or_create(
            email='admin@shopsphere.local',
            defaults={
                'username': 'admin',
                'first_name': 'ShopSphere',
                'last_name': 'Administrator',
                'phone': '+91 9876543210',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        admin_user.set_password(default_pwd)
        admin_user.save()

        seller_user, _ = User.objects.get_or_create(
            email='seller@shopsphere.local',
            defaults={
                'username': 'novastore',
                'first_name': 'Vikram',
                'last_name': 'Mehta',
                'phone': '+91 9811122334',
                'role': User.Role.SELLER,
                'is_active': True,
            }
        )
        seller_user.set_password(default_pwd)
        seller_user.save()

        customer_user, _ = User.objects.get_or_create(
            email='customer@shopsphere.local',
            defaults={
                'username': 'rahul_sharma',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'phone': '+91 9822233445',
                'role': User.Role.CUSTOMER,
                'is_active': True,
            }
        )
        customer_user.set_password(default_pwd)
        customer_user.save()

        # 2. Seller Profile
        seller_profile, _ = SellerProfile.objects.get_or_create(
            user=seller_user,
            defaults={
                'business_name': 'Nova Retail Hub',
                'owner_name': 'Vikram Mehta',
                'email': 'seller@shopsphere.local',
                'phone': '+91 9811122334',
                'business_address': 'Plot 42, Electronic City, Bengaluru, Karnataka - 560100',
                'gst_number': '29ABCDE1234F1Z5',
                'pan_number': 'ABCDE1234F',
                'bank_name': 'HDFC Bank',
                'bank_account_number': '50100234567890',
                'bank_ifsc': 'HDFC0001234',
                'status': SellerProfile.Status.APPROVED,
            }
        )

        seller_user2, _ = User.objects.get_or_create(
            email='crafts@shopsphere.local',
            defaults={
                'username': 'urbanstyle',
                'first_name': 'Pooja',
                'last_name': 'Verma',
                'phone': '+91 9833344556',
                'role': User.Role.SELLER,
                'is_active': True,
            }
        )
        seller_user2.set_password(default_pwd)
        seller_user2.save()

        seller_profile2, _ = SellerProfile.objects.get_or_create(
            user=seller_user2,
            defaults={
                'business_name': 'Urban Trends & Living',
                'owner_name': 'Pooja Verma',
                'email': 'crafts@shopsphere.local',
                'phone': '+91 9833344556',
                'business_address': 'Sector 18, Cyber City, Gurugram, Haryana - 122002',
                'gst_number': '06ABCDE5678G2Z1',
                'pan_number': 'FGHIJ5678K',
                'status': SellerProfile.Status.APPROVED,
            }
        )

        # 3. Customer Default Address
        UserAddress.objects.get_or_create(
            user=customer_user,
            full_name='Rahul Sharma',
            defaults={
                'phone': '+91 9822233445',
                'house_flat': 'Flat 402, Sunshine Heights',
                'street': '14th Cross, Indiranagar',
                'area': 'Near Metro Station',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'pincode': '560038',
                'landmark': 'Opposite Coffee House',
                'address_type': UserAddress.AddressType.HOME,
                'is_default': True,
            }
        )

        # 4. Categories & Subcategories with Realistic Category Images
        categories_data = [
            {
                'name': 'Fashion',
                'order': 1,
                'image': 'categories/fashion.jpg',
                'subs': ["Men's Fashion", "Women's Fashion", 'Kids Fashion']
            },
            {
                'name': 'Electronics',
                'order': 2,
                'image': 'categories/electronics.jpg',
                'subs': ['Mobiles', 'Laptops', 'Audio & Accessories']
            },
            {
                'name': 'Home & Kitchen',
                'order': 3,
                'image': 'categories/home-kitchen.jpg',
                'subs': ['Cookware', 'Home Decor', 'Kitchen Storage']
            },
            {
                'name': 'Beauty',
                'order': 4,
                'image': 'categories/beauty.jpg',
                'subs': ['Skincare', 'Fragrances', 'Haircare']
            },
            {
                'name': 'Footwear',
                'order': 5,
                'image': 'categories/footwear.jpg',
                'subs': ['Sneakers', 'Running Shoes', 'Formal Shoes']
            },
            {
                'name': 'Grocery',
                'order': 6,
                'image': 'categories/grocery.jpg',
                'subs': ['Snacks & Munchies', 'Beverages', 'Organic Essentials']
            },
            {
                'name': 'Sports & Fitness',
                'order': 7,
                'image': 'categories/sports.jpg',
                'subs': ['Gym Gear', 'Outdoor Sports', 'Yoga & Wellness']
            },
            {
                'name': 'Toys & Games',
                'order': 8,
                'image': 'categories/toys.jpg',
                'subs': ['Action Toys', 'Building Blocks', 'Board Games']
            },
            {
                'name': 'Appliances',
                'order': 9,
                'image': 'categories/appliances.jpg',
                'subs': ['Kitchen Appliances', 'Smart Home', 'Air Purifiers']
            },
            {
                'name': 'Furniture',
                'order': 10,
                'image': 'categories/furniture.jpg',
                'subs': ['Living Room', 'Bedrooms', 'Home Office']
            },
        ]

        cat_map = {}
        for cdata in categories_data:
            parent_cat, _ = Category.objects.get_or_create(
                name=cdata['name'],
                defaults={'order': cdata['order'], 'image': cdata['image'], 'is_active': True}
            )
            parent_cat.image = cdata['image']
            parent_cat.save()
            cat_map[cdata['name']] = parent_cat

            for sname in cdata['subs']:
                sub_cat, _ = Category.objects.get_or_create(
                    name=sname,
                    parent=parent_cat,
                    defaults={'is_active': True}
                )
                cat_map[sname] = sub_cat

        self.stdout.write(self.style.SUCCESS('Categories with images created.'))

        # 5. Realistic Products Catalog with Matching Images & Multi-Image Galleries
        catalog = [
            # ---------------- ELECTRONICS ----------------
            {
                'name': 'Wireless Bluetooth Noise Cancelling Headphones',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'SoundWave Pro',
                'price': Decimal('4999.00'),
                'discount_price': Decimal('2499.00'),
                'stock': 45,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 142,
                'short': '40dB Hybrid Active Noise Cancellation with 50-hour ultra battery life and spatial audio.',
                'desc': 'Experience concert-hall acoustics with custom tuned 40mm neodymium drivers. Memory foam ear cushions ensure supreme comfort for long listening sessions, while fast USB-C charging delivers 5 hours of playback in just 10 minutes.',
                'image': 'products/thumbnails/wireless-bluetooth-headphones.jpg',
                'gallery': [
                    'products/gallery/wireless-bluetooth-headphones.jpg',
                    'products/gallery/wireless-bluetooth-headphones-2.jpg',
                    'products/gallery/wireless-bluetooth-headphones-3.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Midnight Black', 'adj': Decimal('0.00'), 'stock': 25},
                    {'type': 'Color', 'name': 'Lunar Silver', 'adj': Decimal('200.00'), 'stock': 20},
                ]
            },
            {
                'name': 'Vanguard Ultra Slim 15.6" Gaming Laptop',
                'category': 'Electronics',
                'subcategory': 'Laptops',
                'seller': seller_profile,
                'brand': 'Vanguard Tech',
                'price': Decimal('59999.00'),
                'discount_price': Decimal('47999.00'),
                'stock': 18,
                'featured': True,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 64,
                'short': '16GB LPDDR5 RAM, 512GB NVMe SSD, 144Hz IPS display with RGB backlit keyboard.',
                'desc': 'Engineered for competitive esports and creative heavy lifting. Weighs just 1.6kg in an aerospace aluminum unibody chassis. Equipped with dual cooling turbofans, 100% sRGB color accuracy, and all-day 9-hour battery stamina.',
                'image': 'products/thumbnails/gaming-laptop.jpg',
                'gallery': [
                    'products/gallery/gaming-laptop.jpg',
                    'products/gallery/gaming-laptop-2.jpg',
                    'products/gallery/gaming-laptop-3.jpg',
                ],
                'variants': [
                    {'type': 'Storage', 'name': '512GB SSD', 'adj': Decimal('0.00'), 'stock': 10},
                    {'type': 'Storage', 'name': '1TB NVMe', 'adj': Decimal('4000.00'), 'stock': 8},
                ]
            },
            {
                'name': 'Nova 5G Pro Flagship Smartphone',
                'category': 'Electronics',
                'subcategory': 'Mobiles',
                'seller': seller_profile,
                'brand': 'Nova Mobile',
                'price': Decimal('29999.00'),
                'discount_price': Decimal('22999.00'),
                'stock': 32,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.9'),
                'reviews_count': 210,
                'short': '6.7" 120Hz AMOLED, 108MP OIS triple camera, 5000mAh battery with 67W Turbo Charge.',
                'desc': 'Stunning cinematic visuals with 1.07 billion colors and HDR10+ support. Capture ultra-clear night portraits with the 108MP sensor and enjoy silky smooth multitasking with the high-performance 5G processor.',
                'image': 'products/thumbnails/smartphone.jpg',
                'gallery': [
                    'products/gallery/smartphone.jpg',
                    'products/gallery/smartphone-2.jpg',
                    'products/gallery/smartphone-3.jpg',
                ],
                'variants': [
                    {'type': 'RAM', 'name': '8GB + 128GB', 'adj': Decimal('0.00'), 'stock': 16},
                    {'type': 'RAM', 'name': '12GB + 256GB', 'adj': Decimal('3000.00'), 'stock': 16},
                ]
            },
            {
                'name': 'Titan Edge OLED Fitness Smart Watch',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'Titan Tech',
                'price': Decimal('4499.00'),
                'discount_price': Decimal('1999.00'),
                'stock': 60,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.6'),
                'reviews_count': 185,
                'short': '1.96" Super AMOLED with Always-On Display, Bluetooth Calling, 120+ Sports Modes.',
                'desc': 'Continuous 24/7 heart rate monitoring, SpO2 blood oxygen tracking, sleep analytics, and IP68 water resistance. Sleek metallic casing with interchangeable quick-release silicone bands.',
                'image': 'products/thumbnails/smart-watch.jpg',
                'gallery': [
                    'products/gallery/smart-watch.jpg',
                    'products/gallery/smart-watch-2.jpg',
                    'products/gallery/smart-watch-3.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Obsidian Black', 'adj': Decimal('0.00'), 'stock': 30},
                    {'type': 'Color', 'name': 'Titanium Grey', 'adj': Decimal('100.00'), 'stock': 30},
                ]
            },
            {
                'name': 'BoomBlast Portable Waterproof Bluetooth Speaker',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'SoundWave Pro',
                'price': Decimal('3499.00'),
                'discount_price': Decimal('1699.00'),
                'stock': 40,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.5'),
                'reviews_count': 78,
                'short': '20W Deep Bass 360-degree stereo sound with IPX7 waterproof body and 16-hour playtime.',
                'desc': 'Rugged fabric finish designed for pool parties, camping, and outdoor adventures. Features party-link pairing to connect multiple speakers simultaneously.',
                'image': 'products/thumbnails/bluetooth-speaker.jpg',
                'gallery': [
                    'products/gallery/bluetooth-speaker.jpg',
                    'products/gallery/bluetooth-speaker-2.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Stealth Black', 'adj': Decimal('0.00'), 'stock': 20},
                    {'type': 'Color', 'name': 'Navy Blue', 'adj': Decimal('0.00'), 'stock': 20},
                ]
            },
            {
                'name': 'ErgoGrip Wireless Optical Mouse',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'Vanguard Tech',
                'price': Decimal('1499.00'),
                'discount_price': Decimal('699.00'),
                'stock': 55,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.4'),
                'reviews_count': 92,
                'short': 'Whisper-quiet clicks, 2.4GHz + Dual Bluetooth, 4000 DPI multi-surface tracking.',
                'desc': 'Sculpted ergonomic shape with soft rubber grips cradles your hand for strain-free work sessions. Long 18-month battery life with smart sleep mode.',
                'image': 'products/thumbnails/wireless-mouse.jpg',
                'gallery': [
                    'products/gallery/wireless-mouse.jpg',
                    'products/gallery/wireless-mouse-2.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Matte Black', 'adj': Decimal('0.00'), 'stock': 35},
                    {'type': 'Color', 'name': 'Off White', 'adj': Decimal('50.00'), 'stock': 20},
                ]
            },
            {
                'name': 'RGB Backlit Mechanical Gaming Keyboard',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'Vanguard Tech',
                'price': Decimal('3999.00'),
                'discount_price': Decimal('2299.00'),
                'stock': 28,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 114,
                'short': 'Hot-swappable blue tactile switches, per-key RGB backlighting, anti-ghosting keys.',
                'desc': 'Aircraft-grade anodized aluminum top frame provides robust durability. Includes braided detachable USB-C cable and ergonomic wrist rest.',
                'image': 'products/thumbnails/mechanical-keyboard.jpg',
                'gallery': [
                    'products/gallery/mechanical-keyboard.jpg',
                    'products/gallery/mechanical-keyboard-2.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Tactile Blue Switch', 'adj': Decimal('0.00'), 'stock': 14},
                    {'type': 'Color', 'name': 'Linear Red Switch', 'adj': Decimal('100.00'), 'stock': 14},
                ]
            },
            {
                'name': 'Zenith Tab 11" 2K IPS Tablet with Stylus',
                'category': 'Electronics',
                'subcategory': 'Laptops',
                'seller': seller_profile,
                'brand': 'Nova Mobile',
                'price': Decimal('24999.00'),
                'discount_price': Decimal('18999.00'),
                'stock': 22,
                'featured': True,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 48,
                'short': '2K Eye-Care IPS screen, Quad Dolby Atmos speakers, 7700mAh battery with magnetic pen.',
                'desc': 'Ideal for digital artists, note-taking students, and binge watchers. Ultra-slim 7.1mm metallic unibody with split-screen productivity mode.',
                'image': 'products/thumbnails/tablet.jpg',
                'gallery': ['products/gallery/tablet.jpg'],
                'variants': [
                    {'type': 'Storage', 'name': '128GB WiFi', 'adj': Decimal('0.00'), 'stock': 12},
                    {'type': 'Storage', 'name': '256GB LTE', 'adj': Decimal('4000.00'), 'stock': 10},
                ]
            },
            {
                'name': 'PowerCore 20000mAh 22.5W Fast Charge Power Bank',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'SoundWave Pro',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1199.00'),
                'stock': 70,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 160,
                'short': 'Triple port output (Dual USB-A + Type-C PD), LED battery percentage indicator.',
                'desc': 'High-density lithium polymer battery recharges a typical smartphone up to 4.5 times. Multi-protect safety chip safeguards against short circuits and surges.',
                'image': 'products/thumbnails/power-bank.jpg',
                'gallery': ['products/gallery/power-bank.jpg'],
                'variants': [
                    {'type': 'Color', 'name': 'Carbon Black', 'adj': Decimal('0.00'), 'stock': 40},
                    {'type': 'Color', 'name': 'Polar White', 'adj': Decimal('0.00'), 'stock': 30},
                ]
            },
            {
                'name': '65W GaN Dual Port USB-C Fast Wall Charger',
                'category': 'Electronics',
                'subcategory': 'Audio & Accessories',
                'seller': seller_profile,
                'brand': 'SoundWave Pro',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('899.00'),
                'stock': 80,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.8'),
                'reviews_count': 130,
                'short': 'Gallium Nitride (GaN III) compact tech, fast charges laptops, tablets, and phones simultaneously.',
                'desc': '50% smaller than standard chargers with foldable pins. Includes 100W rated 1.2m braided Type-C to Type-C cable.',
                'image': 'products/thumbnails/usb-c-charger.jpg',
                'gallery': ['products/gallery/usb-c-charger.jpg'],
                'variants': []
            },

            # ---------------- FASHION ----------------
            {
                'name': "Men's Premium 100% Breathable Cotton Casual Shirt",
                'category': 'Fashion',
                'subcategory': "Men's Fashion",
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('899.00'),
                'stock': 50,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.6'),
                'reviews_count': 95,
                'short': 'Soft-washed pre-shrunk pure combed cotton with modern slim spread collar.',
                'desc': 'Designed for smart-casual Fridays and evening outings. Features curved hemline, pearlized buttons, and reinforced double stitching for timeless durability.',
                'image': 'products/thumbnails/mens-casual-shirt.jpg',
                'gallery': [
                    'products/gallery/mens-casual-shirt.jpg',
                    'products/gallery/mens-casual-shirt-2.jpg',
                ],
                'variants': [
                    {'type': 'Size', 'name': 'M (38)', 'adj': Decimal('0.00'), 'stock': 15},
                    {'type': 'Size', 'name': 'L (40)', 'adj': Decimal('0.00'), 'stock': 20},
                    {'type': 'Size', 'name': 'XL (42)', 'adj': Decimal('50.00'), 'stock': 15},
                ]
            },
            {
                'name': "Men's CloudStride Cushion Engineered Running Shoes",
                'category': 'Footwear',
                'subcategory': 'Running Shoes',
                'seller': seller_profile2,
                'brand': 'Apex Athletics',
                'price': Decimal('3499.00'),
                'discount_price': Decimal('1699.00'),
                'stock': 40,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 180,
                'short': 'Ultra-responsive rebound EVA midsole with breathable engineered flyknit mesh upper.',
                'desc': 'High-traction anti-skid rubber outsole grips road and gym floors. Padded collar and anatomical arch support minimize impact during long distance runs.',
                'image': 'products/thumbnails/mens-running-shoes.jpg',
                'gallery': [
                    'products/gallery/mens-running-shoes.jpg',
                    'products/gallery/mens-running-shoes-2.jpg',
                    'products/gallery/mens-running-shoes-3.jpg',
                ],
                'variants': [
                    {'type': 'Size', 'name': 'UK 8', 'adj': Decimal('0.00'), 'stock': 12},
                    {'type': 'Size', 'name': 'UK 9', 'adj': Decimal('0.00'), 'stock': 16},
                    {'type': 'Size', 'name': 'UK 10', 'adj': Decimal('0.00'), 'stock': 12},
                ]
            },
            {
                'name': "Women's Royal Embroidered Anarkali Cotton Kurti",
                'category': 'Fashion',
                'subcategory': "Women's Fashion",
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('999.00'),
                'stock': 45,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 140,
                'short': 'Graceful flared silhouette adorned with zari threadwork and gota patti borders.',
                'desc': 'Handcrafted by artisan weavers using breathable premium viscose rayon. Features elegant three-quarter sleeves and mandarin keyhole collar.',
                'image': 'products/thumbnails/womens-kurti.jpg',
                'gallery': [
                    'products/gallery/womens-kurti.jpg',
                    'products/gallery/womens-kurti-2.jpg',
                ],
                'variants': [
                    {'type': 'Size', 'name': 'S (36)', 'adj': Decimal('0.00'), 'stock': 10},
                    {'type': 'Size', 'name': 'M (38)', 'adj': Decimal('0.00'), 'stock': 15},
                    {'type': 'Size', 'name': 'L (40)', 'adj': Decimal('0.00'), 'stock': 20},
                ]
            },
            {
                'name': "Women's Handwoven Kanjeevaram Silk Saree with Blouse Piece",
                'category': 'Fashion',
                'subcategory': "Women's Fashion",
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('5999.00'),
                'discount_price': Decimal('2999.00'),
                'stock': 25,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.9'),
                'reviews_count': 88,
                'short': 'Pure silk blend embellished with intricate golden zari floral motifs and contrast pallu.',
                'desc': 'A treasured masterpiece for weddings and festive celebrations. Comes with an unstitched 80cm brocade matching blouse piece.',
                'image': 'products/thumbnails/womens-saree.jpg',
                'gallery': [
                    'products/gallery/womens-saree.jpg',
                    'products/gallery/womens-saree-2.jpg',
                ],
                'variants': []
            },
            {
                'name': "Women's Structured Vegan Leather Shoulder Handbag",
                'category': 'Fashion',
                'subcategory': "Women's Fashion",
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1399.00'),
                'stock': 35,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.5'),
                'reviews_count': 72,
                'short': 'Triple compartment tote with gold-tone hardware and detachable shoulder strap.',
                'desc': 'Spacious water-resistant luxury vegan leather fits tablet, wallet, makeup kit, and essentials with smooth zippered security.',
                'image': 'products/thumbnails/womens-handbag.jpg',
                'gallery': [
                    'products/gallery/womens-handbag.jpg',
                    'products/gallery/womens-handbag-2.jpg',
                ],
                'variants': [
                    {'type': 'Color', 'name': 'Rich Tan Brown', 'adj': Decimal('0.00'), 'stock': 20},
                    {'type': 'Color', 'name': 'Classic Onyx Black', 'adj': Decimal('0.00'), 'stock': 15},
                ]
            },
            {
                'name': "Men's Classic Slim-Fit Stretch Denim Jeans",
                'category': 'Fashion',
                'subcategory': "Men's Fashion",
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1199.00'),
                'stock': 40,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.4'),
                'reviews_count': 60,
                'short': '98% Cotton with 2% Elastane for all-day flexible movement and vintage wash.',
                'desc': 'Reinforced rivets, durable YKK brass zipper fly, and classic 5-pocket styling. Resists fading wash after wash.',
                'image': 'products/thumbnails/mens-jeans.jpg',
                'gallery': ['products/gallery/mens-jeans.jpg'],
                'variants': [
                    {'type': 'Size', 'name': '32 Waist', 'adj': Decimal('0.00'), 'stock': 15},
                    {'type': 'Size', 'name': '34 Waist', 'adj': Decimal('0.00'), 'stock': 15},
                    {'type': 'Size', 'name': '36 Waist', 'adj': Decimal('50.00'), 'stock': 10},
                ]
            },
            {
                'name': "Kids Organic Cotton Play Graphic T-Shirt",
                'category': 'Fashion',
                'subcategory': 'Kids Fashion',
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('899.00'),
                'discount_price': Decimal('399.00'),
                'stock': 50,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 42,
                'short': 'Bio-washed non-toxic water-based prints, super gentle on sensitive child skin.',
                'desc': 'Durable rib knit neckband and tagless neck label for scratch-free daily play sessions.',
                'image': 'products/thumbnails/kids-tshirt.jpg',
                'gallery': ['products/gallery/kids-tshirt.jpg'],
                'variants': [
                    {'type': 'Size', 'name': '4-5 Years', 'adj': Decimal('0.00'), 'stock': 25},
                    {'type': 'Size', 'name': '6-7 Years', 'adj': Decimal('0.00'), 'stock': 25},
                ]
            },
            {
                'name': "Women's Minimalist White Platform Casual Sneakers",
                'category': 'Footwear',
                'subcategory': 'Sneakers',
                'seller': seller_profile2,
                'brand': 'Apex Athletics',
                'price': Decimal('2799.00'),
                'discount_price': Decimal('1299.00'),
                'stock': 35,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 118,
                'short': 'Comfortable memory foam footbed with easy wipe-clean synthetic leather upper.',
                'desc': 'Elevate your everyday wardrobe with versatile clean aesthetic lines that pair perfectly with jeans, dresses, or athleisure.',
                'image': 'products/thumbnails/womens-sneakers.jpg',
                'gallery': ['products/gallery/womens-sneakers.jpg'],
                'variants': [
                    {'type': 'Size', 'name': 'UK 5', 'adj': Decimal('0.00'), 'stock': 15},
                    {'type': 'Size', 'name': 'UK 6', 'adj': Decimal('0.00'), 'stock': 20},
                ]
            },

            # ---------------- HOME & KITCHEN ----------------
            {
                'name': 'Barista Touch Espresso & Filter Coffee Maker Machine',
                'category': 'Home & Kitchen',
                'subcategory': 'Kitchen Storage',
                'seller': seller_profile,
                'brand': 'Culina Master',
                'price': Decimal('8999.00'),
                'discount_price': Decimal('4999.00'),
                'stock': 25,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 82,
                'short': '15-bar Italian pump pressure, steam milk frother wand, heat-resistant borosilicate carafe.',
                'desc': 'Brew rich velvety cappuccinos, lattes, and intense espresso shots right on your kitchen counter. Features reusable stainless steel mesh filter and dual-shot portafilter.',
                'image': 'products/thumbnails/coffee-maker.jpg',
                'gallery': [
                    'products/gallery/coffee-maker.jpg',
                    'products/gallery/coffee-maker-2.jpg',
                ],
                'variants': []
            },
            {
                'name': 'Stainless Steel 1.8L Rapid Boil Electric Kettle',
                'category': 'Home & Kitchen',
                'subcategory': 'Kitchen Storage',
                'seller': seller_profile,
                'brand': 'Culina Master',
                'price': Decimal('1799.00'),
                'discount_price': Decimal('799.00'),
                'stock': 50,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 160,
                'short': '1500W rapid heating, food-grade 304 stainless steel interior with auto shut-off.',
                'desc': 'Boils water in under 4 minutes. 360-degree swivel cordless base, cool-touch handle, and boil-dry protection ensure utmost family safety.',
                'image': 'products/thumbnails/electric-kettle.jpg',
                'gallery': ['products/gallery/electric-kettle.jpg'],
                'variants': []
            },
            {
                'name': '5-Piece Granite Non-Stick Induction Cookware Set',
                'category': 'Home & Kitchen',
                'subcategory': 'Cookware',
                'seller': seller_profile,
                'brand': 'Culina Master',
                'price': Decimal('4999.00'),
                'discount_price': Decimal('2499.00'),
                'stock': 30,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 94,
                'short': 'PFOA-free 5-layer German granite coating with tempered glass lids and stay-cool handles.',
                'desc': 'Compatible with gas stoves, induction tops, and electric burners. Cook healthy meals with minimal oil without sticking or burning.',
                'image': 'products/thumbnails/cookware-set.jpg',
                'gallery': ['products/gallery/cookware-set.jpg'],
                'variants': []
            },
            {
                'name': '750W Heavy Duty Multi-Jar Mixer Grinder',
                'category': 'Appliances',
                'subcategory': 'Kitchen Appliances',
                'seller': seller_profile,
                'brand': 'Culina Master',
                'price': Decimal('3999.00'),
                'discount_price': Decimal('2199.00'),
                'stock': 35,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.5'),
                'reviews_count': 76,
                'short': '100% Copper motor, 3 stainless steel jars with flow breakers and overload protector.',
                'desc': 'Effortlessly grinds tough idli batter, turmeric roots, and dry masalas with razor-sharp 304 hardened steel blades.',
                'image': 'products/thumbnails/mixer-grinder.jpg',
                'gallery': ['products/gallery/mixer-grinder.jpg'],
                'variants': []
            },
            {
                'name': 'Vacuum Insulated Stainless Steel Water Bottle 1000ml',
                'category': 'Home & Kitchen',
                'subcategory': 'Kitchen Storage',
                'seller': seller_profile2,
                'brand': 'Apex Athletics',
                'price': Decimal('1299.00'),
                'discount_price': Decimal('549.00'),
                'stock': 70,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.8'),
                'reviews_count': 110,
                'short': 'Keeps drinks ice-cold for 24 hours or piping hot for 12 hours with condensation-free grip.',
                'desc': 'Food grade 18/8 stainless steel, BPA-free leakproof chug cap with silicone seal. Fits standard car cup holders and gym backpacks.',
                'image': 'products/thumbnails/water-bottle.jpg',
                'gallery': ['products/gallery/water-bottle.jpg'],
                'variants': [
                    {'type': 'Color', 'name': 'Matte Midnight', 'adj': Decimal('0.00'), 'stock': 35},
                    {'type': 'Color', 'name': 'Emerald Forest', 'adj': Decimal('0.00'), 'stock': 35},
                ]
            },
            {
                'name': 'Modern Nordic Ceramic Bedside Table Lamp',
                'category': 'Home & Kitchen',
                'subcategory': 'Home Decor',
                'seller': seller_profile2,
                'brand': 'Culina Master',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1199.00'),
                'stock': 28,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 55,
                'short': 'Hand-glazed ceramic base with textured linen fabric drum shade emitting gentle ambient glow.',
                'desc': 'Creates a tranquil cozy sanctuary in living rooms and bedrooms. Standard E27 socket compatible with smart LED bulbs.',
                'image': 'products/thumbnails/table-lamp.jpg',
                'gallery': ['products/gallery/table-lamp.jpg'],
                'variants': []
            },
            {
                'name': '400 Thread Count Pure Egyptian Cotton King Bedsheet Set',
                'category': 'Home & Kitchen',
                'subcategory': 'Home Decor',
                'seller': seller_profile2,
                'brand': 'Aura Wear',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1399.00'),
                'stock': 35,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 80,
                'short': 'Silky sateen weave, includes 1 King Flat Sheet (108"x108") and 2 matching pillowcases.',
                'desc': 'Naturally hypoallergenic and temperature-regulating for deep restorative slumber. Machine washable with shrink-proof finish.',
                'image': 'products/thumbnails/bedsheet-set.jpg',
                'gallery': ['products/gallery/bedsheet-set.jpg'],
                'variants': [
                    {'type': 'Color', 'name': 'Crisp Snow White', 'adj': Decimal('0.00'), 'stock': 18},
                    {'type': 'Color', 'name': 'Serene Slate Blue', 'adj': Decimal('50.00'), 'stock': 17},
                ]
            },

            # ---------------- BEAUTY ----------------
            {
                'name': 'Vitamin C Brightening Foaming Face Wash with Brush 150ml',
                'category': 'Beauty',
                'subcategory': 'Skincare',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('699.00'),
                'discount_price': Decimal('349.00'),
                'stock': 65,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 190,
                'short': 'Infused with Kakadu Plum, Mulberry extract, and gentle silicone deep-pore cleansing bristles.',
                'desc': 'Fades stubborn dark spots, eliminates excess sebum, and restores natural luminous radiance without drying out the skin barrier.',
                'image': 'products/thumbnails/face-wash.jpg',
                'gallery': ['products/gallery/face-wash.jpg'],
                'variants': []
            },
            {
                'name': 'Hyaluronic Acid 72-Hour Intense Moisture Gel Cream 50g',
                'category': 'Beauty',
                'subcategory': 'Skincare',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('899.00'),
                'discount_price': Decimal('499.00'),
                'stock': 50,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 130,
                'short': 'Ultra-lightweight oil-free formula with 5 multi-molecular weights of Hyaluronic Acid & Ceramides.',
                'desc': 'Instantly plumps fine dehydration lines, locks in dermal moisture for 72 hours, and absorbs rapidly leaving a velvety matte canvas.',
                'image': 'products/thumbnails/moisturizer.jpg',
                'gallery': ['products/gallery/moisturizer.jpg'],
                'variants': []
            },
            {
                'name': 'Moroccan Argan Oil Anti-Frizz Restoring Shampoo 300ml',
                'category': 'Beauty',
                'subcategory': 'Haircare',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('799.00'),
                'discount_price': Decimal('399.00'),
                'stock': 45,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.5'),
                'reviews_count': 74,
                'short': 'Sulfate, paraben, and silicone-free botanical nourishment for dry, damaged, or colored tresses.',
                'desc': 'Enriched with pure cold-pressed Moroccan argan oil and keratin protein to tame split ends, restore mirror shine, and prevent hair fall.',
                'image': 'products/thumbnails/shampoo.jpg',
                'gallery': ['products/gallery/shampoo.jpg'],
                'variants': []
            },
            {
                'name': 'Velvet Matte Longwear Transfer-Proof Lipstick 3.8g',
                'category': 'Beauty',
                'subcategory': 'Skincare',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('699.00'),
                'discount_price': Decimal('299.00'),
                'stock': 60,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 88,
                'short': '16-hour smudge-free pigmentation infused with Vitamin E and Jojoba oil.',
                'desc': 'Glides on effortlessly in a single swipe with intense color payoff that stays comfortable and weightless all day long.',
                'image': 'products/thumbnails/lipstick.jpg',
                'gallery': ['products/gallery/lipstick.jpg'],
                'variants': [
                    {'type': 'Color', 'name': 'Ruby Crimson', 'adj': Decimal('0.00'), 'stock': 30},
                    {'type': 'Color', 'name': 'Nude Mocha', 'adj': Decimal('0.00'), 'stock': 30},
                ]
            },
            {
                'name': 'Ultra Light Invisible Gel Sunscreen SPF 50+ PA++++ 50g',
                'category': 'Beauty',
                'subcategory': 'Skincare',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('749.00'),
                'discount_price': Decimal('449.00'),
                'stock': 70,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.9'),
                'reviews_count': 220,
                'short': 'Zero white cast, non-sticky water-based shield against UVA, UVB, and blue light.',
                'desc': 'Dermatologically tested for all skin types, including acne-prone skin. Leaves an invisible, breathable primer finish under makeup.',
                'image': 'products/thumbnails/sunscreen.jpg',
                'gallery': ['products/gallery/sunscreen.jpg'],
                'variants': []
            },
            {
                'name': 'Signature Artisanal Eau De Parfum Luxury Fragrance 100ml',
                'category': 'Beauty',
                'subcategory': 'Fragrances',
                'seller': seller_profile2,
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1299.00'),
                'stock': 30,
                'featured': True,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 62,
                'short': 'Captivating blend of bergamot, smoky amber, french lavender, and cedarwood notes.',
                'desc': 'Hand-crafted French perfume oil formulation with exceptional sillage that lingers elegantly through day and night.',
                'image': 'products/thumbnails/perfume.jpg',
                'gallery': ['products/gallery/perfume.jpg'],
                'variants': []
            },

            # ---------------- SPORTS & FITNESS ----------------
            {
                'name': 'ProStrike Grade-1 English Willow Cricket Bat',
                'category': 'Sports & Fitness',
                'subcategory': 'Outdoor Sports',
                'seller': seller_profile,
                'brand': 'Zenith Gear',
                'price': Decimal('8999.00'),
                'discount_price': Decimal('4999.00'),
                'stock': 20,
                'featured': True,
                'best_seller': False,
                'rating': Decimal('4.9'),
                'reviews_count': 50,
                'short': 'Massive contoured edges, perfect balance pickup, multi-piece cane handle with chevron grip.',
                'desc': 'Pre-knocked by master craftsmen for supreme power hitting. Includes padded thermal protection cover.',
                'image': 'products/thumbnails/cricket-bat.jpg',
                'gallery': ['products/gallery/cricket-bat.jpg'],
                'variants': []
            },
            {
                'name': 'FIFA-Standard Thermally Bonded Match Football (Size 5)',
                'category': 'Sports & Fitness',
                'subcategory': 'Outdoor Sports',
                'seller': seller_profile,
                'brand': 'Zenith Gear',
                'price': Decimal('1899.00'),
                'discount_price': Decimal('899.00'),
                'stock': 40,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 68,
                'short': 'Seamless textured aerodynamic PU surface with butyl bladder for optimal air retention.',
                'desc': 'Waterproof construction performs consistently across rainy grass pitches and indoor turf arenas.',
                'image': 'products/thumbnails/football.jpg',
                'gallery': ['products/gallery/football.jpg'],
                'variants': []
            },
            {
                'name': 'Carbon Fiber High-Tension Badminton Racket Dual Set',
                'category': 'Sports & Fitness',
                'subcategory': 'Outdoor Sports',
                'seller': seller_profile,
                'brand': 'Zenith Gear',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1499.00'),
                'stock': 35,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 82,
                'short': 'Isometric head frame, pre-strung at 28 lbs tension with full zippered protective carry bag.',
                'desc': 'Weighs only 82 grams for explosive smashes and swift wrist control during fast competitive rallies.',
                'image': 'products/thumbnails/badminton-racket.jpg',
                'gallery': ['products/gallery/badminton-racket.jpg'],
                'variants': []
            },
            {
                'name': 'ProFlex Non-Slip Dual Layer Eco TPE Yoga Mat (6mm)',
                'category': 'Sports & Fitness',
                'subcategory': 'Yoga & Wellness',
                'seller': seller_profile,
                'brand': 'Zenith Gear',
                'price': Decimal('1899.00'),
                'discount_price': Decimal('899.00'),
                'stock': 50,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 110,
                'short': 'Body alignment line markings, sweat-resistant textured anti-tear grip with carry strap.',
                'desc': 'Certified non-toxic, odorless eco-TPE foam provides optimal joint cushioning during intense pilates, yoga, and calisthenics.',
                'image': 'products/thumbnails/yoga-mat.jpg',
                'gallery': ['products/gallery/yoga-mat.jpg'],
                'variants': [
                    {'type': 'Color', 'name': 'Teal Aqua', 'adj': Decimal('0.00'), 'stock': 25},
                    {'type': 'Color', 'name': 'Violet Plum', 'adj': Decimal('0.00'), 'stock': 25},
                ]
            },

            # ---------------- GROCERY ----------------
            {
                'name': 'Royal Selection Aged Extra Long Basmati Rice 5kg',
                'category': 'Grocery',
                'subcategory': 'Organic Essentials',
                'seller': seller_profile2,
                'brand': 'PureOrigin Farms',
                'price': Decimal('899.00'),
                'discount_price': Decimal('549.00'),
                'stock': 80,
                'featured': False,
                'best_seller': True,
                'rating': Decimal('4.8'),
                'reviews_count': 150,
                'short': 'Naturally aged for 2 years in Himalayan foothills, elongates to more than twice its length.',
                'desc': 'Fluffy non-sticky slender grains perfect for rich biryanis, aromatic pulavs, and royal dinner banquets.',
                'image': 'products/thumbnails/basmati-rice.jpg',
                'gallery': ['products/gallery/basmati-rice.jpg'],
                'variants': []
            },
            {
                'name': 'Cold Pressed Pure Virgin Cooking Oil 1 Litre',
                'category': 'Grocery',
                'subcategory': 'Organic Essentials',
                'seller': seller_profile2,
                'brand': 'PureOrigin Farms',
                'price': Decimal('499.00'),
                'discount_price': Decimal('299.00'),
                'stock': 60,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 64,
                'short': 'Wood pressed kachi ghani unrefined oil rich in natural antioxidants and omega-3.',
                'desc': 'Zero cholesterol, zero trans fats, and zero chemicals. Retains pristine aroma and essential nutrients.',
                'image': 'products/thumbnails/cooking-oil.jpg',
                'gallery': ['products/gallery/cooking-oil.jpg'],
                'variants': []
            },
            {
                'name': 'Whole Leaf Darjeeling Organic Green Tea Tin 250g',
                'category': 'Grocery',
                'subcategory': 'Beverages',
                'seller': seller_profile2,
                'brand': 'PureOrigin Farms',
                'price': Decimal('699.00'),
                'discount_price': Decimal('399.00'),
                'stock': 55,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.6'),
                'reviews_count': 72,
                'short': 'Hand-picked first flush loose leaves bursting with metabolism-boosting catechins.',
                'desc': 'Subtle floral tasting notes without bitterness. Sealed in an airtight tin canister to preserve garden freshness.',
                'image': 'products/thumbnails/green-tea.jpg',
                'gallery': ['products/gallery/green-tea.jpg'],
                'variants': []
            },
            {
                'name': 'California Jumbo Roasted Almonds & Cashews Mix 500g',
                'category': 'Grocery',
                'subcategory': 'Snacks & Munchies',
                'seller': seller_profile2,
                'brand': 'PureOrigin Farms',
                'price': Decimal('899.00'),
                'discount_price': Decimal('599.00'),
                'stock': 70,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.9'),
                'reviews_count': 175,
                'short': 'Gently roasted with Himalayan pink salt, packed with plant protein and dietary fiber.',
                'desc': 'Crunchy premium nuts delivered in a resealable ziplock pouch for healthy guilt-free daily snacking.',
                'image': 'products/thumbnails/dry-fruits.jpg',
                'gallery': ['products/gallery/dry-fruits.jpg'],
                'variants': []
            },

            # ---------------- TOYS ----------------
            {
                'name': '4WD High-Speed Off-Road Monster Remote Control Car',
                'category': 'Toys & Games',
                'subcategory': 'Action Toys',
                'seller': seller_profile,
                'brand': 'PlaySphere Kids',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1499.00'),
                'stock': 35,
                'featured': True,
                'best_seller': True,
                'rating': Decimal('4.7'),
                'reviews_count': 86,
                'short': '2.4GHz anti-interference controller, shock absorbers, rechargeable battery (25km/h speed).',
                'desc': 'Climbs rocks, carpets, and sandy paths with heavy-duty rubber tires and independent spring suspension.',
                'image': 'products/thumbnails/rc-car.jpg',
                'gallery': ['products/gallery/rc-car.jpg'],
                'variants': []
            },
            {
                'name': '500-Piece Creative Architecture Building Blocks Set',
                'category': 'Toys & Games',
                'subcategory': 'Building Blocks',
                'seller': seller_profile,
                'brand': 'PlaySphere Kids',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('999.00'),
                'stock': 40,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.8'),
                'reviews_count': 92,
                'short': 'Vibrant interlocking educational bricks develop spatial awareness and STEM motor skills.',
                'desc': 'Compatible with all major brand building brick systems. Includes step-by-step idea booklet and storage tub.',
                'image': 'products/thumbnails/building-blocks.jpg',
                'gallery': ['products/gallery/building-blocks.jpg'],
                'variants': []
            },
            {
                'name': 'Giant Ultra Soft Cuddly Plush Teddy Bear 3 Feet',
                'category': 'Toys & Games',
                'subcategory': 'Action Toys',
                'seller': seller_profile,
                'brand': 'PlaySphere Kids',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1199.00'),
                'stock': 30,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.9'),
                'reviews_count': 115,
                'short': 'Hypoallergenic virgin microfiber filling with velvety plush huggable fur.',
                'desc': 'The timeless gift for birthdays, anniversaries, and kids nursery decor with satin ribbon bow tie.',
                'image': 'products/thumbnails/teddy-bear.jpg',
                'gallery': ['products/gallery/teddy-bear.jpg'],
                'variants': []
            },
            {
                'name': 'Deluxe Handcrafted Wooden Chess & Board Game Set',
                'category': 'Toys & Games',
                'subcategory': 'Board Games',
                'seller': seller_profile,
                'brand': 'PlaySphere Kids',
                'price': Decimal('1899.00'),
                'discount_price': Decimal('899.00'),
                'stock': 45,
                'featured': False,
                'best_seller': False,
                'rating': Decimal('4.7'),
                'reviews_count': 78,
                'short': 'Magnetic folding wooden gameboard with velvet-lined interior piece storage compartments.',
                'desc': 'Polished Staunton style wooden chessmen weighted for satisfying tactile gameplay.',
                'image': 'products/thumbnails/board-game.jpg',
                'gallery': ['products/gallery/board-game.jpg'],
                'variants': []
            },
        ]

        # Populate or update products
        created_products = []
        for idx, pdata in enumerate(catalog, start=1):
            cat = cat_map.get(pdata['category']) or cat_map['Electronics']
            subcat = cat_map.get(pdata['subcategory'])
            sku = f"SPS-SKU-{idx:04d}"

            prod, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': pdata['name'],
                    'seller': pdata['seller'],
                    'category': cat,
                    'subcategory': subcat,
                    'brand': pdata['brand'],
                    'price': pdata['price'],
                    'discount_price': pdata['discount_price'],
                    'stock_quantity': pdata['stock'],
                    'rating': pdata['rating'],
                    'review_count': pdata['reviews_count'],
                    'short_description': pdata['short'],
                    'description': pdata['desc'],
                    'thumbnail': pdata['image'],
                    'is_featured': pdata['featured'],
                    'is_best_seller': pdata['best_seller'],
                    'is_active': True,
                }
            )
            if not created:
                prod.name = pdata['name']
                prod.category = cat
                prod.subcategory = subcat
                prod.brand = pdata['brand']
                prod.price = pdata['price']
                prod.discount_price = pdata['discount_price']
                prod.thumbnail = pdata['image']
                prod.rating = pdata['rating']
                prod.review_count = pdata['reviews_count']
                prod.is_featured = pdata['featured']
                prod.is_best_seller = pdata['best_seller']
                prod.save()

            created_products.append(prod)

            # Product Gallery Images
            ProductImage.objects.filter(product=prod).delete()
            for g_idx, g_img in enumerate(pdata.get('gallery', []), start=1):
                ProductImage.objects.create(
                    product=prod,
                    image=g_img,
                    alt_text=f"{prod.name} view {g_idx}",
                    is_primary=(g_idx == 1),
                    order=g_idx
                )

            # Variants
            ProductVariant.objects.filter(product=prod).delete()
            for var in pdata['variants']:
                ProductVariant.objects.create(
                    product=prod,
                    variant_type=var['type'],
                    name=var['name'],
                    price_adjustment=var['adj'],
                    stock_quantity=var['stock'],
                    sku=f"{sku}-{var['name'][:3].upper()}"
                )

        self.stdout.write(self.style.SUCCESS(f'Created/updated {len(created_products)} realistic products with images & galleries.'))

        # 6. Coupons
        coupons = [
            {
                'code': 'WELCOME50',
                'desc': '50% off on your first order up to ₹200',
                'type': Coupon.DiscountType.PERCENTAGE,
                'val': Decimal('50.00'),
                'min_order': Decimal('299.00'),
                'max_disc': Decimal('200.00')
            },
            {
                'code': 'FLAT100',
                'desc': 'Flat ₹100 instant off on orders above ₹499',
                'type': Coupon.DiscountType.FIXED,
                'val': Decimal('100.00'),
                'min_order': Decimal('499.00'),
                'max_disc': None
            },
            {
                'code': 'FESTIVE20',
                'desc': '20% discount on all purchases above ₹999',
                'type': Coupon.DiscountType.PERCENTAGE,
                'val': Decimal('20.00'),
                'min_order': Decimal('999.00'),
                'max_disc': Decimal('500.00')
            },
            {
                'code': 'SPHEREFREESHIP',
                'desc': 'Free delivery coupon',
                'type': Coupon.DiscountType.FIXED,
                'val': Decimal('40.00'),
                'min_order': Decimal('199.00'),
                'max_disc': None
            }
        ]

        for c in coupons:
            Coupon.objects.get_or_create(
                code=c['code'],
                defaults={
                    'description': c['desc'],
                    'discount_type': c['type'],
                    'discount_value': c['val'],
                    'minimum_order_amount': c['min_order'],
                    'maximum_discount': c['max_disc'],
                    'usage_limit': 500,
                    'is_active': True,
                }
            )

        # 7. Reviews for first products
        reviews_sample = [
            (customer_user, 'Exceptional sound and battery!', 'ANC works wonderfully during flights and train travel. Battery easily lasted full 4 days.', 5, 14),
            (seller_user, 'Very premium build quality', 'Comfortable memory foam ear cushions. Spatial audio is a great touch for movie watching.', 5, 9),
            (admin_user, 'Great value for money', 'Decent mic quality on work calls. Totally worth the deal price.', 4, 3),
        ]

        for prod in created_products[:3]:
            for u, title, comment, rating, helpful in reviews_sample:
                Review.objects.update_or_create(
                    product=prod,
                    user=u,
                    defaults={
                        'title': title,
                        'rating': rating,
                        'comment': comment,
                        'helpful_count': helpful,
                        'is_approved': True
                    }
                )

        self.stdout.write(self.style.SUCCESS('ShopSphere Database seeded successfully with realistic products, categories, and multiple images!'))
