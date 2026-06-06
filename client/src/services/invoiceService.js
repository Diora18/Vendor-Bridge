import api from './api';

const serverBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const listInvoices = (params) => api.get('/invoices', { params }).then((res) => res.data);
export const getInvoice = (id) => api.get(`/invoices/${id}`).then((res) => res.data);
export const createInvoice = (payload) => api.post('/invoices', payload).then((res) => res.data);
export const emailInvoice = (id, payload) => api.post(`/invoices/${id}/email`, payload).then((res) => res.data);
export const getInvoicePdfUrl = async (id) => {
  const { pdfUrl } = await api.get(`/invoices/${id}/pdf`).then((res) => res.data);
  return `${serverBaseUrl()}${pdfUrl}`;
};
