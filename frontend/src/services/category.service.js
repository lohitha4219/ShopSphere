import api from './api';

export const categoryService = {
  async getCategories(params = {}) {
    const response = await api.get('/categories/', { params });
    return response.data.results || response.data;
  },

  async getCategory(slug) {
    const response = await api.get(`/categories/${slug}/`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  async updateCategory(slug, data) {
    const response = await api.put(`/categories/${slug}/`, data);
    return response.data;
  },

  async deleteCategory(slug) {
    const response = await api.delete(`/categories/${slug}/`);
    return response.data;
  },
};
