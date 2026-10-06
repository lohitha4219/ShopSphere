from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = "Fix Fashion product image URLs"

    def handle(self, *args, **options):

        images = {
            17: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
            16: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
            15: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
            14: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
            13: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
            11: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        }

        for product_id, image_url in images.items():
            updated = Product.objects.filter(
                id=product_id
            ).update(
                thumbnail=image_url
            )

            if updated:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated product {product_id}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Fashion product images updated."
            )
        )