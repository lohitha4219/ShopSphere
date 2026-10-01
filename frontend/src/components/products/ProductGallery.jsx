import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from 'lucide-react';
import { ProductImage } from '../common/ProductImage';
import { getImageUrl } from '../../utils/image';

export const ProductGallery = ({ thumbnail, images = [], productName = 'Product' }) => {
  // Aggregate unique image list
  const allImages = [];
  if (thumbnail) allImages.push(getImageUrl(thumbnail));
  images.forEach((img) => {
    const raw = typeof img === 'object' ? img.image : img;
    if (raw) {
      const resolved = getImageUrl(raw);
      if (!allImages.includes(resolved)) {
        allImages.push(resolved);
      }
    }
  });

  if (allImages.length === 0) {
    allImages.push('/images/placeholders/placeholder-product.svg');
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mainImageRef = useRef(null);

  const activeImage = allImages[activeIndex] || allImages[0];

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, allImages.length]);

  return (
    <div style={{ width: '100%' }}>
      {/* Desktop Layout: Thumbnails Column on the Left + Main Image on the Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          alignItems: 'flex-start',
          width: '100%',
        }}
        className="product-gallery-container"
      >
        {/* Thumbnails Column (Left on desktop, wrap/scrollable) */}
        {allImages.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              maxHeight: '480px',
              overflowY: 'auto',
              paddingRight: '4px',
              flexShrink: 0,
            }}
            className="gallery-thumbnails-col"
          >
            {allImages.map((img, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    padding: '0.2rem',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ProductImage
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fallbackType="product"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image Showcase */}
        <div
          ref={mainImageRef}
          style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border-subtle)',
            overflow: 'hidden',
            cursor: isZoomed ? 'crosshair' : 'zoom-in',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '420px',
            maxHeight: '520px',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Main Product Image with Interactive Zoom */}
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: '420px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '1.5rem',
            }}
          >
            <ProductImage
              src={activeImage}
              alt={productName}
              fallbackType="product"
              style={{
                maxWidth: '100%',
                maxHeight: '420px',
                objectFit: 'contain',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isZoomed ? 'scale(1.85)' : 'scale(1)',
                transition: isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            aria-label="Expand image fullscreen"
            title="Expand image"
            style={{
              position: 'absolute',
              top: '0.85rem',
              right: '0.85rem',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 5,
              transition: 'background-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Maximize2 size={16} />
          </button>

          {/* Previous / Next Arrow Overlay */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 5,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 5,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Zoom Hint Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 600,
              pointerEvents: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ZoomIn size={12} />
            <span>Hover to zoom</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Modal Lightbox Preview */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image preview"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Top Bar with Product Name & Close */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.5rem',
              right: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#FFFFFF',
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '1rem', fontWeight: 600, maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {productName} ({activeIndex + 1} / {allImages.length})
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close fullscreen preview"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
            >
              <X size={22} />
            </button>
          </div>

          {/* Modal Main Image */}
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              src={activeImage}
              alt={productName}
              fallbackType="product"
              style={{
                maxWidth: '90vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          {/* Modal Prev / Next Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous"
                style={{
                  position: 'absolute',
                  left: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10000,
                  transition: 'background-color 0.2s',
                }}
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next"
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10000,
                  transition: 'background-color 0.2s',
                }}
              >
                <ChevronRight size={28} />
              </button>

              {/* Bottom Thumbnail Strip */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  display: 'flex',
                  gap: '0.75rem',
                  overflowX: 'auto',
                  padding: '0.5rem',
                  zIndex: 10000,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-sm)',
                      border: activeIndex === idx ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.3)',
                      backgroundColor: '#FFFFFF',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      opacity: activeIndex === idx ? 1 : 0.6,
                      transform: activeIndex === idx ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      padding: '2px',
                    }}
                  >
                    <ProductImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fallbackType="product"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
