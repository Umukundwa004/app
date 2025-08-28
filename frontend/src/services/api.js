import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  addAddress: (addressData) => api.post('/auth/address', addressData),
  updateAddress: (addressId, addressData) => api.put(`/auth/address/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/auth/address/${addressId}`),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Products API calls
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  search: (query) => api.get('/products', { params: { search: query } }),
  getByCategory: (category) => api.get('/products', { params: { category } }),
};

// Orders API calls
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}/cancel`),
};

// Payment API calls
export const paymentAPI = {
  momoPayment: (paymentData) => api.post('/payment/momo', paymentData),
  cardPayment: (paymentData) => api.post('/payment/card', paymentData),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSalesReport: (params) => api.get('/admin/sales-report', { params }),
  getLowStock: (threshold) => api.get('/admin/low-stock', { params: { threshold } }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  createProduct: (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(image => formData.append('images', image));
      } else {
        formData.append(key, productData[key]);
      }
    });
    return api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProduct: (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(image => formData.append('images', image));
      } else {
        formData.append(key, productData[key]);
      }
    });
    return api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  createCategory: (categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image') {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });
    return api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateCategory: (id, categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image') {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });
    return api.put(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getDeliveryZones: () => api.get('/admin/delivery-zones'),
  createDeliveryZone: (zoneData) => api.post('/admin/delivery-zones', zoneData),
  updateDeliveryZone: (id, zoneData) => api.put(`/admin/delivery-zones/${id}`, zoneData),
  deleteDeliveryZone: (id) => api.delete(`/admin/delivery-zones/${id}`),
};

export default api;