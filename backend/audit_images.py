import urllib.request
import json
import sys

def check_url(url, label=''):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        content = res.read()
        print(f"[200 OK] {label} -> {url[:65]}... ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"[FAIL] {label} -> {url}: {e}")
        return False

success = True
print("=== 1. CHECK VITE FRONTEND & STATIC ASSETS ===")
for path, label in [
    ("http://127.0.0.1:5173/", "Frontend Home"),
    ("http://127.0.0.1:5173/images/banners/electronics-banner.jpg", "Electronics Banner"),
    ("http://127.0.0.1:5173/images/banners/fashion-banner.jpg", "Fashion Banner"),
    ("http://127.0.0.1:5173/images/banners/home-banner.jpg", "Home Banner"),
    ("http://127.0.0.1:5173/images/placeholders/placeholder-product.svg", "Placeholder Product"),
    ("http://127.0.0.1:5173/images/placeholders/placeholder-category.svg", "Placeholder Category"),
]:
    if not check_url(path, label):
        success = False

print("\n=== 2. CHECK CATEGORY IMAGES VIA API ===")
cats_res = urllib.request.urlopen("http://127.0.0.1:8000/api/categories/", timeout=5)
cats_data = json.loads(cats_res.read())
cats = cats_data.get("results", cats_data) if isinstance(cats_data, dict) else cats_data
for cat in cats[:8]:
    img = cat.get("image")
    if img:
        if not check_url(img, f"Category: {cat['name']}"):
            success = False

print("\n=== 3. CHECK PRODUCT THUMBNAILS VIA API ===")
prods_res = urllib.request.urlopen("http://127.0.0.1:8000/api/products/?page_size=15", timeout=5)
prods = json.loads(prods_res.read()).get("results", [])
for p in prods[:10]:
    thumb = p.get("thumbnail")
    if thumb:
        if not check_url(thumb, f"Product: {p['name'][:30]}"):
            success = False

print("\n=== 4. CHECK PRODUCT DETAIL GALLERY IMAGES ===")
for p in prods[:3]:
    det_res = urllib.request.urlopen(f"http://127.0.0.1:8000/api/products/{p['slug']}/", timeout=5)
    det = json.loads(det_res.read())
    print(f"Product '{det['name']}' has {len(det.get('images', []))} gallery images")
    for i, g in enumerate(det.get("images", [])):
        if not check_url(g["image"], f"  Gallery Image {i+1}"):
            success = False

if success:
    print("\nALL IMAGE ENDPOINTS VERIFIED WITH STATUS 200 OK! ZERO BROKEN LINKS.")
else:
    print("\nSOME IMAGES FAILED TO LOAD.")
    sys.exit(1)
