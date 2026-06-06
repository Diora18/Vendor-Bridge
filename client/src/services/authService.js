import api from './api';

export const login = (payload) => api.post('/auth/login', payload).then((res) => res.data);
export const signup = (payload) => api.post('/auth/signup', payload).then((res) => res.data);
export const getMe = () => api.get('/auth/me').then((res) => res.data);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload).then((res) => res.data);

