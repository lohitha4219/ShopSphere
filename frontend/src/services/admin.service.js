import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  async getReports(type = 'sales', startDate = '', endDate = '') {
    const response = await api.get('/admin/reports/', {
      params: { type, start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users/', { params });
    return response.data.results || response.data;
  },

  async toggleUserActive(userId) {
    const response = await api.post(`/admin/users/${userId}/toggle_active/`);
    return response.data;
  },

  async updateUser(userId, data) {
    const response = await api.put(`/admin/users/${userId}/`, data);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}/`);
    return response.data;
  },
};
