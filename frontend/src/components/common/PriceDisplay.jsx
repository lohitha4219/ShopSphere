import React from 'react';

export const PriceDisplay = ({ price, discountPrice = null, discountPercentage = 0, size = 'md' }) => {
  const numPrice = Number(price) || 0;
  const numDiscountPrice = discountPrice ? Number(discountPrice) : null;
  const hasDiscount = numDiscountPrice && numDiscountPrice < numPrice;

  const currentPrice = hasDiscount ? numDiscountPrice : numPrice;
  const originalPrice = numPrice;

  const fontSizes = {
    sm: { main: '1rem', strike: '0.8rem', badge: '0.7rem' },
    md: { main: '1.25rem', strike: '0.9rem', badge: '0.75rem' },
    lg: { main: '1.75rem', strike: '1.1rem', badge: '0.85rem' },
  };

  const currentSize = fontSizes[size] || fontSizes.md;

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: currentSize.main, fontWeight: 700, color: 'var(--text-primary)' }}>
        ₹{currentPrice.toLocaleString('en-IN')}
      </span>

      {hasDiscount && (
        <>
          <span
            style={{
              fontSize: currentSize.strike,
              color: 'var(--text-muted)',
              textDecoration: 'line-through',
            }}
          >
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>

          <span
            className="badge badge-success"
            style={{ fontSize: currentSize.badge, padding: '0.15rem 0.45rem' }}
          >
            {discountPercentage > 0 ? `${discountPercentage}% OFF` : 'SAVINGS'}
          </span>
        </>
      )}
    </div>
  );
};
