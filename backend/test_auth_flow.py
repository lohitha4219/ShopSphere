import os
import sys
import time
import requests
from unittest.mock import patch

# Configure Django settings for in-process testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.serializers import GoogleAuthSerializer, LoginSerializer, RegisterSerializer
from apps.accounts.views import get_tokens_for_user

User = get_user_model()
BASE_URL = "http://127.0.0.1:8000/api"

def run_all_tests():
    print("=" * 70)
    print("STARTING FULL SHOPSPHERE AUTHENTICATION VERIFICATION SUITE")
    print("=" * 70)

    unique_ts = str(int(time.time()))
    test_email = f"verified_user_{unique_ts}@shopsphere.test"
    test_password = "Password@1234"
    test_name = "ShopSphere Verified User"
    test_mobile = f"98{unique_ts[-8:]}"

    # ----------------------------------------------------
    # TEST CASE 3: Unregistered user login
    # ----------------------------------------------------
    print("\n[TEST CASE 3] Unregistered user attempts to login")
    res = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": test_email,
        "password": "RandomPassword!2026"
    })
    print(f"Status: {res.status_code}, Body: {res.json()}")
    assert res.status_code == 400
    account_err = res.json().get("account") or res.json().get("non_field_errors")
    assert "Account not found. Please register first." in str(account_err)
    print("[PASS] TEST CASE 3: Unregistered user properly rejected with 'Account not found. Please register first.'")

    # ----------------------------------------------------
    # TEST CASE 1: New user registration -> DB check -> Login
    # ----------------------------------------------------
    print("\n[TEST CASE 1] New user registration & subsequent login")
    reg_payload = {
        "full_name": test_name,
        "email": test_email,
        "mobile_number": test_mobile,
        "password": test_password,
        "confirm_password": test_password
    }
    reg_res = requests.post(f"{BASE_URL}/auth/register/", json=reg_payload)
    print(f"Register Status: {reg_res.status_code}, Body: {reg_res.json()}")
    assert reg_res.status_code == 201
    assert reg_res.json().get("message") == "Account created successfully. Please login."
    # Confirm no auto-login tokens
    assert "tokens" not in reg_res.json() and "access" not in reg_res.json()
    # Confirm user created in database
    db_user = User.objects.filter(email__iexact=test_email).first()
    assert db_user is not None
    assert db_user.check_password(test_password)
    assert db_user.role == 'CUSTOMER'
    print("[OK] User successfully created in Django DB with role=CUSTOMER.")

    # Now login with the same registered credentials
    login_res = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": test_email,
        "password": test_password
    })
    print(f"Login Status: {login_res.status_code}, User: {login_res.json().get('user', {}).get('email')}")
    assert login_res.status_code == 200
    login_data = login_res.json()
    access_token = login_data["tokens"]["access"]
    refresh_token = login_data["tokens"]["refresh"]
    assert login_data["user"]["role"] == "CUSTOMER"
    print("[PASS] TEST CASE 1: Registration created DB record, redirected to login, credentials verified, JWT issued.")

    # ----------------------------------------------------
    # TEST CASE 2: Wrong password with registered email
    # ----------------------------------------------------
    print("\n[TEST CASE 2] Wrong password for registered user")
    bad_login_res = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": test_email,
        "password": "WrongPassword!999"
    })
    print(f"Status: {bad_login_res.status_code}, Body: {bad_login_res.json()}")
    assert bad_login_res.status_code == 400
    cred_err = bad_login_res.json().get("credentials") or bad_login_res.json().get("non_field_errors")
    assert "Invalid email or password." in str(cred_err)
    print("[PASS] TEST CASE 2: Rejected with 'Invalid email or password.'")

    # ----------------------------------------------------
    # TEST CASE 4: Duplicate registration with existing email
    # ----------------------------------------------------
    print("\n[TEST CASE 4] Duplicate registration with existing email")
    dup_res = requests.post(f"{BASE_URL}/auth/register/", json=reg_payload)
    print(f"Status: {dup_res.status_code}, Body: {dup_res.json()}")
    assert dup_res.status_code == 400
    email_err = dup_res.json().get("email")
    assert "An account with this email already exists. Please login." in str(email_err)
    print("[PASS] TEST CASE 4: Rejected with 'An account with this email already exists. Please login.'")

    # ----------------------------------------------------
    # TEST CASE 6: Google login - New User
    # ----------------------------------------------------
    print("\n[TEST CASE 6] Google login with brand new Google account")
    google_new_email = f"google_new_{unique_ts}@gmail.com"
    mock_new_payload = {
        'email': google_new_email,
        'email_verified': True,
        'name': 'Google Newbie',
        'given_name': 'Google',
        'family_name': 'Newbie',
        'picture': 'https://lh3.googleusercontent.com/a/photo_new',
        'sub': f'google_sub_{unique_ts}_new'
    }
    with patch('apps.accounts.serializers.verify_google_id_token', return_value=mock_new_payload):
        serializer = GoogleAuthSerializer(data={'credential': 'mock_valid_token_new'})
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        validated_user = serializer.validated_data['user']
        assert validated_user.email.lower() == google_new_email.lower()
        assert validated_user.role == 'CUSTOMER', "Google new user must have role=CUSTOMER"
        tokens = get_tokens_for_user(validated_user)
        assert tokens['access'] and tokens['refresh']
        print(f"[OK] Created new Google user '{validated_user.email}' with role={validated_user.role}")
    print("[PASS] TEST CASE 6: Google new user successfully created in DB with role=CUSTOMER and JWT issued.")

    # ----------------------------------------------------
    # TEST CASE 5: Google login - Existing User
    # ----------------------------------------------------
    print("\n[TEST CASE 5] Google login with existing registered user")
    # Existing user registered in Test Case 1: test_email
    mock_existing_payload = {
        'email': test_email,
        'email_verified': True,
        'name': test_name,
        'given_name': 'ShopSphere',
        'family_name': 'User',
        'picture': 'https://lh3.googleusercontent.com/a/photo_existing',
        'sub': f'google_sub_{unique_ts}_existing'
    }
    with patch('apps.accounts.serializers.verify_google_id_token', return_value=mock_existing_payload):
        serializer = GoogleAuthSerializer(data={'credential': 'mock_valid_token_existing'})
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"
        validated_user = serializer.validated_data['user']
        assert validated_user.id == db_user.id
        assert validated_user.email == test_email
        tokens = get_tokens_for_user(validated_user)
        assert tokens['access'] and tokens['refresh']
        print(f"[OK] Authenticated existing user '{validated_user.email}' with preserved role={validated_user.role}")
    print("[PASS] TEST CASE 5: Existing user matched, logged in, role preserved.")

    # ----------------------------------------------------
    # TEST CASE: Inactive user status enforcement (Requirement 5)
    # ----------------------------------------------------
    print("\n[TEST] Inactive user login rejection (Requirement 5)")
    inactive_email = f"inactive_{unique_ts}@shopsphere.test"
    inactive_user = User.objects.create_user(
        username=f"inactive_{unique_ts}",
        email=inactive_email,
        password=test_password,
        role='CUSTOMER',
        is_active=False
    )
    inactive_res = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": inactive_email,
        "password": test_password
    })
    print(f"Status: {inactive_res.status_code}, Body: {inactive_res.json()}")
    assert inactive_res.status_code == 400
    status_err = inactive_res.json().get("status") or inactive_res.json().get("non_field_errors")
    assert "Your account is currently inactive. Please contact support." in str(status_err)
    print("[PASS] Inactive account rejected with 'Your account is currently inactive. Please contact support.'")

    # ----------------------------------------------------
    # TEST CASE 8: Expired/Refresh Token Flow
    # ----------------------------------------------------
    print("\n[TEST CASE 8] Token refresh cycle")
    ref_res = requests.post(f"{BASE_URL}/auth/refresh/", json={"refresh": refresh_token})
    print(f"Refresh Status: {ref_res.status_code}")
    assert ref_res.status_code == 200
    new_access = ref_res.json()["access"]
    assert new_access is not None

    # Invalid refresh token rejection
    bad_ref_res = requests.post(f"{BASE_URL}/auth/refresh/", json={"refresh": "invalid_refresh_string"})
    assert bad_ref_res.status_code == 401
    print("[PASS] TEST CASE 8: Valid refresh returns new token; invalid refresh rejected with 401.")

    # ----------------------------------------------------
    # TEST CASE 7: Logout & Route Protection
    # ----------------------------------------------------
    print("\n[TEST CASE 7] Logout & Protected Route Clearance")
    # Verify access with valid token
    me_res = requests.get(f"{BASE_URL}/auth/profile/", headers={"Authorization": f"Bearer {new_access}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

    # Blacklist/logout token
    logout_res = requests.post(f"{BASE_URL}/auth/logout/", json={"refresh": refresh_token})
    print(f"Logout Status: {logout_res.status_code}")
    assert logout_res.status_code == 200

    # Unauthenticated / cleared client headers must be blocked
    unauth_res = requests.get(f"{BASE_URL}/auth/profile/")
    assert unauth_res.status_code == 401
    print("[PASS] TEST CASE 7: Protected route blocked without authorization header (simulating post-logout client).")

    # ----------------------------------------------------
    # ROLE-BASED ACCESS CONTROL (Requirement 6)
    # ----------------------------------------------------
    print("\n[TEST] Backend Role-Based Access Control (Admin route access)")
    # Customer trying to access Admin users endpoint
    admin_probe = requests.get(f"{BASE_URL}/auth/users/", headers={"Authorization": f"Bearer {new_access}"})
    print(f"Customer accessing /api/auth/users/: Status {admin_probe.status_code}")
    assert admin_probe.status_code in [403, 404]
    print("[PASS] Customer blocked by backend permissions from accessing Admin endpoints.")

    print("\n" + "=" * 70)
    print("ALL 8 TEST CASES AND SECURITY CHECKS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()
