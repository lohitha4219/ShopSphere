import api from './api';

export const couponService = {
  async applyCoupon(code) {
    const response = await api.post('/coupons/apply/', { code });
    return response.data;
  },

  async removeCoupon() {
    const response = await api.post('/coupons/remove/');
    return response.data;
  },

  async getAvailableCoupons() {
    const response = await api.get('/coupons/available/');
    return response.data;
  },

  async getAllCoupons() {
    const response = await api.get('/coupons/admin/all/');
    return response.data.results || response.data;
  },

  async createCoupon(data) {
    const response = await api.post('/coupons/admin/all/', data);
    return response.data;
  },

  async deleteCoupon(id) {
    const response = await api.delete(`/coupons/admin/all/${id}/`);
    return response.data;
  },
};
