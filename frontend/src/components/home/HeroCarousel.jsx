import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'SHOPSPHERE SIGNATURE COLLECTION',
      title: 'Shop Smarter. Live Better.',
      subtitle: "Discover products you'll love at prices you'll appreciate. Everything you need, delivered simply.",
      ctaText: 'Shop Now',
      ctaLink: '/products',
      secondaryText: 'Explore Categories',
      secondaryLink: '/products',
      gradient: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(15, 23, 42, 0.25) 100%)',
      accentColor: '#38BDF8',
      tag: 'Up to 60% OFF',
      bannerImage: '/images/banners/electronics-banner.jpg',
    },
    {
      id: 2,
      badge: 'FASHION & LIFESTYLE FEST',
      title: 'Curated Elegance for Men & Women',
      subtitle: 'Breathable pure cotton apparel, designer festive wear, and running shoes crafted for comfort.',
      ctaText: 'Shop Fashion',
      ctaLink: '/products?category=fashion',
      secondaryText: 'Footwear Collection',
      secondaryLink: '/products?category=footwear',
      gradient: 'linear-gradient(90deg, rgba(30, 10, 50, 0.95) 0%, rgba(55, 15, 80, 0.75) 50%, rgba(88, 28, 135, 0.25) 100%)',
      accentColor: '#F472B6',
      tag: 'Fresh Drops Daily',
      bannerImage: '/images/banners/fashion-banner.jpg',
    },
    {
      id: 3,
      badge: 'HOME & LIVING COLLECTION',
      title: 'Transform Your Home Essentials',
      subtitle: 'Premium coffee makers, ceramic cookware, ambient lamps, and cozy bedsheets delivered to your doorstep.',
      ctaText: 'Explore Home & Kitchen',
      ctaLink: '/products?category=home-kitchen',
      secondaryText: 'Kitchenware Deals',
      secondaryLink: '/products?category=home-kitchen',
      gradient: 'linear-gradient(90deg, rgba(20, 25, 30, 0.95) 0%, rgba(35, 45, 55, 0.75) 50%, rgba(45, 55, 72, 0.25) 100%)',
      accentColor: '#FBBF24',
      tag: 'Starting at ₹299',
      bannerImage: '/images/banners/home-banner.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        marginTop: '1.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          transform: `translateX(-${current * 100}%)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            style={{
              minWidth: '100%',
              backgroundImage: `${slide.gradient}, url(${slide.bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
              color: '#FFFFFF',
              padding: '4.5rem 3.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '400px',
            }}
          >
            {/* Background geometric accents */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '450px',
                height: '450px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: '640px', zIndex: 2 }}>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  marginBottom: '1.25rem',
                  color: slide.accentColor,
                }}
              >
                <Sparkles size={14} />
                {slide.badge}
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    marginLeft: '0.35rem',
                  }}
                >
                  {slide.tag}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                  color: '#FFFFFF',
                }}
              >
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '2rem',
                  lineHeight: 1.5,
                }}
              >
                {slide.subtitle}
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to={slide.ctaLink}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    padding: '0.85rem 1.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  {slide.ctaText}
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to={slide.secondaryLink}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '0.85rem 1.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {slide.secondaryText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          top: '50%',
          left: '1rem',
          transform: 'translateY(-50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          top: '50%',
          right: '1rem',
          transform: 'translateY(-50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot Indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: current === idx ? '28px' : '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: current === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              transition: 'all 250ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};
