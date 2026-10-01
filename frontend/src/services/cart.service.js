import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart/');
    return response.data;
  },

  async addToCart(productId, variantId = null, quantity = 1) {
    const response = await api.post('/cart/add/', {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(itemId, quantity) {
    const response = await api.put('/cart/update/', {
      item_id: itemId,
      quantity,
    });
    return response.data;
  },

  async removeCartItem(itemId) {
    const response = await api.delete(`/cart/remove/${itemId}/`);
    return response.data;
  },

  async clearCart() {
    const response = await api.post('/cart/clear/');
    return response.data;
  },
};
