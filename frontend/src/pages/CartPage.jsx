import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, X, Heart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { ProductImage } from '../components/common/ProductImage';
import { toast } from 'react-toastify';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim());
      toast.success(`Coupon "${couponInput.trim().toUpperCase()}" applied!`);
      setCouponInput('');
    } catch (err) {
      const errTxt = err.response?.data?.error || 'Invalid or expired coupon code.';
      setCouponError(errTxt);
      toast.error(errTxt);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.info('Coupon discount removed');
    } catch {
      // Ignore
    }
  };

  const handleMoveToWishlist = async (productId, itemId) => {
    try {
      await toggleWishlist(productId);
      await removeFromCart(itemId);
      toast.success('Moved product to your wishlist.');
    } catch {
      toast.error('Unable to move product to wishlist.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Please Login to View Your Cart"
          description="Your cart items are saved securely to your ShopSphere account. Sign in to view and checkout."
          actionText="Login to Your Account"
          actionLink="/login"
        />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty."
          description="Discover products and add your favorites."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Shopping Cart ({cart.total_items_count} item{cart.total_items_count === 1 ? '' : 's'})
      </h1>

      <div
        className="cart-responsive-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '2.5rem',
          alignItems: 'flex-start'
        }}
      >
        {/* ========================================================= */}
        {/* LEFT COLUMN: Cart Items List                              */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const itemImage = product.thumbnail || product.images?.[0]?.image;
            const sellerName = product.seller_name || product.seller?.business_name || 'ShopSphere Verified';
            const isFav = isInWishlist(product.id);

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {/* Product Image */}
                <Link
                  to={`/products/${product.slug || product.id}`}
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    padding: '6px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <ProductImage
                    src={itemImage}
                    alt={product.name}
                    fallbackType="product"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Link>

                {/* Details */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  {product.brand && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {product.brand}
                    </div>
                  )}

                  <Link
                    to={`/products/${product.slug || product.id}`}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'block',
                      marginBottom: '0.35rem',
                      textDecoration: 'none',
                      lineHeight: 1.35
                    }}
                  >
                    {product.name}
                  </Link>

                  {/* Variant info */}
                  {item.variant && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {item.variant.variant_type}: {item.variant.name}
                    </div>
                  )}

                  {/* Seller info (Requirement 21) */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Seller: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sellerName}</span>
                  </div>

                  {/* Price & Discount */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{Number(item.unit_price).toLocaleString('en-IN')}
                    </span>
                    {Number(item.original_unit_price) > Number(item.unit_price) && (
                      <>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{Number(item.original_unit_price).toLocaleString('en-IN')}
                        </span>
                        {product.discount_percentage > 0 && (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                            {product.discount_percentage}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Quantity selector & Actions row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Quantity Selector */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--surface-secondary)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-primary)'
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-primary)'
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Wishlist Button (Requirement 21) */}
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(product.id, item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isFav ? 'var(--danger)' : 'var(--text-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                      <span>{isFav ? 'In Wishlist' : 'Save to Wishlist'}</span>
                    </button>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--danger)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <Link to="/products" className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Coupon & Price Details Summary              */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Coupon Box */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              <Tag size={16} color="var(--primary)" />
              <span>Apply Coupon Code</span>
            </div>

            {cart.coupon_code ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--success-bg)',
                  border: '1px dashed var(--success)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>
                    {cart.coupon_code} APPLIED
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Saved ₹{Number(cart.coupon_discount).toLocaleString('en-IN')} on this order
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ color: 'var(--danger)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Remove coupon"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="e.g. WELCOME50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{
                    flexGrow: 1,
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={couponLoading}
                  style={{ borderRadius: '8px', fontWeight: 600 }}
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
                {couponError}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
              Applicable coupons: <strong>WELCOME50</strong>, <strong>FLAT100</strong>, <strong>FESTIVE20</strong>
            </div>
          </div>

          {/* Price Summary (Requirement 21) */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem'
            }}>
              Price Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({cart.total_items_count} items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{Number(cart.subtotal).toLocaleString('en-IN')}</span>
              </div>

              {/* Discount */}
              {Number(cart.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-₹{Number(cart.discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Coupon */}
              {Number(cart.coupon_discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Coupon ({cart.coupon_code})</span>
                  <span>-₹{Number(cart.coupon_discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Delivery */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery</span>
                <span>
                  {Number(cart.delivery_fee) === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    <span style={{ color: 'var(--text-primary)' }}>₹{Number(cart.delivery_fee)}</span>
                  )}
                </span>
              </div>

              {/* Total */}
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.85rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}
              >
                <span>Total Amount</span>
                <span>₹{Number(cart.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '1.5rem',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={15} color="var(--success)" />
              <span>Safe and Secure Payments &bull; Easy Returns</span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
