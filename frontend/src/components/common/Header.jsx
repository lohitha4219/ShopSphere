import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Heart, User, Search, MapPin, Bell,
  Sun, Moon, Menu, X, ChevronDown, Store, ShieldCheck,
  Package, LogOut, Settings, Check, Sparkles, Flame, Award,
  ArrowRight, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { productService } from '../../services/product.service';
import { toast } from 'react-toastify';
import { Logo } from './Logo';
import { LogoutModal } from './LogoutModal';

export const Header = () => {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Search State & Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Dropdown states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Location Selector
  const [pincode, setPincode] = useState('560038');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifMenu(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await productService.getProducts({ search: searchQuery.trim(), page_size: 5 });
        setSuggestions(Array.isArray(data) ? data : (data?.results || []));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${product.slug || product.id}`);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    toast.info('Logged out from ShopSphere');
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'background-color var(--transition-fast)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-height)', gap: '1rem' }}>
        
        {/* Mobile Menu Toggle & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '0.45rem',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Logo size="md" showTagline={true} />
        </div>

        {/* Location Selector (Desktop) */}
        <div
          onClick={() => setShowPincodeModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
            whiteSpace: 'nowrap',
            transition: 'border-color var(--transition-fast)',
          }}
          className="hide-mobile"
          title="Change delivery pincode"
        >
          <MapPin size={17} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1 }}>Deliver to</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>{pincode}</div>
          </div>
        </div>

        {/* Powerful Search Bar with autocomplete dropdown */}
        <div ref={searchRef} style={{ flexGrow: 1, maxWidth: '560px', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for electronics, fashion, essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              style={{
                width: '100%',
                paddingLeft: '2.75rem',
                paddingRight: '5rem',
                height: '44px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-subtle)',
                fontSize: '0.9rem',
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1.05rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{
                position: 'absolute',
                right: '5px',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1.1rem',
                fontSize: '0.825rem',
                fontWeight: 700,
              }}
            >
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="card fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                zIndex: 110,
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                padding: '0.5rem 0',
              }}
            >
              <div style={{ padding: '0.45rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Instant Suggestions
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1.15rem',
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={14} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{Number(item.final_price || item.price).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Icons & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Become a Seller CTA (Only if not seller/admin) */}
          {!isSeller && !isAdmin && (
            <Link
              to="/seller/register"
              className="btn btn-outline btn-sm hide-mobile"
              style={{
                fontSize: '0.8rem',
                gap: '0.35rem',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                fontWeight: 700,
              }}
            >
              <Store size={15} />
              Become a Seller
            </Link>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={19} color="#F59E0B" /> : <Moon size={19} />}
          </button>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowProfileMenu(false);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--danger)',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-secondary)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifMenu && (
              <div
                className="card fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: '-60px',
                  width: '320px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                  zIndex: 120,
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
            }}
            title="Saved Wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-secondary)',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.48rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-glow)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span className="hide-mobile">Cart</span>
            <span
              style={{
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
                padding: '0.12rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              {cartCount}
            </span>
          </Link>

          {/* Profile / Account Dropdown */}
          <div style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                  }}
                >
                  {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                </div>
                <span className="hide-mobile" style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.first_name || user.username}
                </span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ fontWeight: 700, borderRadius: 'var(--radius-full)' }}>
                <User size={15} />
                Sign In
              </Link>
            )}

            {/* User Dropdown Menu */}
            {showProfileMenu && isAuthenticated && (
              <div
                className="card fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                  zIndex: 120,
                  overflow: 'hidden',
                  padding: '0.5rem 0',
                }}
              >
                <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.925rem' }}>{user.full_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  <span className="badge badge-primary" style={{ marginTop: '0.45rem', fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </div>

                {/* Role-Specific Navigation Menus */}
                {isAdmin ? (
                  // Admin Menu
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700 }}
                    >
                      <ShieldCheck size={16} />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <User size={16} />
                      Users
                    </Link>
                    <Link
                      to="/admin/products"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Package size={16} />
                      Products
                    </Link>
                    <Link
                      to="/admin/orders"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <ShoppingBag size={16} />
                      Orders
                    </Link>
                    <Link
                      to="/admin/reports"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Award size={16} />
                      Reports
                    </Link>
                    <Link
                      to="/profile/settings"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </>
                ) : isSeller ? (
                  // Seller Menu
                  <>
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 700 }}
                    >
                      <Store size={16} />
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/seller/products"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Package size={16} />
                      Products
                    </Link>
                    <Link
                      to="/seller/orders"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <ShoppingBag size={16} />
                      Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/profile/settings"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </>
                ) : (
                  // Customer Menu
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Package size={16} />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Heart size={16} />
                      Wishlist
                    </Link>
                    <Link
                      to="/profile/addresses"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <MapPin size={16} />
                      Addresses
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowNotifMenu(true);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Bell size={16} />
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                    <Link
                      to="/profile/settings"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 1.15rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.35rem', paddingTop: '0.35rem' }}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.7rem 1.15rem',
                      fontSize: '0.875rem',
                      color: 'var(--danger)',
                      width: '100%',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================
          Mobile Navigation Slide-In Drawer
          ======================================================== */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-xl)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <ShoppingBag size={18} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                  Shop<span style={{ color: 'var(--primary)' }}>Sphere</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User section in drawer */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
              {isAuthenticated ? (
                <div>
                  <div style={{ fontWeight: 700 }}>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flexGrow: 1 }}>Profile</Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Welcome to ShopSphere</div>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>Sign In / Register</Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shop Departments</div>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', fontWeight: 600 }}>
                All Catalog
              </Link>
              <Link to="/products?discount=20" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: '#EF4444', fontWeight: 600 }}>
                <Flame size={18} /> Today's Lightning Deals
              </Link>
              <Link to="/products?ordering=newest" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: 'var(--accent)', fontWeight: 600 }}>
                <Sparkles size={18} /> New Arrivals
              </Link>
              <Link to="/products?ordering=popularity" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: '#F59E0B', fontWeight: 600 }}>
                <Award size={18} /> Best Sellers
              </Link>
            </nav>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>My Services</div>
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldCheck size={16} /> Admin Portal
                </Link>
              )}
              {isSeller && (
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Store size={16} /> Seller Portal
                </Link>
              )}
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.9rem' }}>
                <Package size={16} /> Orders & Returns
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.9rem' }}>
                <Heart size={16} /> Wishlist ({wishlistCount})
              </Link>
              {!isSeller && !isAdmin && (
                <Link to="/seller/register" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Store size={16} /> Become a Seller (0% Fee)
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pincode Change Modal */}
      {showPincodeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowPincodeModal(false)}
        >
          <div
            className="card fade-in"
            style={{ width: '90%', maxWidth: '380px', padding: '1.75rem', backgroundColor: 'var(--bg-secondary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select Delivery Location</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Enter your area 6-digit Pincode to check shipping speed and available warehouse stock.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                style={{ flexGrow: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (pincodeInput.length === 6) {
                    setPincode(pincodeInput);
                    setShowPincodeModal(false);
                    toast.success(`Delivery pincode set to ${pincodeInput}`);
                  } else {
                    toast.error('Please enter a valid 6-digit pincode');
                  }
                }}
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => setShowPincodeModal(false)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Responsive CSS for Header */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
};
