import os
import sqlite3
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from django.db import transaction

from apps.accounts.models import User
from apps.sellers.models import SellerProfile
from apps.categories.models import Category
from apps.products.models import Product, ProductImage, ProductVariant
from apps.reviews.models import Review
from apps.coupons.models import Coupon


class Command(BaseCommand):
    help = 'Safely transfers product catalog, categories, sellers, and related data from SQLite to MySQL without duplicates.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sqlite-path',
            type=str,
            default=os.path.join(settings.BASE_DIR, 'db.sqlite3'),
            help='Path to source SQLite database file'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate migration without committing changes'
        )

    def handle(self, *args, **options):
        sqlite_path = options['sqlite_path']
        dry_run = options['dry_run']

        self.stdout.write(self.style.MIGRATE_HEADING("=== SHOPSPHERE SQLITE TO MYSQL DATA MIGRATION ==="))
        self.stdout.write(f"Source SQLite DB: {sqlite_path}")
        self.stdout.write(f"Target DB Engine: {settings.DATABASES['default']['ENGINE']}")
        self.stdout.write(f"Target DB Name:   {settings.DATABASES['default']['NAME']}")

        if not os.path.exists(sqlite_path):
            self.stderr.write(self.style.ERROR(f"SQLite file not found at: {sqlite_path}"))
            return

        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Step 1: Pre-migration count comparison
        sqlite_product_count = cur.execute("SELECT count(*) FROM products_product").fetchone()[0]
        mysql_product_count = Product.objects.count()
        sqlite_category_count = cur.execute("SELECT count(*) FROM categories_category").fetchone()[0]
        mysql_category_count = Category.objects.count()

        self.stdout.write(self.style.WARNING("\n[PRE-MIGRATION COUNTS]"))
        self.stdout.write(f"  Products in SQLite: {sqlite_product_count} | Products in MySQL: {mysql_product_count}")
        self.stdout.write(f"  Categories in SQLite: {sqlite_category_count} | Categories in MySQL: {mysql_category_count}")

        if dry_run:
            self.stdout.write(self.style.NOTICE("Running in DRY-RUN mode. No changes will be saved."))

        with transaction.atomic():
            # Step 2: Migrate / Map Users
            self.stdout.write("\n1. Migrating Users (preserving accounts and hashes)...")
            user_map = {}  # sqlite_user_id -> mysql_User_instance
            sqlite_users = cur.execute("SELECT * FROM accounts_user").fetchall()

            for u_row in sqlite_users:
                # Check if user already exists by email or username
                existing_user = User.objects.filter(email__iexact=u_row['email']).first()
                if not existing_user and u_row['username']:
                    existing_user = User.objects.filter(username__iexact=u_row['username']).first()

                if existing_user:
                    user_map[u_row['id']] = existing_user
                else:
                    new_user = User(
                        username=u_row['username'],
                        email=u_row['email'],
                        phone=u_row['phone'] or '',
                        first_name=u_row['first_name'] or '',
                        last_name=u_row['last_name'] or '',
                        role=u_row['role'] or User.Role.CUSTOMER,
                        is_staff=bool(u_row['is_staff']),
                        is_superuser=bool(u_row['is_superuser']),
                        is_active=bool(u_row['is_active']),
                    )
                    # Directly assign existing password hash
                    new_user.password = u_row['password']
                    new_user.save()
                    user_map[u_row['id']] = new_user
                    self.stdout.write(f"  + User created: {new_user.email} (Role: {new_user.role})")

            # Step 3: Migrate / Map Sellers
            self.stdout.write("\n2. Migrating Seller Profiles...")
            seller_map = {}  # sqlite_seller_id -> mysql_SellerProfile_instance
            sqlite_sellers = cur.execute("SELECT * FROM sellers_sellerprofile").fetchall()

            for s_row in sqlite_sellers:
                sqlite_uid = s_row['user_id']
                mapped_user = user_map.get(sqlite_uid)
                if not mapped_user:
                    continue

                existing_seller = SellerProfile.objects.filter(user=mapped_user).first()
                if not existing_seller and s_row['email']:
                    existing_seller = SellerProfile.objects.filter(email__iexact=s_row['email']).first()

                if existing_seller:
                    seller_map[s_row['id']] = existing_seller
                else:
                    new_seller = SellerProfile(
                        user=mapped_user,
                        business_name=s_row['business_name'],
                        owner_name=s_row['owner_name'],
                        email=s_row['email'],
                        phone=s_row['phone'],
                        business_address=s_row['business_address'] or '',
                        gst_number=s_row['gst_number'] or '',
                        pan_number=s_row['pan_number'] or '',
                        bank_name=s_row['bank_name'] or '',
                        bank_account_number=s_row['bank_account_number'] or '',
                        bank_ifsc=s_row['bank_ifsc'] or '',
                        status=s_row['status'] or SellerProfile.Status.APPROVED,
                        commission_rate=s_row['commission_rate'] or 5,
                    )
                    new_seller.save()
                    seller_map[s_row['id']] = new_seller
                    self.stdout.write(f"  + Seller created: {new_seller.business_name}")

            # Ensure at least one default seller exists if none mapped
            default_seller = SellerProfile.objects.first()
            if not default_seller:
                first_admin = User.objects.filter(role=User.Role.ADMIN).first() or User.objects.first()
                default_seller = SellerProfile.objects.create(
                    user=first_admin,
                    business_name='ShopSphere Official Store',
                    owner_name=first_admin.full_name or 'ShopSphere Store',
                    email=first_admin.email,
                    phone=first_admin.phone or '+91 9800000000',
                    business_address='ShopSphere Headquarters',
                    status=SellerProfile.Status.APPROVED
                )

            # Step 4: Migrate Categories (Two Passes: Top-Level, then Subcategories)
            self.stdout.write("\n3. Migrating Categories & Taxonomy...")
            cat_map = {}  # sqlite_cat_id -> mysql_Category_instance

            # Pass A: Top-level categories (parent_id IS NULL)
            top_cats = cur.execute("SELECT * FROM categories_category WHERE parent_id IS NULL ORDER BY id").fetchall()
            for c_row in top_cats:
                slug_val = c_row['slug'] or slugify(c_row['name'])
                cat_obj, created = Category.objects.get_or_create(
                    slug=slug_val,
                    defaults={
                        'name': c_row['name'],
                        'description': c_row['description'] or '',
                        'image': c_row['image'] or None,
                        'is_active': bool(c_row['is_active']),
                        'order': c_row['order'] or 0,
                    }
                )
                cat_map[c_row['id']] = cat_obj
                if created:
                    self.stdout.write(f"  + Top Category created: {cat_obj.name} ({cat_obj.slug})")

            # Pass B: Subcategories (parent_id IS NOT NULL)
            sub_cats = cur.execute("SELECT * FROM categories_category WHERE parent_id IS NOT NULL ORDER BY id").fetchall()
            for c_row in sub_cats:
                slug_val = c_row['slug'] or slugify(c_row['name'])
                parent_obj = cat_map.get(c_row['parent_id'])
                cat_obj, created = Category.objects.get_or_create(
                    slug=slug_val,
                    defaults={
                        'name': c_row['name'],
                        'description': c_row['description'] or '',
                        'image': c_row['image'] or None,
                        'parent': parent_obj,
                        'is_active': bool(c_row['is_active']),
                        'order': c_row['order'] or 0,
                    }
                )
                if not created and parent_obj and not cat_obj.parent:
                    cat_obj.parent = parent_obj
                    cat_obj.save()
                cat_map[c_row['id']] = cat_obj
                if created:
                    self.stdout.write(f"  + Subcategory created: {cat_obj.name} ({cat_obj.slug}) -> parent: {parent_obj.name if parent_obj else 'None'}")

            # Step 5: Ensure required Task 5 categories & aliases exist
            self.stdout.write("\n4. Ensuring all 13 Task 5 required categories/aliases exist...")
            fashion_cat = Category.objects.filter(slug='fashion').first() or Category.objects.filter(name__icontains='fashion').first()

            required_categories = [
                # (name, slug, parent)
                ("Men's Wear", "mens-wear", fashion_cat),
                ("Women's Wear", "womens-wear", fashion_cat),
                ("Kids Wear", "kids-wear", fashion_cat),
                ("Sarees", "sarees", fashion_cat),
                ("Dresses", "dresses", fashion_cat),
                ("College Wear", "college-wear", fashion_cat),
                ("Party Wear", "party-wear", fashion_cat),
                ("Office Wear", "office-wear", fashion_cat),
                ("Footwear", "footwear", None),
                ("Accessories", "accessories", None),
                ("Electronics", "electronics", None),
                ("Beauty", "beauty", None),
                ("Home & Living", "home-living", None),
            ]

            for name, slug, parent in required_categories:
                cat, created = Category.objects.get_or_create(
                    slug=slug,
                    defaults={
                        'name': name,
                        'parent': parent,
                        'is_active': True,
                    }
                )
                if created:
                    self.stdout.write(f"  + Task 5 category added: {cat.name} ({cat.slug})")

            # Step 6: Migrate Products
            self.stdout.write("\n5. Migrating Products (checking SKUs to prevent duplicates)...")
            prod_map = {}  # sqlite_prod_id -> mysql_Product_instance
            sqlite_prods = cur.execute("SELECT * FROM products_product ORDER BY id").fetchall()

            migrated_count = 0
            skipped_count = 0

            for p_row in sqlite_prods:
                sku_val = p_row['sku']
                existing_prod = Product.objects.filter(sku=sku_val).first()

                if existing_prod:
                    prod_map[p_row['id']] = existing_prod
                    skipped_count += 1
                    continue

                mapped_seller = seller_map.get(p_row['seller_id'], default_seller)
                mapped_cat = cat_map.get(p_row['category_id'])
                mapped_subcat = cat_map.get(p_row['subcategory_id'])

                if not mapped_cat and mapped_subcat:
                    mapped_cat = mapped_subcat.parent or mapped_subcat

                if not mapped_cat:
                    mapped_cat = Category.objects.first()

                new_prod = Product(
                    seller=mapped_seller,
                    category=mapped_cat,
                    subcategory=mapped_subcat,
                    name=p_row['name'],
                    slug=p_row['slug'] or slugify(p_row['name']),
                    description=p_row['description'] or '',
                    short_description=p_row['short_description'] or '',
                    brand=p_row['brand'] or '',
                    sku=sku_val,
                    price=Decimal(str(p_row['price'])),
                    discount_price=Decimal(str(p_row['discount_price'])) if p_row['discount_price'] is not None else None,
                    discount_percentage=p_row['discount_percentage'] or 0,
                    stock_quantity=p_row['stock_quantity'] or 0,
                    minimum_order_quantity=p_row['minimum_order_quantity'] or 1,
                    rating=Decimal(str(p_row['rating'] or '0.00')),
                    review_count=p_row['review_count'] or 0,
                    thumbnail=p_row['thumbnail'] or '',
                    is_active=bool(p_row['is_active']),
                    is_featured=bool(p_row['is_featured']),
                    is_best_seller=bool(p_row['is_best_seller']),
                )

                new_prod.save()

                prod_map[p_row['id']] = new_prod
                migrated_count += 1
                self.stdout.write(f"  + Product migrated: #{p_row['id']} '{new_prod.name}' (SKU: {new_prod.sku}, Price: {new_prod.price})")

            # Step 7: Migrate Product Images
            self.stdout.write("\n6. Migrating Product Gallery Images...")
            sqlite_images = cur.execute("SELECT * FROM products_productimage ORDER BY id").fetchall()
            img_created = 0
            for img_row in sqlite_images:
                mapped_p = prod_map.get(img_row['product_id'])
                if not mapped_p:
                    continue

                existing_img = ProductImage.objects.filter(product=mapped_p, image=img_row['image']).first()
                if not existing_img:
                    ProductImage.objects.create(
                        product=mapped_p,
                        image=img_row['image'],
                        alt_text=img_row['alt_text'] or '',
                        is_primary=bool(img_row['is_primary']),
                        order=img_row['order'] or 0
                    )
                    img_created += 1

            self.stdout.write(f"  Images migrated: {img_created}")

            # Step 8: Migrate Product Variants
            self.stdout.write("\n7. Migrating Product Variants...")
            sqlite_variants = cur.execute("SELECT * FROM products_productvariant ORDER BY id").fetchall()
            var_created = 0
            for var_row in sqlite_variants:
                mapped_p = prod_map.get(var_row['product_id'])
                if not mapped_p:
                    continue

                existing_var = ProductVariant.objects.filter(product=mapped_p, sku=var_row['sku']).first()
                if not existing_var:
                    ProductVariant.objects.create(
                        product=mapped_p,
                        variant_type=var_row['variant_type'],
                        name=var_row['name'],
                        sku=var_row['sku'],
                        price_adjustment=Decimal(str(var_row['price_adjustment'] or '0.00')),
                        stock_quantity=var_row['stock_quantity'] or 0,
                        is_default=bool(var_row['is_default'])
                    )
                    var_created += 1

            self.stdout.write(f"  Variants migrated: {var_created}")

            # Step 9: Migrate Reviews & Coupons
            self.stdout.write("\n8. Migrating Reviews & Coupons...")
            sqlite_reviews = cur.execute("SELECT * FROM reviews_review ORDER BY id").fetchall()
            rev_created = 0
            for rev_row in sqlite_reviews:
                mapped_p = prod_map.get(rev_row['product_id'])
                mapped_u = user_map.get(rev_row['user_id'])
                if not mapped_p or not mapped_u:
                    continue

                if not Review.objects.filter(product=mapped_p, user=mapped_u).exists():
                    Review.objects.create(
                        product=mapped_p,
                        user=mapped_u,
                        rating=rev_row['rating'] or 5,
                        title=rev_row['title'] or '',
                        comment=rev_row['comment'] or '',
                        helpful_count=rev_row['helpful_count'] or 0,
                        is_approved=bool(rev_row['is_approved'])
                    )
                    rev_created += 1
            self.stdout.write(f"  Reviews migrated: {rev_created}")

            sqlite_coupons = cur.execute("SELECT * FROM coupons_coupon ORDER BY id").fetchall()
            cpn_created = 0
            for cpn_row in sqlite_coupons:
                if not Coupon.objects.filter(code__iexact=cpn_row['code']).exists():
                    Coupon.objects.create(
                        code=cpn_row['code'],
                        description=cpn_row['description'] or '',
                        discount_type=cpn_row['discount_type'],
                        discount_value=Decimal(str(cpn_row['discount_value'])),
                        minimum_order_amount=Decimal(str(cpn_row['minimum_order_amount'] or '0.00')),
                        maximum_discount=Decimal(str(cpn_row['maximum_discount'])) if cpn_row['maximum_discount'] else None,
                        usage_limit=cpn_row['usage_limit'] or 100,
                        times_used=cpn_row['times_used'] or 0,
                        per_user_limit=cpn_row['per_user_limit'] or 1,
                        start_date=cpn_row['start_date'],
                        expiry_date=cpn_row['expiry_date'],
                        is_active=bool(cpn_row['is_active'])
                    )
                    cpn_created += 1
            self.stdout.write(f"  Coupons migrated: {cpn_created}")

            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(self.style.WARNING("\n[DRY RUN COMPLETE] Rolled back all changes."))

        conn.close()

        # Final Verification
        final_mysql_prods = Product.objects.count()
        final_mysql_cats = Category.objects.count()

        self.stdout.write(self.style.SUCCESS("\n=== MIGRATION SUMMARY ==="))
        self.stdout.write(f"Products in SQLite:  {sqlite_product_count}")
        self.stdout.write(f"Products in MySQL:   {final_mysql_prods}")
        self.stdout.write(f"Categories in MySQL: {final_mysql_cats}")
        self.stdout.write(f"New Products Added:  {migrated_count}")
        self.stdout.write(f"Products Skipped:    {skipped_count}")
        self.stdout.write(self.style.SUCCESS("MIGRATION COMPLETED SUCCESSFULLY!"))
