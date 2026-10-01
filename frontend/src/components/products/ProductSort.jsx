import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export const ProductSort = ({ value, onChange }) => {
  const options = [
    { value: '', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'discount', label: 'Highest Discount' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <ArrowUpDown size={15} color="var(--text-muted)" />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }} className="hide-mobile">
        Sort By:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
