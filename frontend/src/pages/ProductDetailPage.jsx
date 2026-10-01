import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, ShoppingBag, Zap, Truck,
  Check, Star, ThumbsUp, Store
} from 'lucide-react';
import { ProductGallery } from '../components/products/ProductGallery';
import { ProductCard } from '../components/common/ProductCard';
import { RatingStars } from '../components/common/RatingStars';
import { Skeleton } from '../components/common/Skeleton';
import { productService } from '../services/product.service';
import { reviewService } from '../services/review.service';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Active Tab: description, specs, reviews, seller
  const [activeTab, setActiveTab] = useState('description');

  // Reviews Data
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    review_count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    user_can_review: false,
    user_has_reviewed: false,
    reviews: [],
  });

  // New Review Form
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Delivery Pincode checker
  const [checkPincode, setCheckPincode] = useState('560038');
  const [deliveryStatus, setDeliveryStatus] = useState('Free Delivery by Tomorrow');

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const prod = await productService.getProduct(slug);
        setProduct(prod);
        if (prod.variants?.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }

        const [similar, reviews] = await Promise.all([
          productService.getSimilar(slug),
          reviewService.getProductReviews(slug),
        ]);
        setSimilarProducts(similar || []);
        setReviewsData(reviews || {});
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <Skeleton height="450px" borderRadius="var(--radius-xl)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton width="40%" height="24px" />
            <Skeleton width="90%" height="36px" />
            <Skeleton width="30%" height="28px" />
            <Skeleton width="50%" height="32px" />
            <Skeleton height="100px" />
            <Skeleton height="50px" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The item you are looking for does not exist or has been removed.
        </p>
        <Link to="/products" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);
  const inStock = product.in_stock !== false && (product.stock_quantity === undefined || product.stock_quantity > 0 || (selectedVariant && selectedVariant.stock_quantity > 0));

  // Compute price based on variant
  const basePrice = Number(product.price);
  const variantAdj = selectedVariant ? Number(selectedVariant.price_adjustment) : 0;
  const currentFinalPrice = (product.discount_price ? Number(product.discount_price) : basePrice) + variantAdj;
  const originalPrice = basePrice + variantAdj;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        directItem: {
          product,
          variant: selectedVariant,
          quantity,
        },
      },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setReviewSubmitting(true);
      await reviewService.addReview(slug, {
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });
      setReviewMessage('Review submitted successfully!');
      // Reload reviews
      const updated = await reviewService.getProductReviews(slug);
      setReviewsData(updated);
      setNewTitle('');
      setNewComment('');
    } catch (err) {
      setReviewMessage(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      const updated = await reviewService.getProductReviews(slug);
      setReviewsData(updated);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Grid: Gallery on Left + Buy Box on Right */}
      <div className="product-detail-grid">
        
        {/* Left: Product Gallery */}
        <ProductGallery
          thumbnail={product.thumbnail}
          images={product.images}
          productName={product.name}
        />

        {/* Right: Product Details & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Brand & Title */}
          <div>
            {product.brand && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {product.brand}
              </div>
            )}
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              SKU: {product.sku}
            </div>
          </div>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <RatingStars rating={product.rating} count={product.review_count} size={18} />
            <span style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600 }}>
              Verified Buyers
            </span>
          </div>

          {/* Price Box */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{currentFinalPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > currentFinalPrice && (
                <>
                  <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                    {product.discount_percentage}% OFF
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Inclusive of all taxes. Free shipping on this order.
            </div>
          </div>

          {/* Variants Selector (if product has variants) */}
          {product.variants?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Select {product.variants[0].variant_type}: <span style={{ color: 'var(--primary)' }}>{selectedVariant?.name}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                      }}
                    >
                      {v.name}
                      {Number(v.price_adjustment) !== 0 && (
                        <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', opacity: 0.8 }}>
                          (+₹{Number(v.price_adjustment)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Quantity:</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: '0.85rem', color: inStock ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {inStock ? 'In Stock (Ready to dispatch)' : 'Currently Out of Stock'}
            </span>
          </div>

          {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn btn-secondary btn-lg"
              style={{ flexGrow: 1 }}
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="btn btn-primary btn-lg"
              style={{ flexGrow: 1 }}
            >
              <Zap size={20} />
              Buy Now
            </button>

            <button
              onClick={async () => {
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
              }}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: isFav ? 'var(--danger-bg)' : 'var(--bg-secondary)',
                color: isFav ? 'var(--danger)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={22} fill={isFav ? 'var(--danger)' : 'none'} />
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              <Truck size={18} color="var(--primary)" />
              Delivery Options
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Enter Pincode"
                value={checkPincode}
                onChange={(e) => setCheckPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ width: '150px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDeliveryStatus(checkPincode.length === 6 ? 'Free Express Delivery by Tomorrow' : 'Please enter valid 6 digits')}
              >
                Check
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600 }}>
              {deliveryStatus}
            </div>
          </div>

          {/* Seller Snapshot */}
          {product.seller && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)' }}>
              <Store size={20} color="var(--accent)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sold by: </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{product.seller.business_name}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Merchant</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Tabs Section: Description, Specs, Reviews, Seller */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-subtle)', gap: '2rem' }}>
          {[
            { id: 'description', label: 'Product Details' },
            { id: 'reviews', label: `Customer Reviews (${product.review_count || 0})` },
            { id: 'seller', label: 'Seller & Shipping Policy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.85rem 0.5rem',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div style={{ padding: '2rem 0', maxWidth: '850px', lineHeight: 1.7, fontSize: '0.975rem', color: 'var(--text-secondary)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              About this item
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>{product.description}</p>

            {product.short_description && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Highlights
                </div>
                <div>{product.short_description}</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ padding: '2rem 0' }}>
            <div className="product-reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '3rem', alignItems: 'flex-start' }}>
              
              {/* Rating summary & distribution */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Customer Ratings</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{product.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>out of 5</span>
                </div>
                <RatingStars rating={product.rating} size={20} showNumber={false} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
                  Based on {product.review_count} verified reviews
                </div>

                {/* Rating bars */}
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsData.distribution?.[stars] || 0;
                  const total = product.review_count || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', margin: '0.35rem 0' }}>
                      <span style={{ width: '40px' }}>{stars} star</span>
                      <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#F59E0B' }} />
                      </div>
                      <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Reviews List & Write Review form */}
              <div>
                {/* Write Review Section */}
                <div
                  className="card"
                  style={{
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Share Your Product Experience
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Help other shoppers make informed decisions. Only verified buyers can submit reviews.
                  </p>

                  {reviewMessage && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {reviewMessage}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                        Your Rating:
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            style={{ padding: '0.25rem' }}
                          >
                            <Star
                              size={24}
                              style={{
                                fill: star <= newRating ? '#F59E0B' : 'transparent',
                                color: star <= newRating ? '#F59E0B' : 'var(--text-muted)',
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Review Headline</label>
                      <input
                        type="text"
                        placeholder="e.g. Excellent build quality, sounds amazing!"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Detailed Feedback</label>
                      <textarea
                        rows={3}
                        placeholder="What did you like or dislike? How was the performance or fit?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Customer Review'}
                    </button>
                  </form>
                </div>

                {/* Existing Reviews */}
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Verified Reviews ({reviewsData.reviews?.length || 0})
                </h4>
                {reviewsData.reviews?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to review!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviewsData.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="card"
                        style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <RatingStars rating={rev.rating} size={15} showNumber={false} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                          {rev.title || 'Verified Purchase'}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                          {rev.comment}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            By {rev.user_name || 'Customer'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMarkHelpful(rev.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          >
                            <ThumbsUp size={12} />
                            Helpful ({rev.helpful_count || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Seller Info & Return Policy */}
        {activeTab === 'seller' && (
          <div style={{ padding: '2rem 0', maxWidth: '750px', lineHeight: 1.6 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Merchant Information</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              This item is stocked and supplied directly by verified merchant <strong>{product.seller?.business_name}</strong>.
              All items undergo a 3-point authenticity check before dispatch.
            </p>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>ShopSphere Guarantee & Returns</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} color="var(--success)" />
                <strong>7-Day Easy Return:</strong> If the product is damaged, wrong, or not as described, return it for a full instant refund.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} color="var(--success)" />
                <strong>100% Original Brand Warranty:</strong> Manufacturer warranty cards included inside the box.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={18} color="var(--success)" />
                <strong>Contact Support:</strong> Need assistance? 24/7 priority chat support available in your profile.
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section style={{ margin: '4rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Similar Products You Might Like
          </h2>
          <div className="grid-4">
            {similarProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Responsive Styles */}
      <style>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: minmax(320px, 1fr) minmax(320px, 1.15fr);
          gap: 3rem;
          align-items: flex-start;
        }
        @media (max-width: 900px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};
