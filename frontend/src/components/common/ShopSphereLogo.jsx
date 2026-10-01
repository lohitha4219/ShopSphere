import React from 'react';
import { Link } from 'react-router-dom';

export const ShopSphereLogo = ({
  size = 'md',
  to = '/',
  iconOnly = false,
  showTagline = false,
  tagline = 'Everything You Need. Delivered Simply.',
  className = '',
  style = {}
}) => {
  const sizes = {
    sm: { icon: 28, title: '1.1rem', tagline: '0.65rem', gap: '0.5rem' },
    md: { icon: 36, title: '1.4rem', tagline: '0.72rem', gap: '0.65rem' },
    lg: { icon: 46, title: '1.75rem', tagline: '0.8rem', gap: '0.8rem' },
    xl: { icon: 56, title: '2.25rem', tagline: '0.875rem', gap: '0.95rem' },
  };

  const s = sizes[size] || sizes.md;

  const iconSvg = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, transition: 'transform var(--transition-fast)' }}
      className="shopsphere-brand-icon"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ssLogoSphereGrad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="0.45" stopColor="#2563EB" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="ssLogoOrbitGrad" x1="8" y1="20" x2="56" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="ssLogoBagGrad" x1="20" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>

      {/* Spherical Base Globe */}
      <circle cx="32" cy="32" r="28" fill="url(#ssLogoSphereGrad)" />

      {/* Latitudinal Curvature Depth */}
      <ellipse cx="32" cy="32" rx="16" ry="28" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.22" />
      <line x1="4" y1="32" x2="60" y2="32" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.18" />

      {/* Cosmic Shopping Orbit */}
      <ellipse cx="32" cy="32" rx="30" ry="11" transform="rotate(-26 32 32)" stroke="url(#ssLogoOrbitGrad)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="140 25" />
      <circle cx="56" cy="20" r="3.5" fill="#FBBF24" />

      {/* Shopping Bag Handle */}
      <path d="M25 24C25 20.134 28.134 17 32 17C35.866 17 39 20.134 39 24" stroke="url(#ssLogoBagGrad)" strokeWidth="3" strokeLinecap="round" />

      {/* Shopping Bag Body */}
      <path d="M20 24.5H44L41.2 46C41.05 47.1 40.15 48 39 48H25C23.85 48 22.95 47.1 22.8 46L20 24.5Z" fill="url(#ssLogoBagGrad)" />

      {/* Bag Dimension Contour */}
      <path d="M20 24.5L25 30H39L44 24.5" fill="#CBD5E1" opacity="0.6" />

      {/* Sparkling Tech Star */}
      <path d="M32 32L33.4 36.2L37.5 37.5L33.4 38.8L32 43L30.6 38.8L26.5 37.5L30.6 36.2L32 32Z" fill="#2563EB" />
    </svg>
  );

  const content = (
    <div
      className={`shopsphere-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        textDecoration: 'none',
        userSelect: 'none',
        ...style
      }}
    >
      {iconSvg}

      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span
            style={{
              fontFamily: "var(--font-display, 'Outfit', 'Inter', sans-serif)",
              fontSize: s.title,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            Shop<span style={{ color: 'var(--primary, #2563EB)' }}>Sphere</span>
          </span>

          {showTagline && (
            <span
              style={{
                fontSize: s.tagline,
                color: 'var(--text-muted, #64748B)',
                fontWeight: 500,
                letterSpacing: '0.015em',
                marginTop: '1px',
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default ShopSphereLogo;
