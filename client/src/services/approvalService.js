import api from './api';

const serverBaseUrl = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const listApprovals = (params) => api.get('/approvals', { params }).then((res) => res.data);
export const createApproval = (payload) => api.post('/approvals', payload).then((res) => res.data);
export const getApproval = (id) => api.get(`/approvals/${id}`).then((res) => res.data);
export const approveRequest = (id, payload) => api.post(`/approvals/${id}/approve`, payload).then((res) => res.data);
export const rejectRequest = (id, payload) => api.post(`/approvals/${id}/reject`, payload).then((res) => res.data);
export const getApprovalPdfUrl = async (id) => {
  const { pdfUrl } = await api.get(`/approvals/${id}/pdf`).then((res) => res.data);
  return `${serverBaseUrl()}${pdfUrl}`;
};

