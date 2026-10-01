import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = () => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const cartCount = cart?.total_items_count || 0;
  const wishlistCount = wishlist?.length || 0;

  const accountPath = !isAuthenticated
    ? '/login'
    : user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'SELLER'
    ? '/seller/dashboard'
    : '/profile';

  const navItems = [
    { label: 'Home', to: '/', icon: Home, end: true },
    { label: 'Categories', to: '/products', icon: Grid },
    { label: 'Wishlist', to: '/wishlist', icon: Heart, count: wishlistCount },
    { label: 'Cart', to: '/cart', icon: ShoppingBag, count: cartCount },
    { label: 'Account', to: accountPath, icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none', // Controlled by CSS media query below
        padding: '0.4rem 0.5rem max(0.4rem, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '540px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mobile-nav-tab ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                gap: '2px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.68rem',
                padding: '0.35rem 0.5rem',
                minWidth: '58px',
                position: 'relative',
                transition: 'color 0.2s ease',
              })}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={2} />
                {item.count > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1,
                    }}
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
