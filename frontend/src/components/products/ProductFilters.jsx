import React from 'react';
import { Filter, X, Check, RotateCcw } from 'lucide-react';

export const ProductFilters = ({
  categories = [],
  brands = [],
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  minPrice,
  maxPrice,
  onChangePrice,
  minRating,
  onSelectRating,
  minDiscount,
  onSelectDiscount,
  inStockOnly,
  onToggleInStock,
  onClearFilters,
  isOpen = false,
  onClose = () => {},
}) => {
  const discountOptions = [10, 20, 30, 50];
  const ratingOptions = [4, 3, 2];

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header with Clear All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '1rem' }}>
          <Filter size={18} color="var(--primary)" />
          Filters
        </div>
        <button
          onClick={onClearFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            color: 'var(--primary)',
            fontWeight: 600,
          }}
        >
          <RotateCcw size={13} />
          Reset All
        </button>
      </div>

      {/* In Stock Only Switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>In Stock Only</span>
        <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px' }}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: inStockOnly ? 'var(--primary)' : 'var(--border-strong)',
              transition: '0.3s',
              borderRadius: '24px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: inStockOnly ? '20px' : '3px',
                bottom: '3px',
                backgroundColor: '#FFFFFF',
                transition: '0.3s',
                borderRadius: '50%',
              }}
            />
          </span>
        </label>
      </div>

      {/* Categories */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Category</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
          <div
            onClick={() => onSelectCategory('')}
            style={{
              fontSize: '0.85rem',
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: !selectedCategory ? 700 : 400,
              backgroundColor: !selectedCategory ? 'var(--primary-light)' : 'transparent',
              color: !selectedCategory ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            All Categories
          </div>
          {categories.map((c) => {
            const isSelected = selectedCategory === (c.slug || String(c.id));
            return (
              <div
                key={c.id}
                onClick={() => onSelectCategory(c.slug || String(c.id))}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 400,
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{c.name}</span>
                {c.product_count !== undefined && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.product_count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Price Range (₹)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onChangePrice(e.target.value, maxPrice)}
              style={{ width: '100%', padding: '0.45rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max</label>
            <input
              type="number"
              placeholder="50000"
              value={maxPrice}
              onChange={(e) => onChangePrice(minPrice, e.target.value)}
              style={{ width: '100%', padding: '0.45rem' }}
            />
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Brand</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '160px', overflowY: 'auto' }}>
            <div
              onClick={() => onSelectBrand('')}
              style={{
                fontSize: '0.85rem',
                padding: '0.3rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: !selectedBrand ? 700 : 400,
                color: !selectedBrand ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              All Brands
            </div>
            {brands.map((b) => {
              const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
              return (
                <div
                  key={b}
                  onClick={() => onSelectBrand(isSelected ? '' : b)}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.3rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 400,
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      border: '1.5px solid var(--border-strong)',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={11} color="#FFFFFF" />}
                  </span>
                  <span>{b}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Minimum Rating</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {ratingOptions.map((r) => {
            const isSelected = Number(minRating) === r;
            return (
              <div
                key={r}
                onClick={() => onSelectRating(isSelected ? '' : r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--warning-bg)' : 'transparent',
                  color: isSelected ? '#B45309' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                <span>{r}★ & above</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Discount</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {discountOptions.map((d) => {
            const isSelected = Number(minDiscount) === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDiscount(isSelected ? '' : d)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {d}% or more
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="card hide-mobile"
        style={{
          width: '270px',
          minWidth: '270px',
          padding: '1.25rem',
          height: 'fit-content',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onClick={onClose}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: 'var(--bg-secondary)',
              padding: '1.5rem',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Filters</span>
              <button onClick={onClose} style={{ padding: '0.35rem' }}>
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
