import api from './api';

export const submitQuotation = (rfqId, payload) => api.post(`/rfqs/${rfqId}/quotations`, payload).then((res) => res.data);
export const listQuotations = (rfqId) => api.get(`/rfqs/${rfqId}/quotations`).then((res) => res.data);
export const selectQuotation = (id) => api.post(`/quotations/${id}/select`).then((res) => res.data);

