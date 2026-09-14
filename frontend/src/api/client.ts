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

// Response Interceptor: Handle Token Expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user on unauthorized
      localStorage.removeItem('vbs_token');
      localStorage.removeItem('vbs_user');
      if (window.location.pathname.startsWith('/studio')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
