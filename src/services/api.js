import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Request interceptor — token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — 401 pe logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────
export const authAPI = {
  login         : (data) => api.post('/auth/login', data),
  me            : ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Contacts ──────────────────────────────────
export const contactsAPI = {
  getAll   : (params) => api.get('/contacts', { params }),
  getOne   : (id)     => api.get(`/contacts/${id}`),
  create   : (data)   => api.post('/contacts', data),
  update   : (id, d)  => api.put(`/contacts/${id}`, d),
  delete   : (id)     => api.delete(`/contacts/${id}`),
  import   : (data)   => api.post('/contacts/import', data),
  optOut   : (id)     => api.post(`/contacts/${id}/opt-out`),
  getLists : ()       => api.get('/contacts/lists'),
  createList:(data)   => api.post('/contacts/lists', data),
  addToList: (id, d)  => api.post(`/contacts/lists/${id}/add`, d),
  deleteList:(id)     => api.delete(`/contacts/lists/${id}`),
};

// ── Campaigns ─────────────────────────────────
export const campaignsAPI = {
  getAll  : (params) => api.get('/campaigns', { params }),
  getOne  : (id)     => api.get(`/campaigns/${id}`),
  create  : (data)   => api.post('/campaigns', data),
  update  : (id, d)  => api.put(`/campaigns/${id}`, d),
  delete  : (id)     => api.delete(`/campaigns/${id}`),
  launch  : (id)     => api.post(`/campaigns/${id}/launch`),
  pause   : (id)     => api.post(`/campaigns/${id}/pause`),
  cancel  : (id)     => api.post(`/campaigns/${id}/cancel`),
  getStats: (id)     => api.get(`/campaigns/${id}/stats`),
};

// ── Templates ─────────────────────────────────
export const templatesAPI = {
  getAll  : (params) => api.get('/templates', { params }),
  getOne  : (id)     => api.get(`/templates/${id}`),
  create  : (data)   => api.post('/templates', data),
  update  : (id, d)  => api.put(`/templates/${id}`, d),
  delete  : (id)     => api.delete(`/templates/${id}`),
  preview : (id, d)  => api.post(`/templates/${id}/preview`, d),
};

// ── Messages ──────────────────────────────────
export const messagesAPI = {
  getAll : (params) => api.get('/messages', { params }),
  getOne : (id)     => api.get(`/messages/${id}`),
  getStats:()       => api.get('/messages/stats'),
};

// ── Analytics ─────────────────────────────────
export const analyticsAPI = {
  dashboard       : ()   => api.get('/analytics/dashboard'),
  campaignAnalytics:(id) => api.get(`/analytics/campaigns/${id}`),
};

// ── Admin ─────────────────────────────────────
export const adminAPI = {
  getUsers    : ()       => api.get('/admin/users'),
  createUser  : (data)   => api.post('/admin/users', data),
  updateUser  : (id, d)  => api.put(`/admin/users/${id}`, d),
  deleteUser  : (id)     => api.delete(`/admin/users/${id}`),
  systemStats : ()       => api.get('/admin/system-stats'),
  auditLogs   : (params) => api.get('/admin/audit-logs', { params }),
  optOuts     : ()       => api.get('/admin/opt-outs'),
};

export default api;