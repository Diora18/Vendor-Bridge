import api from './api';

export const getDashboardSummary = () => api.get('/dashboard/summary').then((res) => res.data);
export const getRecentOrders = () => api.get('/dashboard/recent-orders').then((res) => res.data);
export const getSpendingChart = () => api.get('/dashboard/spending-chart').then((res) => res.data);
