import os
import urllib.request
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_IMAGES = os.path.join(BASE_DIR, 'frontend', 'public', 'images')
MEDIA_DIR = os.path.join(BASE_DIR, 'backend', 'media')

PRODUCTS_DIR = os.path.join(FRONTEND_IMAGES, 'products')
CATEGORIES_DIR = os.path.join(FRONTEND_IMAGES, 'categories')
BANNERS_DIR = os.path.join(FRONTEND_IMAGES, 'banners')
PLACEHOLDERS_DIR = os.path.join(FRONTEND_IMAGES, 'placeholders')

for d in [PRODUCTS_DIR, CATEGORIES_DIR, BANNERS_DIR, PLACEHOLDERS_DIR,
          os.path.join(MEDIA_DIR, 'products', 'thumbnails'),
          os.path.join(MEDIA_DIR, 'products', 'gallery'),
          os.path.join(MEDIA_DIR, 'categories')]:
    os.makedirs(d, exist_ok=True)

# Curated, royalty-free, high-quality Unsplash image URLs (optimized with w=800&auto=format&fit=crop&q=80)
IMAGES_DATA = {
    # ------------------ CATEGORIES ------------------
    'categories/fashion.jpg': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    'categories/electronics.jpg': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    'categories/mobiles.jpg': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    'categories/laptops.jpg': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    'categories/footwear.jpg': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'categories/home-kitchen.jpg': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    'categories/grocery.jpg': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    'categories/beauty.jpg': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    'categories/sports.jpg': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    'categories/toys.jpg': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
    'categories/appliances.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80',
    'categories/furniture.jpg': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',

    # ------------------ BANNERS ------------------
    'banners/electronics-banner.jpg': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=85',
    'banners/fashion-banner.jpg': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=85',
    'banners/home-banner.jpg': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=85',

    # ------------------ PRODUCTS: ELECTRONICS ------------------
    'products/wireless-bluetooth-headphones.jpg': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'products/wireless-bluetooth-headphones-2.jpg': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
    'products/wireless-bluetooth-headphones-3.jpg': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',

    'products/gaming-laptop.jpg': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    'products/gaming-laptop-2.jpg': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    'products/gaming-laptop-3.jpg': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',

    'products/smartphone.jpg': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    'products/smartphone-2.jpg': 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
    'products/smartphone-3.jpg': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',

    'products/smart-watch.jpg': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    'products/smart-watch-2.jpg': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    'products/smart-watch-3.jpg': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',

    'products/bluetooth-speaker.jpg': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    'products/bluetooth-speaker-2.jpg': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',

    'products/wireless-mouse.jpg': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    'products/wireless-mouse-2.jpg': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',

    'products/mechanical-keyboard.jpg': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    'products/mechanical-keyboard-2.jpg': 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format&fit=crop&q=80',

    'products/tablet.jpg': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
    'products/power-bank.jpg': 'https://images.unsplash.com/photo-1609592426507-28562d645e41?w=800&auto=format&fit=crop&q=80',
    'products/usb-c-charger.jpg': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: FASHION ------------------
    'products/mens-casual-shirt.jpg': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    'products/mens-casual-shirt-2.jpg': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',

    'products/mens-running-shoes.jpg': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    'products/mens-running-shoes-2.jpg': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    'products/mens-running-shoes-3.jpg': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',

    'products/womens-kurti.jpg': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    'products/womens-kurti-2.jpg': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',

    'products/womens-saree.jpg': 'https://images.unsplash.com/photo-1610030469668-965561a33758?w=800&auto=format&fit=crop&q=80',
    'products/womens-saree-2.jpg': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',

    'products/womens-handbag.jpg': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    'products/womens-handbag-2.jpg': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',

    'products/mens-jeans.jpg': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    'products/kids-tshirt.jpg': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
    'products/womens-sneakers.jpg': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: HOME & KITCHEN ------------------
    'products/coffee-maker.jpg': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    'products/coffee-maker-2.jpg': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',

    'products/electric-kettle.jpg': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
    'products/cookware-set.jpg': 'https://images.unsplash.com/photo-1584990347449-3a3f5a703a8f?w=800&auto=format&fit=crop&q=80',
    'products/mixer-grinder.jpg': 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    'products/water-bottle.jpg': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    'products/table-lamp.jpg': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    'products/bedsheet-set.jpg': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: BEAUTY ------------------
    'products/face-wash.jpg': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    'products/moisturizer.jpg': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
    'products/shampoo.jpg': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80',
    'products/lipstick.jpg': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    'products/sunscreen.jpg': 'https://images.unsplash.com/photo-1567928815104-e39537d92131?w=800&auto=format&fit=crop&q=80',
    'products/perfume.jpg': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: SPORTS ------------------
    'products/cricket-bat.jpg': 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=800&auto=format&fit=crop&q=80',
    'products/football.jpg': 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&auto=format&fit=crop&q=80',
    'products/badminton-racket.jpg': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    'products/yoga-mat.jpg': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: GROCERY ------------------
    'products/basmati-rice.jpg': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'products/cooking-oil.jpg': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    'products/green-tea.jpg': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    'products/dry-fruits.jpg': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',

    # ------------------ PRODUCTS: TOYS ------------------
    'products/rc-car.jpg': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80',
    'products/building-blocks.jpg': 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&auto=format&fit=crop&q=80',
    'products/teddy-bear.jpg': 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&auto=format&fit=crop&q=80',
    'products/board-game.jpg': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80',
}

def download_all():
    print(f"Downloading {len(IMAGES_DATA)} realistic royalty-free assets...")
    success = 0
    for rel_path, url in IMAGES_DATA.items():
        dest = os.path.join(FRONTEND_IMAGES, rel_path)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"Already exists: {rel_path}")
            success += 1
            continue

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                with open(dest, 'wb') as f:
                    f.write(data)
                print(f"[OK] Downloaded {rel_path} ({len(data)} bytes)")
                success += 1
                time.sleep(0.15)
        except Exception as e:
            print(f"[ERROR] Failed {rel_path}: {e}")

    print(f"Finished! Successfully downloaded {success}/{len(IMAGES_DATA)} images.")

if __name__ == '__main__':
    download_all()
