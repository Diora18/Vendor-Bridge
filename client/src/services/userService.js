import api from './api';

export const listUsers = () => api.get('/users').then((res) => res.data);
export const listApprovers = () => api.get('/users/approvers').then((res) => res.data);
export const createUser = (payload) => api.post('/users', payload).then((res) => res.data);

