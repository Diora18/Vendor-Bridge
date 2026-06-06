import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendorbridge_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const isAuthFailure = status === 401 && (
      message.toLowerCase().includes('session') ||
      message.toLowerCase().includes('token') ||
      message.toLowerCase().includes('signature') ||
      message.toLowerCase().includes('sign in')
    );

    if (isAuthFailure && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('vendorbridge_token');
      localStorage.removeItem('vendorbridge_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

