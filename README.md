ShopSphere — Next-Generation Modern E-Commerce Platform

"Everything You Need. Delivered Simply."

🌐 Live Demo: https://shop-sphere-six-bice.vercel.app/

ShopSphere is a full-stack, production-grade e-commerce marketplace platform built with React 19 + Vite on the frontend and Django 5 + Django REST Framework on the backend. Designed with modular clean architecture, robust role-based access control (RBAC), and modern aesthetic user experience patterns inspired by consumer powerhouses such as Meesho and Flipkart.




## 🌟 Key Highlights

- **Original Brand & Design System**: Custom modern typography (Outfit & Inter), glassmorphism accents, vibrant indigo & cyan accents, full Light/Dark mode switching with persistent CSS variables.
- **Three Distinct User Portals**:
  1. **Customer**: Product discovery, debounced autocomplete search, faceted filtering, dynamic variants, persistent cart & coupons, wishlist, 4-step checkout, and interactive order tracking with return/cancellation flows.
  2. **Seller Hub**: Vendor onboarding & KYC application, analytics dashboard with real-time KPI metrics, inventory CRUD with multiple images/variants, and order fulfillment lifecycle management.
  3. **Admin Control Center**: Platform-wide metrics, seller KYC verification & suspension, catalog and taxonomy management, discount voucher engine, review moderation, return request adjudication, and exportable business reports (CSV + print-ready).
- **Production-Ready Payment Architecture**: Development-safe Cash on Delivery (COD) and structured pluggable Razorpay payment gateway abstraction via environment configuration.
- **Automated Verification**: End-to-end integration verification suite and Django unit test coverage (`Ran 7 tests ... OK`).

---

## 🏗️ Architecture & Folder Structure

```
00/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # Custom User, UserAddress, JWT Auth, Admin Analytics & Views
│   │   ├── categories/       # Hierarchical Category tree & taxonomy
│   │   ├── products/         # Products, Multi-images, Variants, Filtering & Searching
│   │   ├── sellers/          # SellerProfile, Onboarding, Metrics & Approvals
│   │   ├── cart/             # Dynamic Cart, CartItems & automated pricing calculations
│   │   ├── wishlist/         # Wishlist, toggle & move-to-cart operations
│   │   ├── coupons/          # Coupon validation, usage limits, percentage/fixed discounts
│   │   ├── orders/           # Orders, OrderItems, OrderTimeline & Return requests
│   │   ├── payments/         # Payment Gateway abstraction (COD + Razorpay support)
│   │   ├── reviews/          # Verified buyer reviews, rating aggregates & helpful votes
│   │   └── notifications/    # User notification system
│   ├── config/               # Django root settings, JWT, CORS, URL routers
│   ├── media/                # Uploaded product and profile media assets
│   ├── requirements.txt      # Backend Python dependencies
│   ├── manage.py
│   ├── verify_endpoints.py   # Automated system integration test script
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Local styling and branding assets
│   │   ├── components/
│   │   │   ├── common/       # Header, Navbar, Footer, ProductCard, Modals, Stars, Skeletons
│   │   │   ├── home/         # HeroCarousel, CategoryPills
│   │   │   └── products/     # ProductFilters, ProductSort, ProductGallery
│   │   ├── context/          # ThemeContext, AuthContext, CartContext, WishlistContext, NotificationContext
│   │   ├── layouts/          # CustomerLayout, SellerLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/        # Dashboard, Users, Sellers, Products, Categories, Orders, Coupons, Reviews, Returns, Reports
│   │   │   ├── seller/       # Dashboard, Products, ProductForm, Orders
│   │   │   ├── HomePage.jsx, ProductListingPage.jsx, ProductDetailPage.jsx, SearchPage.jsx
│   │   │   ├── CartPage.jsx, WishlistPage.jsx, CheckoutPage.jsx, OrdersPage.jsx, OrderDetailPage.jsx
│   │   │   └── LoginPage.jsx, RegisterPage.jsx, SellerRegisterPage.jsx, ProfilePage.jsx, NotFoundPage.jsx
│   │   ├── routes/           # AppRoutes with ProtectedRoute role guards
│   │   ├── services/         # Axios API clients for all backend modules
│   │   ├── App.jsx           # Provider tree root
│   │   ├── main.jsx          # DOM mount
│   │   └── index.css         # Complete responsive design tokens & dark mode stylesheet
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
│
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router DOM v7, Axios, Lucide React, React Toastify |
| **Styling** | Vanilla CSS3 Design System with HSL tokens, Responsive Flex/Grid, Dark Mode |
| **Backend** | Python 3.12, Django 5.0, Django REST Framework 3.15, SimpleJWT |
| **Database** | SQLite3 (Local Development fallback) / PostgreSQL (Production ready) |
| **Security** | JWT Auth with access & refresh tokens, password hashing (PBKDF2), role-based permissions |
| **Payments** | Cash On Delivery (COD) + Razorpay Gateway Abstraction Layer |

---

## ⚡ Quick Start & Local Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate
# macOS/Linux:
# python3 -m venv venv
# source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Seed demo categories, products, coupons, and demo accounts
python manage.py seed_data

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

The Django API is now live at: `http://127.0.0.1:8000/api/`  
DRF Swagger / API Docs are browsable at: `http://127.0.0.1:8000/api/docs/`

