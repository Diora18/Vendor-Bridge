import api from './api';

export const listActivityLogs = (params) => api.get('/activity-logs', { params }).then((res) => res.data);
