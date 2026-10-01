import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  async getProduct(slugOrId) {
    const response = await api.get(`/products/${slugOrId}/`);
    return response.data;
  },

  async getBrands() {
    const response = await api.get('/products/brands/');
    return response.data;
  },

  async getFeatured() {
    const response = await api.get('/products/featured/');
    return response.data.results || response.data;
  },

  async getDeals() {
    const response = await api.get('/products/deals/');
    return response.data.results || response.data;
  },

  async getBestSellers() {
    const response = await api.get('/products/best_sellers/');
    return response.data.results || response.data;
  },

  async getSimilar(slugOrId) {
    const response = await api.get(`/products/${slugOrId}/similar/`);
    return response.data.results || response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products/', productData);
    return response.data;
  },

  async updateProduct(slugOrId, productData) {
    const response = await api.put(`/products/${slugOrId}/`, productData);
    return response.data;
  },

  async deleteProduct(slugOrId) {
    const response = await api.delete(`/products/${slugOrId}/`);
    return response.data;
  },

  async addProductImage(productId, formData) {
    const response = await api.post(`/products/${productId}/add_image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async addProductVariant(productId, variantData) {
    const response = await api.post(`/products/${productId}/add_variant/`, variantData);
    return response.data;
  },
};
