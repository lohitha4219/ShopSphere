import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Zap, CheckCircle2, Star } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { PriceDisplay } from './PriceDisplay';
import { ProductImage } from './ProductImage';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const ProductCard = ({ product }) => {
  if (!product || !product.id) {
    return null;
  }

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addingCart, setAddingCart] = useState(false);

  const isFav = isInWishlist(product.id);
  const inStock = product.in_stock !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to save items to your wishlist');
      navigate('/login');
      return;
    }
    await toggleWishlist(product.id);
    if (!isFav) {
      toast.success('Added to your Wishlist!');
    } else {
      toast.info('Removed from your Wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    try {
      setAddingCart(true);
      await addToCart(product.id, null, 1);
      toast.success(`${product.name} added to your cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with direct checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        directItem: {
          product,
          quantity: 1,
        },
      },
    });
  };

  const imageSrc = product.thumbnail || product.primary_image || product.images?.[0]?.image || product.image;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-subtle)',
      }}
    >
      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistClick}
        aria-label="Save to Wishlist"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          zIndex: 10,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isFav ? 'var(--danger-bg)' : 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isFav ? 'var(--danger)' : 'var(--text-muted)',
          border: '1px solid var(--border-subtle)',
          transition: 'transform 180ms ease, background-color 180ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Heart size={18} fill={isFav ? 'var(--danger)' : 'none'} />
      </button>

      {/* Floating Badges */}
      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {product.is_best_seller && (
          <span className="badge badge-warning" style={{ fontSize: '0.68rem', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)' }}>
            Best Seller
          </span>
        )}
        {product.is_featured && !product.is_best_seller && (
          <span className="badge badge-accent" style={{ fontSize: '0.68rem', boxShadow: '0 2px 6px var(--accent-glow)' }}>
            Featured
          </span>
        )}
        {product.discount_percentage > 0 && !product.is_best_seller && !product.is_featured && (
          <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>
            {product.discount_percentage}% OFF
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link
        to={`/products/${product.slug || product.id}`}
        style={{
          display: 'block',
          width: '100%',
          paddingTop: '82%',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <ProductImage
          src={imageSrc}
          alt={product.name}
          fallbackType="product"
          loading="lazy"
          className="product-img"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '0.85rem',
          }}
        />
      </Link>

      {/* Product Content */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {product.brand && (
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
            {product.brand}
          </div>
        )}

        <Link
          to={`/products/${product.slug || product.id}`}
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '0.65rem',
            minHeight: '2.6rem',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div style={{ marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RatingStars rating={product.rating} count={product.review_count} size={14} />
        </div>

        {/* Price & Discount */}
        <div style={{ marginBottom: '0.75rem' }}>
          <PriceDisplay
            price={product.price}
            discountPrice={product.discount_price}
            discountPercentage={product.discount_percentage}
            size="md"
          />
        </div>

        {/* Delivery & Stock indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '1.15rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal)', fontWeight: 600 }}>
            <CheckCircle2 size={13} />
            Free Delivery
          </span>
          <span style={{ fontWeight: 700, color: inStock ? 'var(--success)' : 'var(--danger)' }}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingCart}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.825rem', fontWeight: 700 }}
          >
            <ShoppingBag size={14} />
            {addingCart ? 'Adding...' : 'Add'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', fontSize: '0.825rem', fontWeight: 700 }}
          >
            <Zap size={14} />
            Buy Now
          </button>
        </div>
      </div>

      <style>{`
        .card:hover .product-img {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
};
