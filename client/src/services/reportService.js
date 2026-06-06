import api from './api';

export const getProcurementOverview = () => api.get('/reports/overview').then((res) => res.data);
export const getSpendingSummary = () => api.get('/reports/spending-summary').then((res) => res.data);
export const getVendorPerformance = () => api.get('/reports/vendor-performance').then((res) => res.data);
export const getMonthlyTrends = () => api.get('/reports/monthly-trends').then((res) => res.data);

export const exportReport = async (type) => {
  const response = await api.get('/reports/export', {
    params: { type },
    responseType: 'blob'
  });

  const filenames = {
    spending: 'spending-summary.csv',
    vendors: 'vendor-performance.csv',
    monthly: 'monthly-trends.csv'
  };

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filenames[type] || 'vendorbridge-report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
