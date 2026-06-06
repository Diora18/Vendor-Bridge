import api from './api';

export const listCategories = () => api.get('/vendor-categories').then((res) => res.data);
export const createCategory = (payload) => api.post('/vendor-categories', payload).then((res) => res.data);
export const updateCategory = (id, payload) => api.patch(`/vendor-categories/${id}`, payload).then((res) => res.data);
export const deleteCategory = (id) => api.delete(`/vendor-categories/${id}`).then((res) => res.data);
