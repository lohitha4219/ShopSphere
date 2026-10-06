import os
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify

from apps.sellers.models import SellerProfile
from apps.categories.models import Category
from apps.products.models import Product, ProductImage, ProductVariant

User = get_user_model()


class Command(BaseCommand):
    help = 'Safely and idempotently seeds initial ShopSphere products and categories in the production database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force-update',
            action='store_true',
            help='Force update all product fields even if product already exists'
        )

    def handle(self, *args, **options):
        force_update = options.get('force_update', False)
        self.stdout.write(self.style.MIGRATE_HEADING("=== SHOPSPHERE PRODUCTION PRODUCT SEEDING ==="))

        with transaction.atomic():
            # 1. Ensure a default verified Seller exists
            seller = self.get_or_create_seller()

            # 2. Ensure all required categories exist
            cat_map = self.ensure_categories()

            # 3. Seed/Update Products Idempotently
            created_count, updated_count = self.seed_products(seller, cat_map, force_update)

        self.stdout.write(self.style.SUCCESS(
            f"\n[COMPLETED] Seeding finished successfully!\n"
            f"  Created: {created_count} products\n"
            f"  Updated: {updated_count} products\n"
            f"  Total Products in DB: {Product.objects.count()}\n"
            f"  Total Categories in DB: {Category.objects.count()}"
        ))

    def get_or_create_seller(self):
        """Finds or creates a default approved seller for initial catalog products."""
        seller = SellerProfile.objects.filter(status=SellerProfile.Status.APPROVED).first()
        if seller:
            return seller

        seller_user, _ = User.objects.get_or_create(
            email='seller@shopsphere.local',
            defaults={
                'username': 'shopsphere_official',
                'first_name': 'ShopSphere',
                'last_name': 'Official Store',
                'phone': '+91 9811122334',
                'role': User.Role.SELLER,
                'is_active': True,
            }
        )
        if not seller_user.has_usable_password():
            seller_user.set_password('ShopSphere@123')
            seller_user.save()

        seller_profile, _ = SellerProfile.objects.get_or_create(
            user=seller_user,
            defaults={
                'business_name': 'ShopSphere Official Store',
                'owner_name': 'ShopSphere Retail Hub',
                'email': 'seller@shopsphere.local',
                'phone': '+91 9811122334',
                'business_address': 'Plot 42, Electronic City, Bengaluru, Karnataka - 560100',
                'status': SellerProfile.Status.APPROVED,
            }
        )
        if seller_profile.status != SellerProfile.Status.APPROVED:
            seller_profile.status = SellerProfile.Status.APPROVED
            seller_profile.save()

        return seller_profile

    def ensure_categories(self):
        """Ensures all requested and platform categories exist with valid HTTPS images."""
        categories_definition = [
            # Explicitly requested categories
            {
                'name': 'Kids Wear',
                'slug': 'kids-wear',
                'order': 1,
                'description': 'Comfortable, stylish and durable everyday clothing for boys and girls.',
                'image': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': "Women's Wear",
                'slug': 'womens-wear',
                'order': 2,
                'description': 'Contemporary, ethnic and western fashion wear for modern women.',
                'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Sarees',
                'slug': 'sarees',
                'order': 3,
                'description': 'Handwoven traditional and contemporary festive sarees in silk, georgette, and chiffon.',
                'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Dresses',
                'slug': 'dresses',
                'order': 4,
                'description': 'Flattering casual, evening, cocktail and summer maxi dresses for every occasion.',
                'image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'College Wear',
                'slug': 'college-wear',
                'order': 5,
                'description': 'Trendy, relaxed, stylish campus outfits, hoodies, tees, and denim.',
                'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Party Wear',
                'slug': 'party-wear',
                'order': 6,
                'description': 'Celebration and evening ready gowns, blazers, and statement evening wear.',
                'image': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Office Wear',
                'slug': 'office-wear',
                'order': 7,
                'description': 'Crisp, structured formal shirts, trousers, and power blazers for professionals.',
                'image': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Accessories',
                'slug': 'accessories',
                'order': 8,
                'description': 'Watches, sunglasses, leather wallets, belts and designer handbags.',
                'image': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
            },
            # Core marketplace categories
            {
                'name': 'Fashion',
                'slug': 'fashion',
                'order': 9,
                'description': 'Explore fashion for men, women, and kids.',
                'image': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Electronics',
                'slug': 'electronics',
                'order': 10,
                'description': 'Premium gadgets, audio, laptops, smartphones and tech gear.',
                'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Footwear',
                'slug': 'footwear',
                'order': 11,
                'description': 'Sneakers, formal shoes, sports runners, and casual sandals.',
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Home & Kitchen',
                'slug': 'home-kitchen',
                'order': 12,
                'description': 'Cookware, dinnerware, home decor, bedsheets and essentials.',
                'image': 'https://images.unsplash.com/photo-1517668808822-9ebd02f2a888?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Beauty',
                'slug': 'beauty',
                'order': 13,
                'description': 'Skincare, luxury fragrances, cosmetics and personal care.',
                'image': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Sports & Fitness',
                'slug': 'sports-fitness',
                'order': 14,
                'description': 'Fitness gear, gym equipment, yoga mats and sports accessories.',
                'image': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
            },
        ]

        cat_map = {}
        for cdata in categories_definition:
            cat, created = Category.objects.get_or_create(
                slug=cdata['slug'],
                defaults={
                    'name': cdata['name'],
                    'order': cdata['order'],
                    'description': cdata['description'],
                    'image': cdata['image'],
                    'is_active': True,
                }
            )
            if not created:
                # Ensure active and non-empty image
                updated = False
                if not cat.image or str(cat.image).startswith('categories/'):
                    cat.image = cdata['image']
                    updated = True
                if not cat.is_active:
                    cat.is_active = True
                    updated = True
                if updated:
                    cat.save()
            cat_map[cdata['slug']] = cat

        return cat_map

    def seed_products(self, seller, cat_map, force_update):
        """Seeds realistic products idempotently by unique SKU and slug."""
        products_catalog = [
            # === KIDS WEAR ===
            {
                'sku': 'SPS-KW-001',
                'slug': 'kids-organic-cotton-dinosaur-graphic-tshirt',
                'name': 'Kids Organic Cotton Dinosaur Play Graphic T-Shirt',
                'category_slug': 'kids-wear',
                'brand': 'LittleAura Kids',
                'price': Decimal('799.00'),
                'discount_price': Decimal('499.00'),
                'stock_quantity': 50,
                'rating': Decimal('4.80'),
                'review_count': 14,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Soft 100% combed organic cotton tee with non-toxic playful dinosaur print.',
                'description': 'Designed for active play and gentle on sensitive skin. Made with 100% GOTS certified organic combed cotton, tagless neckline for zero itch, and reinforced double stitching at the collar and hem.',
                'thumbnail': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-KW-002',
                'slug': 'kids-denim-dungarees-striped-tee-set',
                'name': 'Kids Denim Dungarees & Striped Tee 2-Piece Set',
                'category_slug': 'kids-wear',
                'brand': 'LittleAura Kids',
                'price': Decimal('1499.00'),
                'discount_price': Decimal('999.00'),
                'stock_quantity': 35,
                'rating': Decimal('4.65'),
                'review_count': 9,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Durable adjustable denim overalls paired with a breathable striped cotton t-shirt.',
                'description': 'A classic weekend look for kids. Featuring soft-washed denim with adjustable metal buckle straps, deep front pockets for toys, and a matching jersey tee made from stretch cotton blend.',
                'thumbnail': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-KW-003',
                'slug': 'girls-floral-tiered-summer-party-frock',
                'name': "Girls Floral Tiered Summer Party Frock",
                'category_slug': 'kids-wear',
                'brand': 'LittleAura Kids',
                'price': Decimal('1299.00'),
                'discount_price': Decimal('799.00'),
                'stock_quantity': 40,
                'rating': Decimal('4.75'),
                'review_count': 12,
                'is_featured': True,
                'is_best_seller': False,
                'short_description': 'Charming tiered floral dress with breathable cotton lining and flutter sleeves.',
                'description': 'Perfect for birthday parties and family gatherings. Featuring a pastel floral print on lightweight chiffon with a soft 100% cotton inner lining, back button keyhole, and twirl-ready tiered flare.',
                'thumbnail': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-KW-004',
                'slug': 'boys-smart-linen-collar-shirt-shorts-set',
                'name': "Boys Smart Casual Linen Collar Shirt & Shorts Set",
                'category_slug': 'kids-wear',
                'brand': 'LittleAura Kids',
                'price': Decimal('1699.00'),
                'discount_price': Decimal('1199.00'),
                'stock_quantity': 30,
                'rating': Decimal('4.70'),
                'review_count': 8,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Breathable linen-cotton Mandarin collar shirt with elastic waist chino shorts.',
                'description': 'A dapper outfit for festivities and celebrations. Crafted from premium pre-washed linen-cotton blend that stays cool in warm weather. Includes wood-finish buttons and elasticated waistband with drawstring.',
                'thumbnail': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
            },

            # === WOMEN'S WEAR ===
            {
                'sku': 'SPS-WW-001',
                'slug': 'womens-floral-print-pure-cotton-anarkali-kurti',
                'name': "Women's Floral Print Pure Cotton Anarkali Kurti",
                'category_slug': 'womens-wear',
                'brand': 'Aura Wear',
                'price': Decimal('2499.00'),
                'discount_price': Decimal('1299.00'),
                'stock_quantity': 60,
                'rating': Decimal('4.85'),
                'review_count': 28,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Handcrafted pure cotton flared Anarkali kurti with intricate floral block print.',
                'description': 'Embrace effortless elegance with this breathable pure cotton Anarkali kurti. Boasts a flattering flared silhouette, round neckline with delicate border piping, 3/4th sleeves, and subtle gotta patti detailing.',
                'thumbnail': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-WW-002',
                'slug': 'womens-high-waist-relaxed-wide-leg-trousers',
                'name': "Women's High-Waist Relaxed Wide-Leg Trousers",
                'category_slug': 'womens-wear',
                'brand': 'Aura Wear',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('1199.00'),
                'stock_quantity': 45,
                'rating': Decimal('4.60'),
                'review_count': 16,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'Chic tailored wide-leg trousers with elastic back waistband and front pleats.',
                'description': 'Elevate your daily wardrobe with these ultra-comfortable wide-leg trousers. Designed in a premium wrinkle-resistant rayon-blend with a clean high-waisted cut, slanted side pockets, and relaxed drape.',
                'thumbnail': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-WW-003',
                'slug': 'womens-handcrafted-chanderi-silk-kurta-set',
                'name': "Women's Handcrafted Chanderi Silk Kurta Set with Dupatta",
                'category_slug': 'womens-wear',
                'brand': 'Aura Wear',
                'price': Decimal('3999.00'),
                'discount_price': Decimal('2499.00'),
                'stock_quantity': 25,
                'rating': Decimal('4.90'),
                'review_count': 22,
                'is_featured': True,
                'is_best_seller': False,
                'short_description': '3-piece regal Chanderi silk kurta, straight trousers, and organza zari dupatta.',
                'description': 'Woven with subtle metallic threads, this royal festive kurta set features delicate hand-embroidery along the placket, tonal straight trousers with scallop lace hems, and a sheer organza dupatta.',
                'thumbnail': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            },

            # === SAREES ===
            {
                'sku': 'SPS-SAR-001',
                'slug': 'royal-kanjeevaram-silk-woven-saree-golden-zari',
                'name': "Royal Kanjeevaram Silk Woven Saree with Golden Zari Border",
                'category_slug': 'sarees',
                'brand': 'Virasat Silks',
                'price': Decimal('6999.00'),
                'discount_price': Decimal('3499.00'),
                'stock_quantity': 30,
                'rating': Decimal('4.92'),
                'review_count': 45,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Heirloom quality Kanjeevaram art silk saree with ornate floral golden zari pallu.',
                'description': 'Step into timeless royal splendor. Woven by master weavers with luminous jacquard motifs across the body and a heavy contrasting zari border. Comes with an unstitched 80cm blouse piece.',
                'thumbnail': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-SAR-002',
                'slug': 'banarasi-georgette-handwoven-festive-saree',
                'name': "Banarasi Georgette Handwoven Festive Saree",
                'category_slug': 'sarees',
                'brand': 'Virasat Silks',
                'price': Decimal('4999.00'),
                'discount_price': Decimal('2799.00'),
                'stock_quantity': 28,
                'rating': Decimal('4.80'),
                'review_count': 19,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Lightweight flowy Banarasi georgette saree with intricate silver kadwa weave.',
                'description': 'Combining rich Banarasi heritage with the airy grace of georgette. Easy to drape and maintain, featuring dense floral butis all over and a regal contrast border.',
                'thumbnail': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-SAR-003',
                'slug': 'pure-chiffon-floral-printed-casual-saree',
                'name': "Pure Chiffon Floral Printed Lightweight Casual Saree",
                'category_slug': 'sarees',
                'brand': 'Virasat Silks',
                'price': Decimal('2299.00'),
                'discount_price': Decimal('1199.00'),
                'stock_quantity': 50,
                'rating': Decimal('4.68'),
                'review_count': 31,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'Feather-light printed chiffon saree in fresh watercolor botanical motifs.',
                'description': 'The ultimate everyday drape for office or festive brunches. Soft, featherweight chiffon with clean finished edges and an accompanying solid crepe blouse fabric.',
                'thumbnail': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
            },

            # === DRESSES ===
            {
                'sku': 'SPS-DRS-001',
                'slug': 'elegance-fit-flare-french-midi-evening-dress',
                'name': "Elegance Fit & Flare French Midi Evening Dress",
                'category_slug': 'dresses',
                'brand': 'Moda Nova',
                'price': Decimal('3299.00'),
                'discount_price': Decimal('1899.00'),
                'stock_quantity': 40,
                'rating': Decimal('4.78'),
                'review_count': 24,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Feminine sweetheart neckline midi dress with cinched waist and pleated skirt.',
                'description': 'Flattering silhouette crafted from premium structured crepe. Features a sweetheart bustier neckline, discreet side zipper closure, elegant side slit, and graceful movement.',
                'thumbnail': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-DRS-002',
                'slug': 'bohemian-floral-print-maxi-wrap-summer-dress',
                'name': "Bohemian Floral Print Maxi Wrap Summer Dress",
                'category_slug': 'dresses',
                'brand': 'Moda Nova',
                'price': Decimal('2799.00'),
                'discount_price': Decimal('1499.00'),
                'stock_quantity': 35,
                'rating': Decimal('4.72'),
                'review_count': 17,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Flowing true wrap maxi dress with vibrant bohemian florals and ruffle hem.',
                'description': 'Breezy and flattering on all body types. Features an adjustable waist tie, V-neckline, cascading ruffle hemline, and breathable viscose fabric that stays cool all day.',
                'thumbnail': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-DRS-003',
                'slug': 'classic-polka-dot-aline-retro-casual-dress',
                'name': "Classic Polka Dot A-Line Retro Casual Dress",
                'category_slug': 'dresses',
                'brand': 'Moda Nova',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('1099.00'),
                'stock_quantity': 45,
                'rating': Decimal('4.60'),
                'review_count': 15,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Vintage-inspired polka dot skater dress with cap sleeves and tie belt.',
                'description': 'A versatile retro staple made from stretch-infused breathable cotton. Features a boat neck, concealed back zipper, and matching tie-up belt to accentuate the waistline.',
                'thumbnail': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
            },

            # === COLLEGE WEAR ===
            {
                'sku': 'SPS-CW-001',
                'slug': 'oversized-campus-graphic-drop-shoulder-hoodie',
                'name': "Oversized Campus Graphic Drop-Shoulder Hoodie",
                'category_slug': 'college-wear',
                'brand': 'UrbanPulse',
                'price': Decimal('2299.00'),
                'discount_price': Decimal('1299.00'),
                'stock_quantity': 55,
                'rating': Decimal('4.82'),
                'review_count': 33,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Heavyweight 380 GSM fleece oversized hoodie with vintage varsity typographic print.',
                'description': 'The quintessential college essential. Built with ultra-soft brushback cotton fleece, double-layer hood with thick drawstrings, roomy kangaroo pouch, and durable ribbed cuffs.',
                'thumbnail': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-CW-002',
                'slug': 'classic-straight-fit-distressed-denim-jeans',
                'name': "Classic Straight-Fit Distressed Denim Jeans",
                'category_slug': 'college-wear',
                'brand': 'UrbanPulse',
                'price': Decimal('2599.00'),
                'discount_price': Decimal('1499.00'),
                'stock_quantity': 40,
                'rating': Decimal('4.65'),
                'review_count': 21,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': '100% durable cotton authentic straight leg jeans with light distress wash.',
                'description': 'Rugged vintage aesthetic meets everyday comfort. Built with heavy-duty brass rivets, authentic 5-pocket styling, and premium stonewashed indigo denim that ages gracefully.',
                'thumbnail': 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-CW-003',
                'slug': 'minimalist-canvas-everyday-campus-backpack',
                'name': "Minimalist Canvas Everyday Campus Backpack with Laptop Sleeve",
                'category_slug': 'college-wear',
                'brand': 'UrbanPulse',
                'price': Decimal('1899.00'),
                'discount_price': Decimal('999.00'),
                'stock_quantity': 65,
                'rating': Decimal('4.74'),
                'review_count': 42,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Water-resistant high-density canvas daypack with padded 15.6" laptop compartment.',
                'description': 'Spacious 24-litre campus daypack with ergonomic contoured shoulder straps, twin mesh water bottle holders, anti-theft back pocket, and reinforced bottom panel.',
                'thumbnail': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
            },

            # === PARTY WEAR ===
            {
                'sku': 'SPS-PW-001',
                'slug': 'glamour-sequin-embroidered-evening-gown',
                'name': "Glamour Sequin Embroidered Net Party Gown",
                'category_slug': 'party-wear',
                'brand': 'Luxe Royale',
                'price': Decimal('5499.00'),
                'discount_price': Decimal('2999.00'),
                'stock_quantity': 25,
                'rating': Decimal('4.88'),
                'review_count': 27,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Showstopping floor-length evening gown encrusted with micro-shimmer sequins.',
                'description': 'Turn heads at every gala and cocktail evening. Features dazzling hand-embroidered ombre sequins on stretch illusion mesh, padded cups, plunging backline, and a sweeping mermaid flare.',
                'thumbnail': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-PW-002',
                'slug': 'mens-premium-velvet-tuxedo-blazer',
                'name': "Men's Premium Velvet Tuxedo Blazer with Satin Lapel",
                'category_slug': 'party-wear',
                'brand': 'Luxe Royale',
                'price': Decimal('5999.00'),
                'discount_price': Decimal('3499.00'),
                'stock_quantity': 30,
                'rating': Decimal('4.80'),
                'review_count': 18,
                'is_featured': False,
                'is_best_seller': False,
                'short_description': 'Midnight plush micro-velvet single-breasted blazer with contrasting satin lapels.',
                'description': 'The definitive statement piece for formal parties and receptions. Crafted with rich pile velvet, satin-covered single button, dual besom pockets, and silky jacquard inner lining.',
                'thumbnail': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
            },

            # === OFFICE WEAR ===
            {
                'sku': 'SPS-OW-001',
                'slug': 'mens-tailored-slimfit-noniron-oxford-formal-shirt',
                'name': "Men's Tailored Slim-Fit Non-Iron Oxford Formal Shirt",
                'category_slug': 'office-wear',
                'brand': 'Executive Edge',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('1199.00'),
                'stock_quantity': 70,
                'rating': Decimal('4.82'),
                'review_count': 54,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': '100% 2-ply long-staple cotton non-iron shirt with spread collar and French placket.',
                'description': 'Look impeccable from 9 to 5. Engineered with crease-resistant non-iron technology and natural stretch. Features mother-of-pearl finish buttons and reinforced collar stays.',
                'thumbnail': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-OW-002',
                'slug': 'womens-structured-double-breasted-power-blazer',
                'name': "Women's Structured Double-Breasted Power Blazer",
                'category_slug': 'office-wear',
                'brand': 'Executive Edge',
                'price': Decimal('3499.00'),
                'discount_price': Decimal('2199.00'),
                'stock_quantity': 35,
                'rating': Decimal('4.86'),
                'review_count': 31,
                'is_featured': True,
                'is_best_seller': False,
                'short_description': 'Command the boardroom in this sharply tailored double-breasted suit blazer.',
                'description': 'Expertly sculpted shoulders with clean peak lapels and tortoiseshell buttons. Fabricated in a mid-weight stretch twill that maintains sharp drape throughout long workdays.',
                'thumbnail': 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80',
            },

            # === ACCESSORIES ===
            {
                'sku': 'SPS-ACC-001',
                'slug': 'classic-analog-chronograph-watch-leather-strap',
                'name': "Classic Analog Chronograph Watch with Genuine Leather Strap",
                'category_slug': 'accessories',
                'brand': 'Titan Edge',
                'price': Decimal('4499.00'),
                'discount_price': Decimal('2499.00'),
                'stock_quantity': 45,
                'rating': Decimal('4.85'),
                'review_count': 49,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Japanese quartz multi-dial chronograph watch with 5 ATM water resistance.',
                'description': 'Timeless design with modern precision. Stainless steel 42mm case with mineral crystal glass, date window, tachymeter scale, and genuine Italian full-grain leather band.',
                'thumbnail': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-ACC-002',
                'slug': 'polarized-uv400-aviator-metal-sunglasses',
                'name': "Polarized UV400 Aviator Metal Sunglasses",
                'category_slug': 'accessories',
                'brand': 'Titan Edge',
                'price': Decimal('1999.00'),
                'discount_price': Decimal('999.00'),
                'stock_quantity': 60,
                'rating': Decimal('4.70'),
                'review_count': 38,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'Glare-blocking polarized triacetate lenses with ultralight titanium-alloy frame.',
                'description': 'Complete eye protection with 100% UV400 filtering. Features flexible spring hinges, soft silicone adjustable nose pads, and shatterproof scratch-resistant lenses.',
                'thumbnail': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-ACC-003',
                'slug': 'structured-vegan-leather-shoulder-tote-handbag',
                'name': "Structured Vegan Leather Shoulder Tote Handbag",
                'category_slug': 'accessories',
                'brand': 'Aura Wear',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1699.00'),
                'stock_quantity': 50,
                'rating': Decimal('4.76'),
                'review_count': 29,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'Spacious multi-compartment premium pebble-grain vegan leather tote.',
                'description': 'Polished and functional everyday companion. Features top-zip main compartment, interior padded tablet pocket, gold-tone hardware accents, and sturdy reinforced dual handles.',
                'thumbnail': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
            },

            # === ELECTRONICS & GADGETS ===
            {
                'sku': 'SPS-EL-001',
                'slug': 'wireless-bluetooth-noise-cancelling-headphones',
                'name': 'Wireless Bluetooth Noise Cancelling Headphones',
                'category_slug': 'electronics',
                'brand': 'SoundWave Pro',
                'price': Decimal('4999.00'),
                'discount_price': Decimal('2499.00'),
                'stock_quantity': 45,
                'rating': Decimal('4.88'),
                'review_count': 64,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': '40dB Hybrid Active Noise Cancellation with 50-hour ultra battery life.',
                'description': 'Experience theater-grade sound with the AeroGlide ANC headphones. Equipped with custom tuned 40mm neodymium drivers, spatial audio algorithms, and plush memory foam ear cushions for all-day comfort. Features fast USB-C charging giving 5 hours of playback in 10 minutes.',
                'thumbnail': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-EL-002',
                'slug': 'vanguard-ultra-slim-156-gaming-laptop',
                'name': 'Vanguard Ultra Slim 15.6" Gaming Laptop',
                'category_slug': 'electronics',
                'brand': 'Vanguard Tech',
                'price': Decimal('59999.00'),
                'discount_price': Decimal('47999.00'),
                'stock_quantity': 18,
                'rating': Decimal('4.90'),
                'review_count': 22,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Intel Core i7 13th Gen, 16GB DDR5, 1TB NVMe SSD, RTX 4060 8GB Graphics.',
                'description': 'Unleash elite gaming and creative performance. Packed with a 165Hz QHD IPS anti-glare display, dual-fan vapor chamber cooling, per-key RGB backlit keyboard, and lightweight aerospace-grade aluminum chassis.',
                'thumbnail': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-EL-003',
                'slug': 'nova-5g-pro-flagship-smartphone',
                'name': 'Nova 5G Pro Flagship Smartphone',
                'category_slug': 'electronics',
                'brand': 'Nova Mobile',
                'price': Decimal('29999.00'),
                'discount_price': Decimal('22999.00'),
                'stock_quantity': 35,
                'rating': Decimal('4.82'),
                'review_count': 41,
                'is_featured': True,
                'is_best_seller': False,
                'short_description': '108MP OIS Studio Camera, 120Hz Curved AMOLED, 67W Super Fast Charging.',
                'description': 'Captivating design engineered for photography enthusiasts and power multitaskers. Features Snapdragon 8-series processor, 5000mAh all-day battery, stereo Dolby Atmos speakers, and Corning Gorilla Glass Victus.',
                'thumbnail': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-EL-004',
                'slug': 'titan-edge-oled-fitness-smart-watch',
                'name': 'Titan Edge OLED Fitness Smart Watch',
                'category_slug': 'electronics',
                'brand': 'Titan Tech',
                'price': Decimal('4499.00'),
                'discount_price': Decimal('1999.00'),
                'stock_quantity': 120,
                'rating': Decimal('4.74'),
                'review_count': 56,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': '1.96" Ultra AMOLED Display, Bluetooth Calling, 110+ Sports Modes.',
                'description': 'Your comprehensive wellness partner on your wrist. Continuous SpO2 and heart-rate monitoring, AI sleep scoring, IP68 water resistance, and up to 10 days of battery on a single magnetic charge.',
                'thumbnail': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-EL-005',
                'slug': 'boomblast-portable-waterproof-bluetooth-speaker',
                'name': 'BoomBlast Portable Waterproof Bluetooth Speaker',
                'category_slug': 'electronics',
                'brand': 'SoundWave Pro',
                'price': Decimal('3499.00'),
                'discount_price': Decimal('1699.00'),
                'stock_quantity': 65,
                'rating': Decimal('4.68'),
                'review_count': 37,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': '24W Punchy Bass, IPX7 Waterproof, 20-Hour Playtime with RGB Lights.',
                'description': 'Take the festival anywhere. Engineered with dual passive radiators for deep resonant bass, rugged rubberized armor shock protection, TWS stereo pairing mode, and hands-free microphone calls.',
                'thumbnail': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
            },

            # === FOOTWEAR ===
            {
                'sku': 'SPS-FW-001',
                'slug': 'mens-cloudstride-running-shoes',
                'name': "Men's CloudStride Cushion Engineered Running Shoes",
                'category_slug': 'footwear',
                'brand': 'Apex Athletics',
                'price': Decimal('3499.00'),
                'discount_price': Decimal('1799.00'),
                'stock_quantity': 80,
                'rating': Decimal('4.84'),
                'review_count': 52,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Engineered air-mesh upper with high-rebound EVA responsive midsole.',
                'description': 'Experience cloud-like shock absorption during sprints and daily walks. Features breathable zoned mesh knit, anti-slip carbon rubber outsole pods, and orthotic arch support insole.',
                'thumbnail': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            },
            {
                'sku': 'SPS-FW-002',
                'slug': 'womens-minimalist-white-platform-casual-sneakers',
                'name': "Women's Minimalist White Platform Casual Sneakers",
                'category_slug': 'footwear',
                'brand': 'Apex Athletics',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1599.00'),
                'stock_quantity': 60,
                'rating': Decimal('4.72'),
                'review_count': 39,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'Clean classic white low-top platform sneakers in vegan leather.',
                'description': 'The modern wardrobe staple that pairs with everything from denim to dresses. Features a cushioned memory-foam footbed, durable vulcanized rubber platform, and breathable micro-perforations.',
                'thumbnail': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
            },

            # === HOME & KITCHEN ===
            {
                'sku': 'SPS-HK-001',
                'slug': 'barista-touch-espresso-coffee-maker-machine',
                'name': 'Barista Touch Espresso & Filter Coffee Maker Machine',
                'category_slug': 'home-kitchen',
                'brand': 'Culina Master',
                'price': Decimal('8999.00'),
                'discount_price': Decimal('5499.00'),
                'stock_quantity': 25,
                'rating': Decimal('4.90'),
                'review_count': 34,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': '15-Bar Italian high pressure pump with stainless steel milk steam frother wand.',
                'description': 'Brew cafe-quality lattes, cappuccinos, and rich crema espressos at home. Featuring Thermo-Block rapid heating system, dual-wall crema filters, removable 1.5L water tank, and cup warming plate.',
                'thumbnail': 'https://images.unsplash.com/photo-1517668808822-9ebd02f2a888?auto=format&fit=crop&w=800&q=80',
            },

            # === BEAUTY ===
            {
                'sku': 'SPS-BE-001',
                'slug': 'signature-artisanal-eau-de-parfum-luxury-fragrance',
                'name': 'Signature Artisanal Eau De Parfum Luxury Fragrance 100ml',
                'category_slug': 'beauty',
                'brand': 'GlowEssence Botanicals',
                'price': Decimal('2999.00'),
                'discount_price': Decimal('1499.00'),
                'stock_quantity': 45,
                'rating': Decimal('4.88'),
                'review_count': 47,
                'is_featured': True,
                'is_best_seller': True,
                'short_description': 'Sensual blend of Calabrian bergamot, Turkish rose, and rich Madagascar vanilla.',
                'description': 'A long-lasting artisanal perfume formulated with concentrated natural essential oils. Features top notes of bergamot and pink pepper, heart notes of rose and amber, settling into a warm sandalwood finish.',
                'thumbnail': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
            },

            # === SPORTS & FITNESS ===
            {
                'sku': 'SPS-SF-001',
                'slug': 'proflex-nonslip-dual-layer-eco-tpe-yoga-mat',
                'name': 'ProFlex Non-Slip Dual Layer Eco TPE Yoga Mat (6mm)',
                'category_slug': 'sports-fitness',
                'brand': 'Zenith Gear',
                'price': Decimal('1799.00'),
                'discount_price': Decimal('999.00'),
                'stock_quantity': 75,
                'rating': Decimal('4.78'),
                'review_count': 36,
                'is_featured': False,
                'is_best_seller': True,
                'short_description': 'High-density 6mm cushioned anti-tear yoga mat with laser-engraved alignment lines.',
                'description': 'Eco-friendly certified non-toxic TPE material with textured grip surface on both sides. Provides superior joint cushioning, sweat resistance, and includes a convenient free carrying strap.',
                'thumbnail': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
            },
        ]

        created_count = 0
        updated_count = 0

        for item in products_catalog:
            sku = item['sku']
            slug = item['slug']
            cat_slug = item['category_slug']
            category = cat_map.get(cat_slug) or Category.objects.filter(slug=cat_slug).first()
            if not category:
                category = Category.objects.first()

            # Unique lookup by SKU, with fallback to Slug
            product = Product.objects.filter(sku=sku).first() or Product.objects.filter(slug=slug).first()

            if product:
                if force_update:
                    product.name = item['name']
                    product.slug = slug
                    product.category = category
                    product.brand = item['brand']
                    product.price = item['price']
                    product.discount_price = item['discount_price']
                    product.stock_quantity = item['stock_quantity']
                    product.rating = item['rating']
                    product.review_count = item['review_count']
                    product.is_featured = item['is_featured']
                    product.is_best_seller = item['is_best_seller']
                    product.short_description = item['short_description']
                    product.description = item['description']
                    product.thumbnail = item['thumbnail']
                    product.is_active = True
                    product.save()
                    updated_count += 1
                else:
                    # Idempotent safe update: Ensure category, is_active, and thumbnail are valid
                    needs_save = False
                    if not product.thumbnail or str(product.thumbnail).strip() == '':
                        product.thumbnail = item['thumbnail']
                        needs_save = True
                    if not product.is_active:
                        product.is_active = True
                        needs_save = True
                    if product.category_id != category.id:
                        product.category = category
                        needs_save = True
                    if needs_save:
                        product.save()
                        updated_count += 1
            else:
                product = Product.objects.create(
                    seller=seller,
                    category=category,
                    sku=sku,
                    slug=slug,
                    name=item['name'],
                    brand=item['brand'],
                    price=item['price'],
                    discount_price=item['discount_price'],
                    stock_quantity=item['stock_quantity'],
                    rating=item['rating'],
                    review_count=item['review_count'],
                    is_featured=item['is_featured'],
                    is_best_seller=item['is_best_seller'],
                    short_description=item['short_description'],
                    description=item['description'],
                    thumbnail=item['thumbnail'],
                    is_active=True,
                )
                created_count += 1

                # Add sample variants for clothing & footwear
                if cat_slug in ['kids-wear', 'womens-wear', 'college-wear', 'party-wear', 'office-wear', 'footwear', 'dresses']:
                    for size in ['S', 'M', 'L', 'XL']:
                        ProductVariant.objects.get_or_create(
                            product=product,
                            variant_type=ProductVariant.VariantType.SIZE,
                            name=size,
                            defaults={
                                'sku': f"{sku}-{size}",
                                'stock_quantity': 15,
                                'is_default': (size == 'M'),
                            }
                        )

        return created_count, updated_count
