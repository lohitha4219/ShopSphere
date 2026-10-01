import api from './api';

export const wishlistService = {
  async getWishlist() {
    const response = await api.get('/wishlist/');
    return response.data;
  },

  async getWishlistIds() {
    const response = await api.get('/wishlist/ids/');
    return response.data;
  },

  async addToWishlist(productId) {
    const response = await api.post('/wishlist/add/', { product_id: productId });
    return response.data;
  },

  async removeFromWishlist(productId) {
    const response = await api.delete(`/wishlist/remove/${productId}/`);
    return response.data;
  },

  async moveToCart(productId) {
    const response = await api.post('/wishlist/move-to-cart/', { product_id: productId });
    return response.data;
  },
};
