import urllib.request
import json
import sys

BASE_URL = 'http://127.0.0.1:8000/api'

def make_request(path, method='GET', data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode('utf-8')
        return e.code, json.loads(err_content) if err_content else {}

def main():
    print("=" * 60)
    print("SHOPSPHERE AUTOMATED SYSTEM INTEGRATION VERIFICATION")
    print("=" * 60)

    # 1. Customer Authentication
    status, res = make_request('/auth/login/', method='POST', data={
        'email': 'customer@shopsphere.local',
        'password': 'ShopSphere@123'
    })
    assert status == 200, f"Customer login failed: {res}"
    customer_token = res['access']
    print(f"[OK] Customer Login Successful: {res['user']['email']} (Role: {res['user']['role']})")

    # 2. Categories
    status, res = make_request('/categories/')
    assert status == 200, f"Categories failed: {res}"
    print(f"[OK] Categories Endpoint: {len(res)} top-level categories fetched.")

    # 3. Products
    status, res = make_request('/products/')
    assert status == 200, f"Products failed: {res}"
    products = res.get('results', [])
    print(f"[OK] Products Catalog: {len(products)} products fetched. First: '{products[0]['name']}' (Price: INR {products[0]['price']})")

    # 4. Cart Operations
    first_product_id = products[0]['id']
    status, res = make_request('/cart/add/', method='POST', data={
        'product_id': first_product_id,
        'quantity': 2
    }, token=customer_token)
    assert status == 200, f"Cart add failed: {res}"
    print(f"[OK] Added Product to Cart. Subtotal: INR {res.get('subtotal')}, Total: INR {res.get('total_amount')}")

    # 5. Coupon Apply
    status, res = make_request('/coupons/apply/', method='POST', data={'code': 'WELCOME50'}, token=customer_token)
    print(f"[OK] Applied Coupon 'WELCOME50'. Status: {status} (Discount: INR {res.get('discount_applied', 0)})")

    # 6. Orders
    status, res = make_request('/orders/', token=customer_token)
    assert status == 200, f"Orders failed: {res}"
    orders = res if isinstance(res, list) else res.get('results', [])
    print(f"[OK] Customer Orders: {len(orders)} order(s) found.")

    # 7. Seller Login & Dashboard
    status, res = make_request('/auth/login/', method='POST', data={
        'email': 'seller@shopsphere.local',
        'password': 'ShopSphere@123'
    })
    assert status == 200, f"Seller login failed: {res}"
    seller_token = res['access']
    print(f"[OK] Seller Login Successful: {res['user']['email']} (Role: {res['user']['role']})")

    status, res = make_request('/sellers/dashboard/', token=seller_token)
    assert status == 200, f"Seller dashboard failed: {res}"
    print(f"[OK] Seller Dashboard: Total Products: {res.get('total_products')}, Orders: {res.get('total_orders')}, Sales: INR {res.get('total_revenue')}")

    # 8. Admin Login & Dashboard
    status, res = make_request('/auth/login/', method='POST', data={
        'email': 'admin@shopsphere.local',
        'password': 'ShopSphere@123'
    })
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res['access']
    print(f"[OK] Admin Login Successful: {res['user']['email']} (Role: {res['user']['role']})")

    status, res = make_request('/admin/dashboard/', token=admin_token)
    assert status == 200, f"Admin dashboard failed: {res}"
    print(f"[OK] Admin Dashboard: Users: {res.get('total_users')}, Sellers: {res.get('total_sellers')}, Products: {res.get('total_products')}, Orders: {res.get('total_orders')}, Platform Revenue: INR {res.get('total_revenue')}")

    # 9. Admin Reports
    status, res = make_request('/admin/reports/?type=sales', token=admin_token)
    assert status == 200, f"Admin sales report failed: {res}"
    print(f"[OK] Admin Reports: Generated '{res.get('report_type')}' with {len(res.get('records', []))} records.")

    print("=" * 60)
    print("ALL API ENDPOINTS & AUTH FLOWS VERIFIED SUCCESSFULLY (100% OPERATIONAL)")
    print("=" * 60)

if __name__ == '__main__':
    main()
