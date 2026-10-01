import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductSort } from '../components/products/ProductSort';
import { EmptyState } from '../components/common/EmptyState';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle, RotateCcw } from 'lucide-react';

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter params from URL or state
  const selectedCategory = slug || searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minRating = searchParams.get('min_rating') || '';
  const minDiscount = searchParams.get('discount') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const ordering = searchParams.get('ordering') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Load Categories & Brands once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, brnds] = await Promise.all([
          categoryService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(cats || []);
        setBrands(brnds || []);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch products whenever search params change
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        ordering: ordering || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        min_rating: minRating || undefined,
        min_discount: minDiscount || undefined,
        in_stock: inStockOnly ? 'true' : undefined,
        featured: searchParams.get('featured') || undefined,
      };

      const data = await productService.getProducts(params);
      // Support both Direct Array and Paginated Response formats
      const items = Array.isArray(data) ? data : (data?.results || []);
      const count = Array.isArray(data) ? data.length : (data?.count !== undefined ? data.count : items.length);

      setProducts(items);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading products from Django API:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load products from server. Please retry.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, slug]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to first page
    setSearchParams(next);
  };

  const handlePriceChange = (min, max) => {
    const next = new URLSearchParams(searchParams);
    if (min) next.set('min_price', min);
    else next.delete('min_price');

    if (max) next.set('max_price', max);
    else next.delete('max_price');

    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  const matchedCategory = categories.find((c) => c.slug === selectedCategory);
  const displayCategoryTitle = matchedCategory
    ? matchedCategory.name
    : selectedCategory
      ? selectedCategory
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'All Products';

  return (
    <div className="container" style={{ marginTop: '1.5rem' }}>
      
      {/* Top Banner / Heading */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>
            {selectedCategory ? `${displayCategoryTitle} Products` : 'All Products Catalog'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {products.length} of {totalCount} products
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
            id="mobile-filter-btn"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          {/* Sort Dropdown */}
          <ProductSort
            value={ordering}
            onChange={(val) => updateParam('ordering', val)}
          />
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
        
        {/* Filters (Desktop Sidebar + Mobile Drawer) */}
        <ProductFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          onSelectCategory={(val) => updateParam('category', val)}
          selectedBrand={selectedBrand}
          onSelectBrand={(val) => updateParam('brand', val)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onChangePrice={handlePriceChange}
          minRating={minRating}
          onSelectRating={(val) => updateParam('min_rating', val)}
          minDiscount={minDiscount}
          onSelectDiscount={(val) => updateParam('discount', val)}
          inStockOnly={inStockOnly}
          onToggleInStock={(val) => updateParam('in_stock', val ? 'true' : '')}
          onClearFilters={clearAllFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Product Grid Area */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
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
                margin: '1.5rem 0',
              }}
            >
              <div style={{ color: 'var(--danger, #EF4444)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <AlertCircle size={48} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Load Products</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.75rem' }}>
                {error}
              </p>
              <button
                onClick={() => fetchFilteredProducts()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RotateCcw size={16} />
                Retry Loading Products
              </button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Match Your Filters"
              description="Try resetting your price range, clearing brand selections, or searching for other items."
              actionText="Reset Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination Controls */}
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
                    onClick={() => updateParam('page', String(page - 1))}
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
                    onClick={() => updateParam('page', String(page + 1))}
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
      </div>

      <style>{`
        @media (max-width: 900px) {
          #mobile-filter-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
};
