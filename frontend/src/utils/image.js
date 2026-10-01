/**
 * ShopSphere Image Resolution & Fallback Utility
 * Handles Django media URLs, Vite public assets, external CDN links, and graceful SVG fallbacks.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://127.0.0.1:8000';

export const PLACEHOLDER_PRODUCT = '/images/placeholders/placeholder-product.svg';
export const PLACEHOLDER_CATEGORY = '/images/placeholders/placeholder-category.svg';

/**
 * Resolves any image value into a clean, displayable URL
 * @param {string|object} image - Image path, URL, or image object with .image property
 * @param {'product'|'category'|'banner'} fallbackType
 * @returns {string} Fully resolved image URL
 */
export const getImageUrl = (image, fallbackType = 'product') => {
  if (!image) {
    return fallbackType === 'category' ? PLACEHOLDER_CATEGORY : PLACEHOLDER_PRODUCT;
  }

  // If object passed (e.g. ProductImage model instance { image: '...' })
  const rawPath = typeof image === 'object' ? image.image || image.thumbnail || '' : String(image);

  if (!rawPath || rawPath.trim() === '') {
    return fallbackType === 'category' ? PLACEHOLDER_CATEGORY : PLACEHOLDER_PRODUCT;
  }

  const clean = rawPath.trim();

  // 1. External absolute URLs (https://... or http://...)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // 2. Vite public static assets (starts with /images/ or images/)
  if (clean.startsWith('/images/')) {
    return clean;
  }
  if (clean.startsWith('images/')) {
    return `/${clean}`;
  }

  // 3. Django Media storage paths (starts with /media/ or media/)
  if (clean.startsWith('/media/')) {
    return `${API_BASE}${clean}`;
  }
  if (clean.startsWith('media/')) {
    return `${API_BASE}/${clean}`;
  }

  // 4. Relative model field paths like 'products/thumbnails/xyz.jpg' or 'categories/fashion.jpg'
  // Correctly map thumbnail and gallery subdirectories to Vite public images
  if (clean.startsWith('products/thumbnails/')) {
    const filename = clean.replace('products/thumbnails/', '');
    return `/images/products/${filename}`;
  }
  if (clean.startsWith('products/gallery/')) {
    const filename = clean.replace('products/gallery/', '');
    return `/images/products/${filename}`;
  }
  if (clean.startsWith('products/') || clean.startsWith('categories/') || clean.startsWith('banners/')) {
    return `/images/${clean}`;
  }

  // Default fallback through Django media
  return `${API_BASE}/media/${clean.replace(/^\//, '')}`;
};
