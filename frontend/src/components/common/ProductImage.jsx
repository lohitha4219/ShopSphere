import React, { useState, useEffect } from 'react';
import { getImageUrl, PLACEHOLDER_PRODUCT, PLACEHOLDER_CATEGORY } from '../../utils/image';

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
  const [resolvedSrc, setResolvedSrc] = useState(() => getImageUrl(src, fallbackType));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setResolvedSrc(getImageUrl(src, fallbackType));
    setHasError(false);
  }, [src, fallbackType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setResolvedSrc(fallbackType === 'category' ? PLACEHOLDER_CATEGORY : PLACEHOLDER_PRODUCT);
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={className}
      style={{
        objectFit,
        ...style,
      }}
      {...props}
    />
  );
};
