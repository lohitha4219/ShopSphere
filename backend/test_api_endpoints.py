import urllib.request
import json

base_url = "http://127.0.0.1:8000/api"

def check(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== CHECKING CATEGORIES API ===")
cats_data = check(f"{base_url}/categories/")
cats = cats_data.get('results', cats_data) if isinstance(cats_data, dict) else cats_data
print(f"Top-level categories count: {len(cats)}")
for c in cats[:8]:
    print(f"  Category: {c['name']} (slug: {c['slug']}) -> {c.get('product_count', 0)} products, {len(c.get('subcategories', []))} subcategories")

print("\n=== CHECKING PRODUCTS API ===")
prods_data = check(f"{base_url}/products/")
print(f"Total count: {prods_data.get('count')}")
results = prods_data.get('results', [])
print(f"Returned on page 1: {len(results)}")
first = results[0]
print(f"First product: '{first['name']}' | Price: {first['price']} | In Stock: {first['in_stock']} | Primary Image: {first.get('primary_image')}")

print("\n=== CHECKING TASK 5 CATEGORY FILTERS VIA API ===")
task5_categories = [
    "mens-wear", "womens-wear", "kids-wear", "sarees", "dresses",
    "college-wear", "party-wear", "office-wear", "footwear",
    "accessories", "electronics", "beauty", "home-living"
]

for cat in task5_categories:
    res = check(f"{base_url}/products/?category={cat}")
    count = res.get('count', len(res) if isinstance(res, list) else 0)
    print(f"  ?category={cat:<15} => {count} products found")

print("\n=== ALL API CHECKS COMPLETED ===")
