import axios from 'axios';

// API Base URL - Backend runs on HTTP for development
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Customer API
export const customerAPI = {
  getAll: () => apiClient.get('/customer'),
  getById: (id) => apiClient.get(`/customer/${id}`),
  create: (data) => apiClient.post('/customer/create', data),
  update: (id, data) => apiClient.patch(`/customer/${id}`, data),
  delete: (id) => apiClient.delete(`/customer/${id}`),
  getInteractions: (id) => apiClient.get(`/customer/interactions/${id}`),
  getJourney: (id) => apiClient.get(`/customer/journey/${id}`),
};

// Product API
export const productAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.patch(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Task API
export const taskAPI = {
  getAll: () => apiClient.get('/tasks'),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  getKanban: () => apiClient.get('/tasks/kanban'),
  updateStatus: (id, status) => apiClient.patch(`/tasks/status/${id}?newStatus=${status}`),
  reassign: (id, employeeId) => apiClient.patch(`/tasks/reassign/${id}?newEmployeeId=${employeeId}`),
};

// Campaign API
export const campaignAPI = {
  getAll: () => apiClient.get('/campaigns'),
  getById: (id) => apiClient.get(`/campaigns/${id}`),
  create: (data) => apiClient.post('/campaigns', data),
  update: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  delete: (id) => apiClient.delete(`/campaigns/${id}`),
  assignCustomers: (id, customerIds) => apiClient.post(`/campaigns/assign-customers/${id}`, customerIds),
  getTargetCustomers: (id) => apiClient.get(`/campaigns/target-customers/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getPipeline: () => apiClient.get('/analytics/pipeline'),
  getCustomerAnalytics: () => apiClient.get('/analytics/customers'),
  getEmployeePerformance: () => apiClient.get('/analytics/employees'),
  getMonthlyRevenue: () => apiClient.get('/analytics/revenue'),
};

// Contract API
export const contractAPI = {
  getAll: (params) => apiClient.get('/contract', { params }),
  getById: (id) => apiClient.get(`/contract/${id}`),
  create: (data) => apiClient.post('/contract', data),
  update: (id, data) => apiClient.put(`/contract/${id}`, data),
  delete: (id) => apiClient.delete(`/contract/${id}`),
};

// Employee API
export const employeeAPI = {
  getAll: () => apiClient.get('/employees'),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

// Notification API
export const notificationAPI = {
  getList: (params) => apiClient.get('/notification', { params }),
  markRead: (id) => apiClient.post(`/notification/${id}/read`),
  markUnread: (id) => apiClient.post(`/notification/${id}/unread`),
  markAllRead: () => apiClient.post('/notification/mark-all-read'),
  delete: (id) => apiClient.delete(`/notification/${id}`),
};

export default apiClient;