---

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Verify environment configuration (defaults to http://127.0.0.1:8000/api)
# Copy .env.example to .env if needed:
cp .env.example .env

# Launch Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```

The ShopSphere web application is now accessible at: `http://127.0.0.1:5173/`

---

## 👥 Demo Accounts (Development & Evaluation)

All seeded demo accounts share the standard development password: `ShopSphere@123`

| Role | Email Address | Password | Access & Redirect |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@shopsphere.local` | `ShopSphere@123` | Redirects to Home / Profile / Orders |
| **Seller** | `seller@shopsphere.local` | `ShopSphere@123` | Redirects to `/seller/dashboard` |
| **Admin** | `admin@shopsphere.local` | `ShopSphere@123` | Redirects to `/admin/dashboard` |

*(You can also register a new Customer account or submit a Seller application directly via the UI).*

---

## 📡 REST API Catalog Overview

### Authentication & Profiles (`/api/auth/`)
- `POST /api/auth/register/` — Create new customer/seller user
- `POST /api/auth/login/` — Authenticate and receive JWT access & refresh tokens
- `POST /api/auth/refresh/` — Refresh expired JWT access token
- `POST /api/auth/logout/` — Blacklist refresh token
- `GET /api/auth/profile/` — Fetch current user profile
- `PUT /api/auth/profile/` — Update user details
- `POST /api/auth/change-password/` — Update password
- `GET/POST /api/auth/addresses/` — List & create customer delivery addresses
- `PUT/DELETE /api/auth/addresses/:id/` — Update or delete address
- `POST /api/auth/addresses/:id/set_default/` — Mark address as primary

### Catalog & Categories (`/api/categories/` & `/api/products/`)
- `GET /api/categories/` — Hierarchical category tree with subcategories & product counts
- `GET /api/products/` — Filtered, sorted, and paginated product list (`search`, `category`, `brand`, `min_price`, `max_price`, `min_rating`, `min_discount`, `in_stock`, `ordering`)
- `GET /api/products/:slug/` — Complete product details with variants, images, seller info & rating distribution
- `GET /api/products/featured/` — Featured spotlight items
- `GET /api/products/deals/` — Top discount deals
- `GET /api/products/best_sellers/` — High-volume bestselling products
- `GET /api/products/brands/` — Unique brand list for filter facets

### Shopping Cart (`/api/cart/`)
- `GET /api/cart/` — Retrieve active user cart with subtotal, tax, delivery fee & discounts
- `POST /api/cart/add/` — Add product variant to cart
- `PUT /api/cart/update_item/` — Adjust item quantity (enforces stock limits)
- `DELETE /api/cart/remove_item/:id/` — Remove item from cart
- `POST /api/cart/clear/` — Empty cart

### Wishlist (`/api/wishlist/`)
- `GET /api/wishlist/` — List saved items
- `GET /api/wishlist/ids/` — Quick lookup list of saved product IDs for instant UI rendering
- `POST /api/wishlist/toggle/` — Toggle product in/out of wishlist
- `POST /api/wishlist/move-to-cart/` — Move saved item into cart

### Orders & Fulfillment (`/api/orders/`)
- `POST /api/orders/create/` — Convert cart to confirmed order, deduct stock, generate timeline
- `GET /api/orders/` — Customer order history
- `GET /api/orders/:id/` — Detailed order view with status timeline & courier tracking
- `POST /api/orders/:id/cancel/` — Customer order cancellation
- `POST /api/orders/:id/return/` — File return/refund dispute with reason and comments
- `GET /api/orders/seller/` — Orders containing seller's products
- `POST /api/orders/:id/update-status/` — Seller status progression (`Confirmed` → `Processing` → `Packed` → `Shipped` → `Delivered`)
- `GET /api/orders/admin/all/` — Admin complete order ledger
- `GET /api/orders/admin/returns/` — Admin return request queue
- `POST /api/orders/admin/returns/:id/approve/` — Approve return and trigger refund
- `POST /api/orders/admin/returns/:id/reject/` — Reject return request

### Coupons & Discounts (`/api/coupons/`)
- `POST /api/coupons/apply/` — Validate coupon eligibility against cart value and user usage limits
- `POST /api/coupons/remove/` — Remove active coupon from cart
- `GET/POST /api/coupons/admin/` — Admin coupon CRUD management

### Reviews & Ratings (`/api/reviews/`)
- `GET /api/reviews/product/:id/` — Product reviews and rating stars distribution breakdown
- `POST /api/reviews/product/:id/` — Submit review & rating (buyer verification validated)
- `POST /api/reviews/:id/helpful/` — Upvote helpful review
- `GET /api/reviews/admin/all/` — Admin moderation queue
- `DELETE /api/reviews/admin/all/:id/` — Remove inappropriate review

### Seller Operations (`/api/sellers/`)
- `POST /api/sellers/register/` — Vendor registration with GST, PAN & bank verification details
- `GET /api/sellers/profile/` — Seller store profile
- `GET /api/sellers/dashboard/` — Sales revenue, order volume, daily chart trends & top products

### Admin Operations (`/api/admin/`)
- `GET /api/admin/dashboard/` — Platform KPIs: total revenue, order count, sellers, catalog size
- `GET /api/admin/reports/?type=sales|products|orders` — Generate analytical business reports
- `GET /api/admin/users/` — Customer & user account directory
- `POST /api/admin/users/:id/toggle_active/` — Activate or deactivate user access
- `POST /api/admin/sellers/:id/approve/` — Approve pending seller
- `POST /api/admin/sellers/:id/reject/` — Reject seller onboarding
- `POST /api/admin/sellers/:id/suspend/` — Suspend seller privileges

---

## 💳 Payment Gateway Architecture & Razorpay Integration

The payment subsystem is designed with an extensible adapter pattern (`apps.payments.services.PaymentGatewayService`):

1. **Cash on Delivery (COD)**:
   - Fully operational out-of-the-box.
   - Orders are marked as `Pending` payment and transition to `Paid` upon delivery fulfillment.

2. **Razorpay Online Payments**:
   - The backend includes Razorpay client initialization and order creation logic.
   - Set environment variables in `backend/.env`:
     ```env
     RAZORPAY_KEY_ID=rzp_test_your_key_id
     RAZORPAY_KEY_SECRET=your_key_secret
     ```
   - When keys are omitted or set to placeholder values, the platform automatically falls back to development simulation mode, allowing end-to-end checkout testing without failing.

---

---

## 🔐 Authentication, Role-Based Access Control & Google OAuth 2.0

ShopSphere enforces strict, database-backed authentication and role routing. Frontend-only fake accounts and hardcoded credentials are strictly prohibited.

### 🔄 The Authentication Lifecycle
1. **Registration**:
   - `POST /api/auth/register/` (Full Name, Email, Mobile Number, Password, Confirm Password).
   - Validates password strength, email formatting, and checks for duplicate registrations.
   - If email is duplicate: `"An account with this email already exists. Please login."`
   - On success: Creates active User in Django database, returns HTTP 201 with message `"Account created successfully. Please login."`.
   - **No auto-login**: Frontend automatically redirects to `/login` with pre-filled registered email.
2. **Login**:
   - `POST /api/auth/login/` (Email/Username + Password).
   - If user does not exist in Django database: `"Account not found. Please register first."`
   - If password is wrong: `"Invalid email or password."`
   - If account `is_active=False`: `"Your account is currently inactive. Please contact support."`
   - On successful credentials verification: Generates secure SimpleJWT `access` and `refresh` tokens and returns user profile.
3. **Role-Based Redirects**:
   - `CUSTOMER` → `/` (Storefront)
   - `SELLER` → `/seller/dashboard` (Vendor portal)
   - `ADMIN` → `/admin/dashboard` (Platform ops)
   - Both frontend `ProtectedRoute` and backend DRF permissions (`IsAdminRole`, `IsSellerOrAdmin`) enforce that customers and sellers cannot access administrator endpoints or dashboards.
4. **Secure Logout**:
   - Clicking logout triggers a glassmorphic confirmation modal: *"Are you sure you want to logout?"*.
   - On confirmation, the refresh token is blacklisted on the backend (`POST /api/auth/logout/`), client localStorage/session tokens are completely wiped, Axios default authorization headers are cleared, and the user is redirected to `/login` with toast notification *"Logged out successfully."*.
   - Protected routes immediately block back-button navigation without an active session.

---

## 🌐 Google OAuth 2.0 / OpenID Connect Setup Guide

ShopSphere implements official Google Identity Services (GIS) on the frontend paired with cryptographic server-side validation on Django. The client **never** receives or handles the Google Client Secret.

```
React (GIS Button)
   │
   ▼
[User Authenticates with Google]
   │
   ▼
Google ID Token (JWT) sent to Backend
   │
   ▼
Django Backend (apps/accounts/google_auth.py)
   ├── Cryptographic signature validation via `google-auth` library
   ├── Fallback verification via Google's `https://oauth2.googleapis.com/tokeninfo`
   ├── Verifies `iss` (accounts.google.com), `aud` (matching GOOGLE_CLIENT_ID), and `email_verified=True`
   └── Finds existing user OR creates new user with `role = Role.CUSTOMER` (never auto-creates ADMIN/SELLER)
   │
   ▼
ShopSphere JWT Tokens (access + refresh) generated & returned
   │
   ▼
Frontend securely sets session state and redirects by role
```

### Step 1: Google Cloud Console Configuration
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `ShopSphere E-Commerce`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Fill in **App Name** (`ShopSphere`), **User support email**, and **Developer contact email**.
   - Under **Scopes**, add `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   - Under **Test Users**, add your Google email address for local testing.
   - Save and continue.
4. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Select **Application type**: `Web application`.
   - Set **Name**: `ShopSphere Web Client`.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
     - *(For Production, add your live domain: e.g., `https://shopsphere.example.com`)*
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - Click **Create**.
   - Copy the generated **Client ID** and **Client Secret**.

### Step 2: Configure Environment Variables

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
*(Notice: Never expose your Google Client Secret on the frontend).*

**Backend (`backend/.env`):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Development Mode Fallback
- When `VITE_GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_ID` is not yet configured, the Google button displays a helpful prompt explaining configuration.
- The backend token verification automatically enforces token audience validation when `GOOGLE_CLIENT_ID` is present.

---

## 🧪 Automated Testing

### 1. Running the Complete Authentication & Security Test Suite:
```bash
cd backend
.\venv\Scripts\python.exe test_auth_flow.py
```
This automated suite verifies all 8 mandatory authentication scenarios:
- **Test Case 1**: New user registration -> DB user verified -> Redirect to login -> Valid login -> JWT tokens issued.
- **Test Case 2**: Wrong password -> Rejected with `"Invalid email or password."`.
- **Test Case 3**: Unregistered email -> Rejected with `"Account not found. Please register first."`.
- **Test Case 4**: Duplicate registration -> Rejected with `"An account with this email already exists. Please login."`.
- **Test Case 5**: Google login for existing user -> Existing account matched, role preserved, JWT issued.
- **Test Case 6**: Google login for new user -> Customer account created (`role=CUSTOMER`), JWT issued.
- **Status Test**: Inactive user -> Rejected with `"Your account is currently inactive. Please contact support."`.
- **Test Case 7**: Logout -> Refresh token blacklisted, tokens cleared, protected routes return 401.
- **Test Case 8**: Expired token refresh -> Valid refresh returns new access token; invalid refresh returns 401.
- **RBAC Test**: Backend blocks Customer from accessing Admin endpoints with 403/404.

### 2. Running Backend Unit Tests:
```bash
cd backend
python manage.py test
```

### 3. Verifying Frontend Build & Linting:
```bash
cd frontend
npm run lint
npm run build
```

---

## 🚀 Production Deployment Guidelines

1. **Database**: Swap SQLite with managed PostgreSQL by configuring `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/shopsphere_db
   ```
2. **Environment Variables**:
   - Set `DEBUG=False` in `backend/.env`.
   - Generate a strong cryptographic secret: `SECRET_KEY=...`
   - Specify production domains in `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
3. **Static & Media Files**:
   - Run `python manage.py collectstatic --noinput`.
   - Configure AWS S3, Cloudflare R2, or Whitenoise with Nginx reverse proxy.
4. **Process Supervision**:
   - Run Django using Gunicorn with Uvicorn workers:
     ```bash
     gunicorn config.wsgi:application --workers 4 --bind 0.0.0.0:8000
     ```
5. **Frontend Hosting**:
   - Build client bundle with `npm run build` and serve `frontend/dist` via Nginx, Vercel, or AWS CloudFront.

---

## 📄 License & Intellectual Property

ShopSphere is an original engineering implementation created for professional portfolio demonstration. All branding, layouts, logic, and schemas are original assets.
