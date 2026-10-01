import api from './api';

export const orderService = {
  async createOrder(orderPayload) {
    const response = await api.post('/orders/create/', orderPayload);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/orders/');
    return response.data.results || response.data;
  },

  async getOrderDetail(idOrRef) {
    const response = await api.get(`/orders/${idOrRef}/`);
    return response.data;
  },

  async cancelOrder(idOrRef, reason) {
    const response = await api.post(`/orders/${idOrRef}/cancel/`, { reason });
    return response.data;
  },

  async requestReturn(idOrRef, reason, comments) {
    const response = await api.post(`/orders/${idOrRef}/return/`, { reason, comments });
    return response.data;
  },

  // Seller orders
  async getSellerOrders() {
    const response = await api.get('/orders/seller/');
    return response.data.results || response.data;
  },

  async updateSellerOrderStatus(orderId, orderStatus, trackingNumber = '', courierName = '') {
    const response = await api.post(`/orders/${orderId}/update-status/`, {
      order_status: orderStatus,
      tracking_number: trackingNumber,
      courier_name: courierName,
    });
    return response.data;
  },

  // Admin orders & returns
  async getAdminOrders(statusFilter = '') {
    const response = await api.get('/orders/admin/all/', {
      params: statusFilter ? { status: statusFilter } : {},
    });
    return response.data.results || response.data;
  },

  async getAdminReturns() {
    const response = await api.get('/orders/admin/returns/');
    return response.data.results || response.data;
  },

  async approveReturn(returnId, notes = '') {
    const response = await api.post(`/orders/admin/returns/${returnId}/approve/`, { admin_notes: notes });
    return response.data;
  },

  async rejectReturn(returnId, notes = '') {
    const response = await api.post(`/orders/admin/returns/${returnId}/reject/`, { admin_notes: notes });
    return response.data;
  },
};
