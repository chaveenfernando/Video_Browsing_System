import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vbs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration (401) and Access Denied (403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token and redirect to login
      localStorage.removeItem('vbs_token');
      localStorage.removeItem('vbs_user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Token exists but user has no permission — session may be stale after server restart
      const token = localStorage.getItem('vbs_token');
      if (token) {
        // Provide a clearer error message by enriching the error object
        const msg = 'Session expired or insufficient permissions. Please log out and log in again.';
        if (error.response?.data) {
          error.response.data.message = msg;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
