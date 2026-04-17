/**
 * Axios API Service
 * Centralized HTTP client with interceptors
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Convenience service methods ───────────────────────────────────

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const interviewService = {
  start: (setup) => api.post('/interview/start', setup),
  getQuestions: (id) => api.get(`/interview/questions/${id}`),
  submit: (interviewId, answers) => api.post('/interview/submit', { interviewId, answers }),
  getHistory: (params) => api.get('/interview/history', { params }),
  getById: (id) => api.get(`/interview/${id}`),
  abandon: (id) => api.patch(`/interview/${id}/abandon`),
};

export const aiService = {
  getFeedback: (interviewId) => api.post('/ai/feedback', { interviewId }),
};

export const resourceService = {
  getAll: (params) => api.get('/resources', { params }),
};

export const profileService = {
  uploadResume: (formData) =>
    api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAnalytics: () => api.get('/profile/analytics'),
};
