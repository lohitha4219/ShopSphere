import api from './api';

export const paymentService = {
  async createPaymentSession(orderId) {
    const response = await api.post('/payments/create-session/', { order_id: orderId });
    return response.data;
  },

  async verifyPayment(verificationData) {
    const response = await api.post('/payments/verify/', verificationData);
    return response.data;
  },

  async getAdminPayments() {
    const response = await api.get('/payments/admin/all/');
    return response.data.results || response.data;
  },
};
