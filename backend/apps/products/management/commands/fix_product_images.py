from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand

from apps.products.models import Product


# Valid fallback image URLs
IMAGE_POOL = [
    {
        "keywords": [
            "laptop", "computer", "electronics", "phone",
            "mobile", "tablet", "keyboard", "monitor"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1661961110372-8a7682543120"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "shirt", "tshirt", "t-shirt", "men", "women",
            "fashion", "dress", "clothing", "wear",
            "jeans", "hoodie", "top"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1564316800929-be17a69d6966"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "shoe", "shoes", "footwear",
            "sneaker", "sneakers", "running", "sports"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1664754978480-82ac6ab992c1"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "watch", "wristwatch",
            "accessory", "accessories"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1777569938639-c00bfdef07fd"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "beauty", "makeup", "cosmetic",
            "cosmetics", "lipstick", "skincare",
            "skin", "personal care"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1718972771654-47be8f36e0fd"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "yoga", "fitness", "gym", "mat",
            "exercise", "workout"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1601925260368-ae2f83cf8b7f"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
    {
        "keywords": [
            "home", "living", "furniture",
            "sofa", "chair", "decor",
            "decoration", "interior"
        ],
        "url": (
            "https://images.unsplash.com/"
            "photo-1618221195710-dd6b41faaea6"
            "?auto=format&fit=crop&w=800&q=80"
        ),
    },
]


DEFAULT_IMAGE = (
    "https://images.unsplash.com/"
    "photo-1564316800929-be17a69d6966"
    "?auto=format&fit=crop&w=800&q=80"
)


class Command(BaseCommand):

    help = (
        "Checks product thumbnail URLs and replaces "
        "broken images with valid URLs."
    )

    def is_url_valid(self, url):
        """Check whether an external image URL works."""

        if not url:
            return False

        url = str(url).strip()

        if not (
            url.startswith("http://")
            or url.startswith("https://")
        ):
            return False

        # First try HEAD
        try:
            request = Request(
                url,
                method="HEAD",
                headers={
                    "User-Agent": "ShopSphere-ImageChecker/1.0"
                },
            )

            with urlopen(request, timeout=8) as response:
                if 200 <= response.status < 400:
                    return True

        except HTTPError as error:

            # Some image servers reject HEAD.
            if error.code in [403, 405, 429]:
                pass
            else:
                return False

        except (URLError, TimeoutError, OSError):
            return False

        # Fallback: small GET request
        try:
            request = Request(
                url,
                method="GET",
                headers={
                    "User-Agent": "ShopSphere-ImageChecker/1.0",
                    "Range": "bytes=0-1024",
                },
            )

            with urlopen(request, timeout=8) as response:
                return 200 <= response.status < 400

        except Exception:
            return False

    def get_replacement_image(self, product):
        """Choose a replacement based on product/category text."""

        text_parts = [
            str(getattr(product, "name", "") or ""),
            str(getattr(product, "brand", "") or ""),
        ]

        category = getattr(product, "category", None)

        if category:
            text_parts.append(
                str(getattr(category, "name", "") or "")
            )

        text = " ".join(text_parts).lower()

        for item in IMAGE_POOL:

            for keyword in item["keywords"]:

                if keyword.lower() in text:
                    return item["url"]

        return DEFAULT_IMAGE

    def inspect_product(self, product):
        """
        Inspect the actual Product model field.

        Your Product model does NOT contain primary_image.
        The actual database field is thumbnail.
        """

        thumbnail = str(
            getattr(product, "thumbnail", "") or ""
        ).strip()

        thumbnail_valid = self.is_url_valid(thumbnail)

        return {
            "product": product,
            "thumbnail": thumbnail,
            "thumbnail_valid": thumbnail_valid,
        }

    def handle(self, *args, **options):

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                " ShopSphere Product Image Repair"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
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
            "Checking product thumbnail URLs..."
        )
        self.stdout.write("")

        results = []

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
                    results.append(
                        future.result()
                    )

                except Exception as error:

                    self.stdout.write(
                        self.style.ERROR(
                            f"Check error: {error}"
                        )
                    )

        results.sort(
            key=lambda item: item["product"].id,
            reverse=True,
        )

        fixed_count = 0
        valid_count = 0

        for result in results:

            product = result["product"]

            thumbnail = result["thumbnail"]
            thumbnail_valid = result["thumbnail_valid"]

            # ------------------------------------------
            # Image already works
            # ------------------------------------------

            if thumbnail_valid:

                valid_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"[OK] #{product.id} - "
                        f"{product.name}"
                    )
                )

                continue

            # ------------------------------------------
            # Image is broken
            # ------------------------------------------

            replacement = self.get_replacement_image(
                product
            )

            product.thumbnail = replacement

            product.save(
                update_fields=["thumbnail"]
            )

            fixed_count += 1

            self.stdout.write(
                self.style.WARNING(
                    f"[FIXED] #{product.id} - "
                    f"{product.name}"
                )
            )

            self.stdout.write(
                f"    New image: {replacement}"
            )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                " Image Repair Completed"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "=========================================="
            )
        )

        self.stdout.write(
            f"Total products : {total}"
        )

        self.stdout.write(
            f"Already valid  : {valid_count}"
        )

        self.stdout.write(
            f"Fixed           : {fixed_count}"
        )

        self.stdout.write("")

        remaining = Product.objects.filter(
            thumbnail__isnull=True
        ).count()

        empty_count = Product.objects.filter(
            thumbnail=""
        ).count()

        remaining += empty_count

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
                    "missing thumbnail values."
                )
            )

        self.stdout.write("")