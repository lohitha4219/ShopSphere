import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count = null, size = 16, showNumber = true }) => {
  const numericRating = Number(rating) || 0;
  
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(numericRating);
          return (
            <Star
              key={star}
              size={size}
              style={{
                fill: filled ? '#F59E0B' : 'transparent',
                color: filled ? '#F59E0B' : 'var(--text-muted)',
                marginRight: '1px',
              }}
            />
          );
        })}
      </div>
      {showNumber && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {numericRating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};
