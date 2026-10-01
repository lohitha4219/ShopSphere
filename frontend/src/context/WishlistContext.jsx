import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlist.service';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { fetchCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const [items, ids] = await Promise.all([
        wishlistService.getWishlist(),
        wishlistService.getWishlistIds(),
      ]);
      setWishlist(items);
      setWishlistIds(new Set(ids));
    } catch {
      // Ignore initial errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlistIds.has(Number(productId));
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your wishlist.');
    }
    const numId = Number(productId);
    if (wishlistIds.has(numId)) {
      await wishlistService.removeFromWishlist(numId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(numId);
        return next;
      });
      setWishlist((prev) => prev.filter((item) => item.product?.id !== numId));
      return { added: false };
    } else {
      const data = await wishlistService.addToWishlist(numId);
      setWishlistIds((prev) => new Set([...prev, numId]));
      setWishlist((prev) => [data.item, ...prev]);
      return { added: true };
    }
  };

  const moveToCart = async (productId) => {
    const data = await wishlistService.moveToCart(productId);
    const numId = Number(productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(numId);
      return next;
    });
    setWishlist((prev) => prev.filter((item) => item.product?.id !== numId));
    await fetchCart();
    return data;
  };

  const value = {
    wishlist,
    wishlistCount: wishlistIds.size,
    loading,
    isInWishlist,
    toggleWishlist,
    moveToCart,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
