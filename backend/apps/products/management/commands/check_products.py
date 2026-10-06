from django.core.management.base import BaseCommand
from apps.products.models import Product

class Command(BaseCommand):
    def handle(self, *args, **options):
        count = Product.objects.count()
        self.stdout.write(f"RAILWAY PRODUCT COUNT: {count}")
