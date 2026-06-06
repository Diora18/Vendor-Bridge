import api from './api';

export const listPurchaseOrders = () => api.get('/purchase-orders').then((res) => res.data);
export const getPurchaseOrder = (id) => api.get(`/purchase-orders/${id}`).then((res) => res.data);
export const createPurchaseOrder = (payload) => api.post('/purchase-orders', payload).then((res) => res.data);
export const sendPurchaseOrder = (id) => api.post(`/purchase-orders/${id}/send`).then((res) => res.data);

