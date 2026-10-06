import React, { useEffect, useState } from 'react';

import {
  getImageUrl,
  PLACEHOLDER_PRODUCT,
  PLACEHOLDER_CATEGORY,
} from '../../utils/image';

export const ProductImage = ({
  src,
  alt = 'ShopSphere Product',
  fallbackType = 'product',
  className = '',
  style = {},
  objectFit = 'contain',
  loading = 'lazy',
  ...props
}) => {
  const getResolvedImage = (value) => {
    const url = getImageUrl(value, fallbackType);

    // Debug only - remove later if desired
    console.log('ShopSphere image:', {
      original: value,
      resolved: url,
    });

    return url;
  };

  const [resolvedSrc, setResolvedSrc] = useState(() =>
    getResolvedImage(src)
  );

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const newUrl = getResolvedImage(src);

    setResolvedSrc(newUrl);
    setHasError(false);
  }, [src, fallbackType]);

  const handleError = (event) => {
    if (hasError) {
      return;
    }

    console.error('ShopSphere image failed:', {
      src,
      resolvedSrc,
      error: event?.nativeEvent || event,
    });

    setHasError(true);

    setResolvedSrc(
      fallbackType === 'category'
        ? PLACEHOLDER_CATEGORY
        : PLACEHOLDER_PRODUCT
    );
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        display: 'block',
        ...style,
      }}
      {...props}
    />
  );
};