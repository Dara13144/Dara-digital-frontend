import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local'));

const normalizeApiUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return normalizeApiUrl(envUrl);
  }
  if (isLocalhost) {
    return 'http://localhost:5001/api';
  }
  return 'https://dara-digital-backend.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('daramini_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global responses & errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('daramini_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daramini:unauthorized'));
      }
    }
    const errorData = error.response?.data?.error;
    const message = errorData?.message || error.message || 'Network error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const endpoints = {
  // Auth
  telegramAuth: (initData) => api.post('/telegram/auth', { initData }),
  googleAuth: (data) => api.post('/auth/google', data),
  mockLogin: (data) => api.post('/auth/mock-login', data),

  // User
  getProfile: () => api.get('/users/me'),
  updateLanguage: (language) => api.post('/users/language', { language }),
  syncAvatar: () => api.post('/users/sync-avatar'),
  updateAvatar: (avatarUrl) => api.put('/users/avatar', { avatarUrl }),

  // Catalog
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  getProducts: (params) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getProductById: (id) => api.get(`/products/${id}`),

  // Cart & Coupon
  calculateCart: (items, couponCode) => api.post('/cart/calculate', { items, couponCode }),
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  getSettings: () => api.get('/settings'),

  // Roblox
  checkRobloxUser: (query) => api.get(`/roblox/check?username=${encodeURIComponent(query)}`),

  // Orders
  checkout: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),

  // Payments
  createCutLuyPayment: (orderId) => api.post('/payments/cutluy/create', { orderId }),
  createAbaPayment: (orderId, paymentOption) => api.post('/payments/aba/create', { orderId, paymentOption }),
  payWithWallet: (orderId) => api.post('/payments/wallet/pay', { orderId }),
  checkPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),

  // Deliveries
  getOrderDeliveries: (orderId) => api.get(`/delivery/order/${orderId}`),
  getMyItems: () => api.get('/delivery/my-items'),

  // Wallet
  getWallet: () => api.get('/wallet'),
  getWalletTransactions: (params) => api.get('/wallet/transactions', { params }),
  initiateWalletTopup: (amount, method = 'cutluy_khqr') => api.post('/wallet/topup', { amount, method }),

  // Admin
  admin: {
    getDashboard: () => api.get('/admin/dashboard'),
    getProducts: (params) => api.get('/admin/products', { params }),
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    getProductStock: (productId, params) => api.get(`/admin/stock/${productId}`, { params }),
    addStockItem: (data) => api.post('/admin/stock/single', data),
    bulkAddStock: (data) => api.post('/admin/stock/bulk', data),
    deleteStockItem: (id) => api.delete(`/admin/stock/${id}`),

    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
    retryDelivery: (id) => api.post(`/admin/orders/${id}/retry-delivery`),
    updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

    getPayments: (params) => api.get('/admin/payments', { params }),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
    adjustUserBalance: (data) => api.post('/admin/users/balance', data),

    getCategories: () => api.get('/categories'),
    createCategory: (data) => api.post('/admin/categories', data),
    updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

    getCoupons: () => api.get('/admin/coupons'),
    createCoupon: (data) => api.post('/admin/coupons', data),
    updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),
    getLogs: (params) => api.get('/admin/logs', { params })
  }
};
