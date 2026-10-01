import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, CreditCard, Lock } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
        paddingTop: '3.5rem',
      }}
    >
      <div className="container">
        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Free & Fast Delivery</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On eligible orders across India</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>7-Day Easy Returns</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant refund guarantee</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>100% Genuine Products</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sourced from verified sellers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Headphones size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>24/7 Customer Help</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dedicated support anytime</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            padding: '3rem 0',
            fontSize: '0.9rem',
          }}
        >
          {/* Brand Info Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <Logo size="md" showTagline={true} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              ShopSphere is your trusted online destination for quality electronics, modern fashion, home essentials, and lifestyle products with transparent pricing and fast pan-India delivery.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Lock size={14} color="var(--success)" />
              <span>256-Bit SSL Encrypted & Secure</span>
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              ABOUT
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About ShopSphere</Link></li>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact</Link></li>
              <li><Link to="/seller/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Careers</Link></li>
            </ul>
          </div>

          {/* CUSTOMER */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              CUSTOMER
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>My Account</Link></li>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Orders</Link></li>
              <li><Link to="/wishlist" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Wishlist</Link></li>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Returns</Link></li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              HELP
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/checkout" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Payments</Link></li>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Shipping</Link></li>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cancellation</Link></li>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</Link></li>
            </ul>
          </div>

          {/* SELLER */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              SELLER
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/seller/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Become a Seller</Link></li>
              <li><Link to="/seller/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Seller Dashboard</Link></li>
              <li><Link to="/seller/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Seller Policies</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              LEGAL
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</Link></li>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '1.5rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © 2026 ShopSphere. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supported Payment Options:</span>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>UPI</span>
            <span className="badge badge-accent" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Cards</span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>NetBanking</span>
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
