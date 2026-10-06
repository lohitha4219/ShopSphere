from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand

from apps.products.models import Product


# ---------------------------------------------------------
# Verified external product-image URLs
# ---------------------------------------------------------
# These are used only when the current product image URL
# is broken/unreachable.
#
# The URLs point directly to images.unsplash.com.
# ---------------------------------------------------------

IMAGE_POOL = [
    {
        "keywords": [
            "laptop",
            "computer",
            "electronics",
            "phone",
            "mobile",
            "tablet",
            "keyboard",
            "monitor",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1661961110372-8a7682543120"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "shirt",
            "tshirt",
            "t-shirt",
            "men",
            "women",
            "fashion",
            "dress",
            "clothing",
            "wear",
            "jeans",
            "hoodie",
            "top",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1564316800929-be17a69d6966"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "shoe",
            "shoes",
            "footwear",
            "sneaker",
            "sneakers",
            "running",
            "sports",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1664754978480-82ac6ab992c1"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "watch",
            "wristwatch",
            "accessory",
            "accessories",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1777569938639-c00bfdef07fd"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "beauty",
            "makeup",
            "cosmetic",
            "cosmetics",
            "lipstick",
            "skincare",
            "skin",
            "personal care",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1718972771654-47be8f36e0fd"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "yoga",
            "fitness",
            "gym",
            "mat",
            "sports",
            "exercise",
            "workout",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1601925260368-ae2f83cf8b7f"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "home",
            "living",
            "furniture",
            "sofa",
            "chair",
            "decor",
            "decoration",
            "interior",
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1718972771654-47be8f36e0fd"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
]


# ---------------------------------------------------------
# Default fallback
# ---------------------------------------------------------

DEFAULT_IMAGE = (
    "https://images.unsplash.com/"
    "photo-1564316800929-be17a69d6966"
    "?auto=format&fit=crop&w=800&q=80"
)


class Command(BaseCommand):

    help = (
        "Checks all product image URLs and automatically "
        "replaces broken product images with valid URLs."
    )

    # -----------------------------------------------------
    # Check whether an image URL is reachable
    # -----------------------------------------------------

    def is_url_valid(self, url):
        if not url:
            return False

        url = str(url).strip()

        if not (
            url.startswith("http://")
            or url.startswith("https://")
        ):
            return False

        try:
            request = Request(
                url,
                method="HEAD",
                headers={
                    "User-Agent": "ShopSphere-ImageChecker/1.0"
                },
            )

            with urlopen(request, timeout=10) as response:
                status = response.status

                if 200 <= status < 400:
                    return True

        except HTTPError as error:

            # Some CDNs do not allow HEAD.
            # Try a small GET request instead.
            if error.code in [403, 405, 429]:
                try:
                    request = Request(
                        url,
                        method="GET",
                        headers={
                            "User-Agent": "ShopSphere-ImageChecker/1.0",
                            "Range": "bytes=0-1024",
                        },
                    )

                    with urlopen(request, timeout=10) as response:
                        return 200 <= response.status < 400

                except Exception:
                    return False

            return False

        except (URLError, TimeoutError, Exception):
            return False

        return False

    # -----------------------------------------------------
    # Find the best replacement based on product information
    # -----------------------------------------------------

    def get_replacement_image(self, product):

        text_parts = [
            str(getattr(product, "name", "") or ""),
            str(getattr(product, "brand", "") or ""),
            str(getattr(product, "category_name", "") or ""),
        ]

        # Category object support
        category = getattr(product, "category", None)

        if category:
            text_parts.append(
                str(getattr(category, "name", "") or "")
            )

        text = " ".join(text_parts).lower()

        # Try category/product-specific match
        for item in IMAGE_POOL:

            for keyword in item["keywords"]:

                if keyword.lower() in text:
                    return item["url"]

        # Otherwise use general fashion/product image
        return DEFAULT_IMAGE

    # -----------------------------------------------------
    # Check one product
    # -----------------------------------------------------

    def inspect_product(self, product):

        thumbnail = getattr(product, "thumbnail", None)
        primary_image = getattr(product, "primary_image", None)

        thumbnail = str(thumbnail or "").strip()
        primary_image = str(primary_image or "").strip()

        thumbnail_valid = self.is_url_valid(thumbnail)
        primary_valid = self.is_url_valid(primary_image)

        return {
            "product": product,
            "thumbnail": thumbnail,
            "primary_image": primary_image,
            "thumbnail_valid": thumbnail_valid,
            "primary_valid": primary_valid,
        }

    # -----------------------------------------------------
    # Main command
    # -----------------------------------------------------

    def handle(self, *args, **options):

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                " ShopSphere Product Image Repair"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )
        self.stdout.write("")

        products = list(
            Product.objects.all().order_by("-id")
        )

        total = len(products)

        self.stdout.write(
            f"Found {total} products."
        )

        if total == 0:
            self.stdout.write(
                self.style.WARNING(
                    "No products found."
                )
            )
            return

        self.stdout.write(
            "Checking product image URLs..."
        )
        self.stdout.write("")

        results = []

        # -------------------------------------------------
        # Check URLs concurrently so 75 products don't
        # take several minutes.
        # -------------------------------------------------

        with ThreadPoolExecutor(max_workers=10) as executor:

            futures = [
                executor.submit(
                    self.inspect_product,
                    product
                )
                for product in products
            ]

            for future in as_completed(futures):

                try:
                    result = future.result()
                    results.append(result)

                except Exception as error:

                    self.stdout.write(
                        self.style.ERROR(
                            f"Image check error: {error}"
                        )
                    )

        # Keep output ordered by product ID
        results.sort(
            key=lambda item: item["product"].id,
            reverse=True,
        )

        fixed_count = 0
        valid_count = 0

        # -------------------------------------------------
        # Repair broken images
        # -------------------------------------------------

        for result in results:

            product = result["product"]

            thumbnail = result["thumbnail"]
            primary_image = result["primary_image"]

            thumbnail_valid = result["thumbnail_valid"]
            primary_valid = result["primary_valid"]

            # ---------------------------------------------
            # Case 1:
            # Both images are valid
            # ---------------------------------------------

            if thumbnail_valid and primary_valid:

                valid_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"[OK] #{product.id} - "
                        f"{product.name}"
                    )
                )

                continue

            # ---------------------------------------------
            # Case 2:
            # Thumbnail is broken but primary_image works
            # ---------------------------------------------

            if not thumbnail_valid and primary_valid:

                product.thumbnail = primary_image
                product.save(
                    update_fields=["thumbnail"]
                )

                fixed_count += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"[FIXED] #{product.id} - "
                        f"thumbnail -> primary_image"
                    )
                )

                continue

            # ---------------------------------------------
            # Case 3:
            # Thumbnail works but primary_image broken
            # ---------------------------------------------

            if thumbnail_valid and not primary_valid:

                product.primary_image = thumbnail
                product.save(
                    update_fields=["primary_image"]
                )

                fixed_count += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"[FIXED] #{product.id} - "
                        f"primary_image -> thumbnail"
                    )
                )

                continue

            # ---------------------------------------------
            # Case 4:
            # Both images are broken/missing
            # ---------------------------------------------

            replacement = self.get_replacement_image(
                product
            )

            product.thumbnail = replacement
            product.primary_image = replacement

            product.save(
                update_fields=[
                    "thumbnail",
                    "primary_image",
                ]
            )

            fixed_count += 1

            self.stdout.write(
                self.style.WARNING(
                    f"[REPLACED] #{product.id} - "
                    f"{product.name}"
                )
            )

            self.stdout.write(
                f"    New image: {replacement}"
            )

        # -------------------------------------------------
        # Final summary
        # -------------------------------------------------

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                " Image Repair Completed"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )

        self.stdout.write(
            f"Total products : {total}"
        )

        self.stdout.write(
            f"Already valid  : {valid_count}"
        )

        self.stdout.write(
            f"Fixed/replaced : {fixed_count}"
        )

        self.stdout.write("")

        remaining = 0

        # -------------------------------------------------
        # Final verification
        # -------------------------------------------------

        self.stdout.write(
            "Running final verification..."
        )

        for product in Product.objects.all():

            thumbnail = str(
                getattr(product, "thumbnail", "") or ""
            ).strip()

            primary_image = str(
                getattr(product, "primary_image", "") or ""
            ).strip()

            if not thumbnail or not primary_image:
                remaining += 1

        if remaining == 0:

            self.stdout.write(
                self.style.SUCCESS(
                    "All products have image URLs."
                )
            )

        else:

            self.stdout.write(
                self.style.WARNING(
                    f"{remaining} products still have "
                    "missing image fields."
                )
            )

        self.stdout.write("")