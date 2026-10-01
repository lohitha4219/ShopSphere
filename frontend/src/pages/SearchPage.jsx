import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { ProductSort } from '../components/products/ProductSort';
import { EmptyState } from '../components/common/EmptyState';
import { productService } from '../services/product.service';
import { Search, Sparkles, AlertCircle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const ordering = searchParams.get('ordering') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const doSearch = async () => {
    if (!query.trim()) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts({
        search: query,
        ordering: ordering || undefined,
        page,
      });
      const items = Array.isArray(data) ? data : (data?.results || []);
      const count = Array.isArray(data) ? data.length : (data?.count !== undefined ? data.count : items.length);
      setProducts(items);
      setTotalCount(count);
    } catch (err) {
      console.error('Search error from Django API:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to search products. Please retry.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch();
  }, [query, ordering, page]);

  const handleSortChange = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('ordering', val);
    else next.delete('ordering');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Search size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
              Search Results for <span style={{ color: 'var(--primary)' }}>"{query}"</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Found {totalCount} matching product{totalCount === 1 ? '' : 's'}
          </p>
        </div>

        {products.length > 0 && (
          <ProductSort value={ordering} onChange={handleSortChange} />
        )}
      </div>

      {loading ? (
        <div className="grid-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            margin: '2rem 0',
          }}
        >
          <div style={{ color: 'var(--danger, #EF4444)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <AlertCircle size={48} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Complete Search</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            {error}
          </p>
          <button
            onClick={() => doSearch()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={16} />
            Retry Search
          </button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No results found for "${query}"`}
          description="Check your spelling or try searching for generic terms like 'headphones', 'shirt', 'shoes', or 'laptop'."
          actionText="Browse All Products"
          actionLink="/products"
        />
      ) : (
        <>
          <div className="grid-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '3rem',
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 0.75rem' }}>
                Page {page} of {totalPages}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
