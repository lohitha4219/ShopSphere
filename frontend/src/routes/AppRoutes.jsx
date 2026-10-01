import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout';
import { SellerLayout } from '../layouts/SellerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Common
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public & Customer Pages
import { HomePage } from '../pages/HomePage';
import { ProductListingPage } from '../pages/ProductListingPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SearchPage } from '../pages/SearchPage';
import { CartPage } from '../pages/CartPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { SellerRegisterPage } from '../pages/SellerRegisterPage';
import { NotFoundPage, UnauthorizedPage, ServerErrorPage } from '../pages/NotFoundPage';

// Seller Portal Pages
import { SellerDashboardPage } from '../pages/seller/SellerDashboardPage';
import { SellerProductsPage } from '../pages/seller/SellerProductsPage';
import { SellerProductFormPage } from '../pages/seller/SellerProductFormPage';
import { SellerOrdersPage } from '../pages/seller/SellerOrdersPage';

// Admin Portal Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSellersPage } from '../pages/admin/AdminSellersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminReturnsPage } from '../pages/admin/AdminReturnsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================================================= */}
      {/* 1. CUSTOMER & PUBLIC EXPERIENCES (CustomerLayout)                        */}
      {/* ========================================================================= */}
      <Route element={<CustomerLayout />}>
        {/* Marketplace discovery */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/category/:slug" element={<ProductListingPage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Shopping bag (Accessible to all, items synced to user if logged in) */}
        <Route path="/cart" element={<CartPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/addresses"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATION & ONBOARDING (Standalone UI)                           */}
      {/* ========================================================================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/seller/register" element={<SellerRegisterPage />} />

      {/* ========================================================================= */}
      {/* 3. SELLER PORTAL (SellerLayout)                                          */}
      {/* ========================================================================= */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['SELLER']}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboardPage />} />
        <Route path="products" element={<SellerProductsPage />} />
        <Route path="products/new" element={<SellerProductFormPage />} />
        <Route path="products/:id/edit" element={<SellerProductFormPage />} />
        <Route path="orders" element={<SellerOrdersPage />} />
        <Route path="returns" element={<SellerOrdersPage />} />
        <Route path="reviews" element={<SellerOrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<ProfilePage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 4. ADMIN CONTROL CENTER (AdminLayout)                                    */}
      {/* ========================================================================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="sellers" element={<AdminSellersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="payments" element={<AdminOrdersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="returns" element={<AdminReturnsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<ProfilePage />} />
      </Route>

      {/* Error Pages */}
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
