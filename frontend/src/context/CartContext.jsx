import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cart.service';
import { couponService } from '../services/coupon.service';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    total_items_count: 0,
    subtotal: '0.00',
    discount: '0.00',
    delivery_fee: '0.00',
    coupon_discount: '0.00',
    coupon_code: null,
    total_amount: '0.00',
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        total_items_count: 0,
        subtotal: '0.00',
        discount: '0.00',
        delivery_fee: '0.00',
        coupon_discount: '0.00',
        coupon_code: null,
        total_amount: '0.00',
      });
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      // Ignore initial error if not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your cart.');
    }
    const data = await cartService.addToCart(productId, variantId, quantity);
    setCart(data.cart);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const data = await cartService.updateCartItem(itemId, quantity);
    setCart(data.cart);
    return data;
  };

  const removeFromCart = async (itemId) => {
    const data = await cartService.removeCartItem(itemId);
    setCart(data.cart);
    return data;
  };

  const clearCart = async () => {
    const data = await cartService.clearCart();
    setCart(data.cart);
    return data;
  };

  const applyCoupon = async (code) => {
    const data = await couponService.applyCoupon(code);
    setCart(data.cart);
    return data;
  };

  const removeCoupon = async () => {
    const data = await couponService.removeCoupon();
    setCart(data.cart);
    return data;
  };

  const value = {
    cart,
    loading,
    cartCount: cart.total_items_count || 0,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
