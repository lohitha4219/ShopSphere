import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { ProductImage } from '../components/common/ProductImage';

export const WishlistPage = () => {
  const { wishlist, toggleWishlist, moveToCart } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <EmptyState
          icon={Heart}
          title="Please Login to View Your Wishlist"
          description="Save all your favorite electronics, styles, and essentials in one place."
          actionText="Login to Your Account"
          actionLink="/login"
        />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our best sellers and deals, and click the heart icon on any product to save it here."
          actionText="Discover Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        My Wishlist ({wishlist.length} item{wishlist.length === 1 ? '' : 's'})
      </h1>

      <div className="grid-4">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Product Image */}
              <Link
                to={`/products/${product.slug || product.id}`}
                style={{
                  display: 'block',
                  paddingTop: '80%',
                  position: 'relative',
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                <ProductImage
                  src={product.thumbnail || product.images?.[0]?.image}
                  alt={product.name}
                  fallbackType="product"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '0.75rem',
                  }}
                />
              </Link>

              {/* Product Info */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {product.brand && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {product.brand}
                  </div>
                )}

                <Link
                  to={`/products/${product.slug || product.id}`}
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    margin: '0.35rem 0 0.5rem',
                  }}
                >
                  {product.name}
                </Link>

                <PriceDisplay
                  price={product.price}
                  discountPrice={product.discount_price}
                  discountPercentage={product.discount_percentage}
                  size="sm"
                />

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => moveToCart(product.id)}
                    className="btn btn-primary btn-sm"
                    style={{ flexGrow: 1 }}
                  >
                    <ShoppingBag size={14} />
                    Move to Cart
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
