import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async googleLogin(credential) {
    const response = await api.post('/auth/google/', { credential, id_token: credential });
    return response.data;
  },

  async logout(refreshToken) {
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch (e) {
      // Continue client cleanup even if logout fails
    }
  },

  async forgotPassword(emailOrPhone) {
    const response = await api.post('/auth/forgot-password/', { email_or_phone: emailOrPhone });
    return response.data;
  },

  async resetPassword(token, newPassword, confirmPassword) {
    const response = await api.post('/auth/reset-password/', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile/', profileData);
    return response.data;
  },

  async changePassword(passwords) {
    const response = await api.post('/auth/change-password/', passwords);
    return response.data;
  },

  async getAddresses() {
    const response = await api.get('/auth/addresses/');
    return response.data.results || response.data;
  },

  async createAddress(addressData) {
    const response = await api.post('/auth/addresses/', addressData);
    return response.data;
  },

  async updateAddress(id, addressData) {
    const response = await api.put(`/auth/addresses/${id}/`, addressData);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/auth/addresses/${id}/`);
    return response.data;
  },

  async setDefaultAddress(id) {
    const response = await api.post(`/auth/addresses/${id}/set_default/`);
    return response.data;
  },
};
