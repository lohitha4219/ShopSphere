import api from './api';

export const reviewService = {
  async getProductReviews(productSlugOrId) {
    const response = await api.get(`/reviews/product/${productSlugOrId}/`);
    return response.data;
  },

  async addReview(productSlugOrId, reviewData) {
    const response = await api.post(`/reviews/product/${productSlugOrId}/`, reviewData);
    return response.data;
  },

  async markHelpful(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/helpful/`);
    return response.data;
  },

  async getAdminReviews() {
    const response = await api.get('/reviews/admin/all/');
    return response.data.results || response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/admin/all/${reviewId}/`);
    return response.data;
  },
};
