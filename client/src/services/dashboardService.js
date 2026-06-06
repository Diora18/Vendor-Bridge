import api from './api';

export const getDashboardSummary = () => api.get('/dashboard/summary').then((res) => res.data);
export const getRecentActivity = () => api.get('/dashboard/recent-activity').then((res) => res.data);

