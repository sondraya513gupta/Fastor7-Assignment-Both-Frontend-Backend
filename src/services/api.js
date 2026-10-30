import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://staging.fastor.ai';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fastor_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - session expired or invalid token');
      // Clear token if invalid
      localStorage.removeItem('fastor_auth_token');
      localStorage.removeItem('fastor_user_data');
      if (window.location.pathname !== '/signup' && window.location.pathname !== '/verify-otp') {
        window.location.href = '/signup';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
