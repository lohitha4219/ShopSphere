/**
 * ShopSphere Image Resolution & Fallback Utility
 * ------------------------------------------------
 * Handles:
 * - External image URLs
 * - Django media URLs
 * - Vite public assets
 * - Product image objects
 * - Category images
 * - Missing/broken image values
 */

const API_BASE = (
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'https://shopsphere-56zo.onrender.com'
).replace(/\/+$/, '');

export const PLACEHOLDER_PRODUCT =
  '/images/placeholders/placeholder-product.svg';

export const PLACEHOLDER_CATEGORY =
  '/images/placeholders/placeholder-category.svg';

/* =========================================================
   FALLBACK
   ========================================================= */

const getFallbackImage = (fallbackType = 'product') => {
  return fallbackType === 'category'
    ? PLACEHOLDER_CATEGORY
    : PLACEHOLDER_PRODUCT;
};

/* =========================================================
   EXTRACT IMAGE VALUE
   ========================================================= */

const extractImageValue = (image) => {
  if (!image) {
    return '';
  }

  // String URL
  if (typeof image === 'string') {
    return image.trim();
  }

  // Image object
  if (typeof image === 'object') {
    const possibleValues = [
      image.thumbnail,
      image.primary_image,
      image.image,
      image.image_url,
      image.url,
      image.src,
    ];

    const validValue = possibleValues.find(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ''
    );

    return validValue ? String(validValue).trim() : '';
  }

  return '';
};

/* =========================================================
   RESOLVE IMAGE URL
   ========================================================= */

export const getImageUrl = (
  image,
  fallbackType = 'product'
) => {
  const rawPath = extractImageValue(image);

  // No image
  if (!rawPath) {
    return getFallbackImage(fallbackType);
  }

  const clean = rawPath.trim();

  // -------------------------------------------------------
  // External URL
  // -------------------------------------------------------

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // -------------------------------------------------------
  // Encoded external URL
  // -------------------------------------------------------

  if (
    clean.includes('https%3A') ||
    clean.includes('http%3A')
  ) {
    try {
      const decoded = decodeURIComponent(clean);

      if (/^https?:\/\//i.test(decoded)) {
        return decoded;
      }
    } catch {
      // Ignore invalid encoding
    }
  }

  // -------------------------------------------------------
  // Vite public images
  // -------------------------------------------------------

  if (clean.startsWith('/images/')) {
    return clean;
  }

  if (clean.startsWith('images/')) {
    return `/${clean}`;
  }

  // -------------------------------------------------------
  // Django media
  // -------------------------------------------------------

  if (clean.startsWith('/media/')) {
    return `${API_BASE}${clean}`;
  }

  if (clean.startsWith('media/')) {
    return `${API_BASE}/${clean}`;
  }

  // -------------------------------------------------------
  // Product thumbnail
  // -------------------------------------------------------

  if (clean.startsWith('products/thumbnails/')) {
    const filename = clean.replace(
      /^products\/thumbnails\//,
      ''
    );

    return `/images/products/${filename}`;
  }

  // -------------------------------------------------------
  // Product gallery
  // -------------------------------------------------------

  if (clean.startsWith('products/gallery/')) {
    const filename = clean.replace(
      /^products\/gallery\//,
      ''
    );

    return `/images/products/${filename}`;
  }

  // -------------------------------------------------------
  // Other local assets
  // -------------------------------------------------------

  if (
    clean.startsWith('products/') ||
    clean.startsWith('categories/') ||
    clean.startsWith('banners/')
  ) {
    return `/images/${clean}`;
  }

  // -------------------------------------------------------
  // Already absolute local path
  // -------------------------------------------------------

  if (clean.startsWith('/')) {
    return clean;
  }

  // -------------------------------------------------------
  // Final Django media path
  // -------------------------------------------------------

  return `${API_BASE}/media/${clean.replace(/^\/+/, '')}`;
};

/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

export const getProductImage = (product) => {
  if (!product) {
    return PLACEHOLDER_PRODUCT;
  }

  /*
   * Prefer thumbnail because this is the actual product
   * image field used by your ShopSphere API.
   */
  const image =
    product.thumbnail ||
    product.primary_image ||
    product.image ||
    product.image_url ||
    product.url ||
    product.src ||
    '';

  return getImageUrl(image, 'product');
};

/* =========================================================
   CATEGORY IMAGE
   ========================================================= */

export const getCategoryImage = (category) => {
  if (!category) {
    return PLACEHOLDER_CATEGORY;
  }

  const image =
    category.thumbnail ||
    category.image ||
    category.primary_image ||
    category.image_url ||
    category.url ||
    category.src ||
    '';

  return getImageUrl(image, 'category');
};

/* =========================================================
   EXTERNAL IMAGE CHECK
   ========================================================= */

export const isExternalImage = (image) => {
  const value = extractImageValue(image);

  return /^https?:\/\//i.test(value);
};

/* =========================================================
   BROKEN IMAGE HANDLER
   ========================================================= */

export const handleImageError = (
  event,
  fallbackType = 'product'
) => {
  if (!event?.currentTarget) {
    return;
  }

  const img = event.currentTarget;

  // Prevent infinite fallback loop
  if (img.dataset.fallbackApplied === 'true') {
    return;
  }

  img.dataset.fallbackApplied = 'true';

  img.src = getFallbackImage(fallbackType);
};