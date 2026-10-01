import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryPills } from '../components/home/CategoryPills';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import {
  Flame, Sparkles, TrendingUp, Store, ArrowRight, ShieldCheck,
  Clock, Truck, RotateCcw, Tag, CheckCircle2, Headphones,
  Star, ThumbsUp, Award, Zap, HeartHandshake, ShieldAlert, AlertCircle
} from 'lucide-react';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Countdown timer for Deals of the day
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, feat, deals, best, prodsRes] = await Promise.all([
        categoryService.getCategories(),
        productService.getFeatured(),
        productService.getDeals(),
        productService.getBestSellers(),
        productService.getProducts({ page_size: 40 }),
      ]);
      const parseList = (res) => (Array.isArray(res) ? res : (res?.results || []));
      setCategories(parseList(cats));
      setFeaturedProducts(parseList(feat));
      setDealProducts(parseList(deals));
      setBestSellers(parseList(best));
      setAllProducts(parseList(prodsRes));
    } catch (err) {
      console.error('Error loading home data from Django API:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load store products. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // Filtered department lists
  const isCat = (p, catSlug) => {
    const s = (p.category_slug || p.category?.slug || p.category_name || '').toLowerCase();
    return s.includes(catSlug.toLowerCase());
  };

  const trendingProducts = allProducts.filter(p => p.is_featured || (p.rating && p.rating >= 4.4)).slice(0, 4);
  const newArrivals = allProducts.slice(0, 4);
  const fashionProducts = allProducts.filter(p => isCat(p, 'fashion') || isCat(p, 'clothing') || isCat(p, 'footwear')).slice(0, 4);
  const electronicsProducts = allProducts.filter(p => isCat(p, 'electronic') || isCat(p, 'gadget') || isCat(p, 'audio')).slice(0, 4);
  const homeProducts = allProducts.filter(p => isCat(p, 'home') || isCat(p, 'kitchen') || isCat(p, 'living')).slice(0, 4);
  const beautyProducts = allProducts.filter(p => isCat(p, 'beauty') || isCat(p, 'care') || isCat(p, 'wellness')).slice(0, 4);

  // Customer Reviews Data
  const customerReviews = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Bengaluru, Karnataka',
      rating: 5,
      date: '3 days ago',
      product: 'Noise-Cancelling Wireless Headphones',
      comment: 'Super fast delivery and 100% genuine product. Sound quality is phenomenal and packaging was pristine. ShopSphere is now my go-to shopping app!',
      verified: true
    },
    {
      id: 2,
      name: 'Rahul Verma',
      location: 'New Delhi',
      rating: 5,
      date: '1 week ago',
      product: 'Pure Cotton Slim Fit Casual Shirt',
      comment: 'Great fit and fabric feel is top-notch. Returned another size smoothly and received instant replacement without any headache. Highly recommend.',
      verified: true
    },
    {
      id: 3,
      name: 'Ananya Deshmukh',
      location: 'Pune, Maharashtra',
      rating: 5,
      date: '2 weeks ago',
      product: 'Espresso & Cappuccino Coffee Maker',
      comment: 'Got it on the Deals of the Day promotion at an unbeatable price! Brewing authentic barista-style coffee every morning now.',
      verified: true
    }
  ];

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* 1. HERO BANNER */}
      <HeroCarousel />

      {/* ERROR BANNER IF API CALL FAILED */}
      {error && (
        <div
          className="card"
          style={{
            margin: '1.5rem 0',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="var(--danger, #EF4444)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notice: Could not load some live products</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={() => loadHomeData()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* 2. CATEGORIES */}
      <section style={{ margin: '2.5rem 0' }}>
        <CategoryPills categories={categories} />
      </section>

      {/* 3. DEALS OF THE DAY */}
      <section style={{ margin: '3.5rem 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              }}
            >
              <Flame size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Deals of the Day
                </h2>
                <span className="badge badge-danger" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Limited Time
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Handpicked price drops with guaranteed lowest online prices
              </div>
            </div>
          </div>

          {/* Countdown Clock (Requirement 26) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
            <Clock size={18} color="#EF4444" />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ends in:</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '4px 8px' }}>
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span style={{ fontWeight: 800 }}>:</span>
              <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '4px 8px' }}>
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span style={{ fontWeight: 800 }}>:</span>
              <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '4px 8px' }}>
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (dealProducts.length > 0 ? dealProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color="var(--primary)" />
              Trending Products
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              What other shoppers are discovering and buying right now
            </p>
          </div>
          <Link to="/products?ordering=-rating" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            View All &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (trendingProducts.length > 0 ? trendingProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#F59E0B" />
              Best Sellers
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Top customer favorites ordered by thousands across India
            </p>
          </div>
          <Link to="/products?ordering=popularity" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Explore All &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (bestSellers.length > 0 ? bestSellers : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} color="#10B981" />
              New Arrivals
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Fresh products freshly stocked in our catalog this week
            </p>
          </div>
          <Link to="/products?ordering=-created_at" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Discover More &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (newArrivals.length > 0 ? newArrivals : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 7. FASHION SPOTLIGHT */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Fashion & Apparel
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Trendsetting shirts, ethnic dresses, and premium footwear
            </p>
          </div>
          <Link to="/products?category=fashion" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Shop Fashion &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (fashionProducts.length > 0 ? fashionProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 8. ELECTRONICS SPOTLIGHT */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Electronics & Gadgets
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Smartphones, ANC audio gear, laptops and daily accessories
            </p>
          </div>
          <Link to="/products?category=electronics" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Explore Tech &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (electronicsProducts.length > 0 ? electronicsProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 9. HOME & KITCHEN SPOTLIGHT */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Home & Kitchen
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Cookware, coffee appliances, ambient lighting and furnishings
            </p>
          </div>
          <Link to="/products?category=home-kitchen" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Shop Home &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (homeProducts.length > 0 ? homeProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 10. BEAUTY & WELLNESS SPOTLIGHT */}
      <section style={{ margin: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Beauty & Personal Care
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Skincare serums, luxury fragrances and daily grooming kits
            </p>
          </div>
          <Link to="/products?category=beauty" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Shop Beauty &rarr;
          </Link>
        </div>

        <div className="grid-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (beautyProducts.length > 0 ? beautyProducts : allProducts).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* 11. CUSTOMER REVIEWS (Requirement 24) */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
            <Award size={14} />
            <span>LOVED BY 250,000+ SHOPPERS</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            What Our Customers Say
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Real reviews from verified shoppers across India
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {customerReviews.map((rev) => (
            <div
              key={rev.id}
              className="card"
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.75rem', color: '#F59E0B' }}>
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {rev.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {rev.location}
                    </div>
                  </div>
                  {rev.verified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. WHY SHOPSPHERE? (Requirement 24) */}
      <section
        className="card"
        style={{
          margin: '4rem 0',
          padding: '3rem 2rem',
          borderRadius: '20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Why Shop on ShopSphere?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Everything you need, delivered simply. We combine the widest product selection with unmatched consumer protections.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface-secondary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Pan-India Fast Delivery</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Express courier shipping covering 28,000+ pincodes with real-time package milestone tracking.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface-secondary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>100% Authentic Brands</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Direct partnerships with verified sellers ensure only genuine, quality checked products.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface-secondary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <RotateCcw size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>7-Day Easy Returns</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Hassle-free doorstep pickup and instant refund directly to your original payment method.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--surface-secondary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Headphones size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>24/7 Dedicated Support</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Round-the-clock customer support ready to answer questions, handle refunds, and help anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Promotional Seller Banner */}
      <section
        className="card"
        style={{
          margin: '3rem 0',
          padding: '3rem 2.5rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #312E81 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#818CF8',
              marginBottom: '1rem',
              letterSpacing: '0.5px',
            }}
          >
            <Store size={14} />
            GROW YOUR BUSINESS WITH US
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Sell Millions on ShopSphere. <br />
            Enjoy 0% Commission on Launch.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Reach crores of online shoppers across 28,000+ Indian pincodes with 7-day fast payouts, lowest shipping rates, and powerful inventory analytics.
          </p>
          <Link
            to="/seller/register"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '0.85rem 1.85rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            }}
          >
            Start Selling Today
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#818CF8" />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Zero onboarding or monthly maintenance fees</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#818CF8" />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Integrated automated shipping partners & tracking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#818CF8" />
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Dedicated 24/7 seller growth support desk</span>
          </div>
        </div>
      </section>
    </div>
  );
};
