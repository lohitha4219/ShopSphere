import api from './api';

export const sellerService = {
  async registerSeller(data) {
    const response = await api.post('/sellers/register/', data);
    return response.data;
  },

  async getSellerProfile() {
    const response = await api.get('/sellers/profile/');
    return response.data;
  },

  async updateSellerProfile(data) {
    const response = await api.put('/sellers/profile/', data);
    return response.data;
  },

  async getSellerDashboard() {
    const response = await api.get('/sellers/dashboard/');
    return response.data;
  },

  async getAdminSellers() {
    const response = await api.get('/sellers/admin/all/');
    return response.data.results || response.data;
  },

  async approveSeller(sellerId) {
    const response = await api.post(`/sellers/admin/all/${sellerId}/approve/`);
    return response.data;
  },

  async rejectSeller(sellerId, reason = '') {
    const response = await api.post(`/sellers/admin/all/${sellerId}/reject/`, { reason });
    return response.data;
  },

  async suspendSeller(sellerId) {
    const response = await api.post(`/sellers/admin/all/${sellerId}/suspend/`);
    return response.data;
  },
};
