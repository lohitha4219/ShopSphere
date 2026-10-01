import os
import shutil
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_IMAGES = os.path.join(BASE_DIR, 'frontend', 'public', 'images')
MEDIA_DIR = os.path.join(BASE_DIR, 'backend', 'media')

FIX_URLS = {
    'categories/sports.jpg': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
    'products/power-bank.jpg': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
    'products/womens-saree.jpg': 'https://images.unsplash.com/photo-1610030469668-965561a33758?w=800&auto=format&fit=crop&q=80',
    'products/cookware-set.jpg': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80',
    'products/sunscreen.jpg': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    'products/cricket-bat.jpg': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
}

for rel_path, url in FIX_URLS.items():
    dest = os.path.join(FRONTEND_IMAGES, rel_path)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            with open(dest, 'wb') as f:
                f.write(data)
            print(f"[OK] Downloaded {rel_path} ({len(data)} bytes)")
    except Exception as e:
        print(f"[WARN] URL failed for {rel_path}: {e}")
        # If still failing, copy from relevant peer
        if 'womens-saree' in rel_path:
            peer = os.path.join(FRONTEND_IMAGES, 'products', 'womens-saree-2.jpg')
            if os.path.exists(peer):
                shutil.copy(peer, dest)
                print(f"[FALLBACK] Copied from saree-2 for {rel_path}")

# If cricket-bat or power-bank still need local fallback, copy appropriate peer
if not os.path.exists(os.path.join(FRONTEND_IMAGES, 'products', 'cricket-bat.jpg')) or os.path.getsize(os.path.join(FRONTEND_IMAGES, 'products', 'cricket-bat.jpg')) < 500:
    peer = os.path.join(FRONTEND_IMAGES, 'products', 'badminton-racket.jpg')
    if os.path.exists(peer):
        shutil.copy(peer, os.path.join(FRONTEND_IMAGES, 'products', 'cricket-bat.jpg'))

if not os.path.exists(os.path.join(FRONTEND_IMAGES, 'products', 'power-bank.jpg')) or os.path.getsize(os.path.join(FRONTEND_IMAGES, 'products', 'power-bank.jpg')) < 500:
    peer = os.path.join(FRONTEND_IMAGES, 'products', 'usb-c-charger.jpg')
    if os.path.exists(peer):
        shutil.copy(peer, os.path.join(FRONTEND_IMAGES, 'products', 'power-bank.jpg'))

if not os.path.exists(os.path.join(FRONTEND_IMAGES, 'products', 'cookware-set.jpg')) or os.path.getsize(os.path.join(FRONTEND_IMAGES, 'products', 'cookware-set.jpg')) < 500:
    peer = os.path.join(FRONTEND_IMAGES, 'products', 'electric-kettle.jpg')
    if os.path.exists(peer):
        shutil.copy(peer, os.path.join(FRONTEND_IMAGES, 'products', 'cookware-set.jpg'))

if not os.path.exists(os.path.join(FRONTEND_IMAGES, 'products', 'sunscreen.jpg')) or os.path.getsize(os.path.join(FRONTEND_IMAGES, 'products', 'sunscreen.jpg')) < 500:
    peer = os.path.join(FRONTEND_IMAGES, 'products', 'moisturizer.jpg')
    if os.path.exists(peer):
        shutil.copy(peer, os.path.join(FRONTEND_IMAGES, 'products', 'sunscreen.jpg'))

if not os.path.exists(os.path.join(FRONTEND_IMAGES, 'categories', 'sports.jpg')) or os.path.getsize(os.path.join(FRONTEND_IMAGES, 'categories', 'sports.jpg')) < 500:
    peer = os.path.join(FRONTEND_IMAGES, 'products', 'football.jpg')
    if os.path.exists(peer):
        shutil.copy(peer, os.path.join(FRONTEND_IMAGES, 'categories', 'sports.jpg'))

# Create clean vector SVGs for placeholders
product_placeholder_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#F1F5F9"/>
  <circle cx="200" cy="180" r="70" fill="#E2E8F0"/>
  <path d="M175 160L200 135L225 160M200 145V215" stroke="#94A3B8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="155" y="215" width="90" height="40" rx="8" fill="#CBD5E1"/>
  <text x="200" y="295" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#64748B" text-anchor="middle">ShopSphere Product</text>
</svg>'''

with open(os.path.join(FRONTEND_IMAGES, 'placeholders', 'placeholder-product.svg'), 'w', encoding='utf-8') as f:
    f.write(product_placeholder_svg)

category_placeholder_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#EFF6FF"/>
  <circle cx="200" cy="180" r="70" fill="#DBEAFE"/>
  <rect x="160" y="145" width="80" height="70" rx="10" stroke="#3B82F6" stroke-width="8" stroke-linecap="round"/>
  <text x="200" y="295" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#1E40AF" text-anchor="middle">ShopSphere Category</text>
</svg>'''

with open(os.path.join(FRONTEND_IMAGES, 'placeholders', 'placeholder-category.svg'), 'w', encoding='utf-8') as f:
    f.write(category_placeholder_svg)

# Sync images to backend media
print("Syncing assets to backend media...")
src_products = os.path.join(FRONTEND_IMAGES, 'products')
dest_thumbnails = os.path.join(MEDIA_DIR, 'products', 'thumbnails')
dest_gallery = os.path.join(MEDIA_DIR, 'products', 'gallery')
dest_categories = os.path.join(MEDIA_DIR, 'categories')

for f in os.listdir(src_products):
    sp = os.path.join(src_products, f)
    if os.path.isfile(sp):
        shutil.copy(sp, os.path.join(dest_thumbnails, f))
        shutil.copy(sp, os.path.join(dest_gallery, f))

src_cats = os.path.join(FRONTEND_IMAGES, 'categories')
for f in os.listdir(src_cats):
    sp = os.path.join(src_cats, f)
    if os.path.isfile(sp):
        shutil.copy(sp, os.path.join(dest_categories, f))

print("Asset preparation & syncing complete!")
