import api from './api';

export const listVendors = (params) => api.get('/vendors', { params }).then((res) => res.data);
export const createVendor = (payload) => api.post('/vendors', payload).then((res) => res.data);
export const getVendor = (id) => api.get(`/vendors/${id}`).then((res) => res.data);
export const updateVendor = (id, payload) => api.patch(`/vendors/${id}`, payload).then((res) => res.data);

