import api from './api';

export const listRFQs = (params) => api.get('/rfqs', { params }).then((res) => res.data);
export const createRFQ = (payload) => api.post('/rfqs', payload).then((res) => res.data);
export const getRFQ = (id) => api.get(`/rfqs/${id}`).then((res) => res.data);
export const assignRFQVendors = (id, payload) => api.post(`/rfqs/${id}/assign-vendors`, payload).then((res) => res.data);
export const sendRFQ = (id) => api.post(`/rfqs/${id}/send`).then((res) => res.data);
export const getRFQComparison = (id) => api.get(`/rfqs/${id}/comparison`).then((res) => res.data);

