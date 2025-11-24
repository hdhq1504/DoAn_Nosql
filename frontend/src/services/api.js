import axios from 'axios';

// API Base URL - Backend runs on HTTPS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

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
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
  getInteractions: (id) => apiClient.get(`/customers/${id}/interactions`),
  getJourney: (id) => apiClient.get(`/customers/${id}/journey`),
};

// Product API
export const productAPI = {
  getAll: () => apiClient.get('/products'),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
};

// Task API
export const taskAPI = {
  getAll: () => apiClient.get('/tasks'),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
};

// Campaign API
export const campaignAPI = {
  getAll: () => apiClient.get('/campaigns'),
  getById: (id) => apiClient.get(`/campaigns/${id}`),
  create: (data) => apiClient.post('/campaigns', data),
  update: (id, data) => apiClient.put(`/campaigns/${id}`, data),
  delete: (id) => apiClient.delete(`/campaigns/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getReports: () => apiClient.get('/analytics/reports'),
};

// Contract API
export const contractAPI = {
  getAll: () => apiClient.get('/contracts'),
  getById: (id) => apiClient.get(`/contracts/${id}`),
  create: (data) => apiClient.post('/contracts', data),
  update: (id, data) => apiClient.put(`/contracts/${id}`, data),
  delete: (id) => apiClient.delete(`/contracts/${id}`),
};

export default apiClient;
