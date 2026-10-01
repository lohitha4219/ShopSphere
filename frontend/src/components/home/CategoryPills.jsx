import React from 'react';
import { Link } from 'react-router-dom';
import { ProductImage } from '../common/ProductImage';

export const CategoryPills = ({ categories = [] }) => {
  return (
    <div style={{ margin: '2.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Explore Categories</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Find what you love across curated departments
          </p>
        </div>
        <Link to="/products" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
          View All Departments &rarr;
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '1rem',
        }}
      >
        {categories.map((cat) => {
          const categoryImage = cat.image || `/images/categories/${cat.slug}.jpg`;

          return (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug || cat.id}`}
              className="card card-hover"
              style={{
                padding: '1rem 0.75rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                transition: 'all var(--transition-fast)',
                overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                }}
              >
                <ProductImage
                  src={categoryImage}
                  alt={cat.name}
                  fallbackType="category"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  className="category-card-img"
                />
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {cat.product_count !== undefined ? `${cat.product_count} Items` : 'Browse'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

