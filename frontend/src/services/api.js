import axios from "axios";

// ============================================================
// API BASE URL
// ============================================================

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  "https://shopsphere-56zo.onrender.com/api";

const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// Attach JWT access token to every request
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shopsphere_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// TOKEN REFRESH
// ============================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// ============================================================
// RESPONSE INTERCEPTOR
// Automatically refresh expired JWT tokens
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // No response received
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 errors
    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Don't refresh tokens for login/register requests
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        return Promise.reject(error);
      }

      // Another request is already refreshing the token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(
        "shopsphere_refresh_token"
      );

      // No refresh token available
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Refresh access token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        // Save new access token
        localStorage.setItem(
          "shopsphere_access_token",
          newAccessToken
        );

        // Save rotated refresh token if returned
        if (response.data.refresh) {
          localStorage.setItem(
            "shopsphere_refresh_token",
            response.data.refresh
          );
        }

        // Update default Authorization header
        api.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`;

        // Update original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Resolve queued requests
        processQueue(null, newAccessToken);

        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Reject queued requests
        processQueue(refreshError, null);

        // Clear authentication data
        localStorage.removeItem("shopsphere_access_token");
        localStorage.removeItem("shopsphere_refresh_token");
        localStorage.removeItem("shopsphere_user");

        isRefreshing = false;

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// EXPORT
// ============================================================

export default api;