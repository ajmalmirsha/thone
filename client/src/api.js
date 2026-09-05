import axios from 'axios';

const API_BASE = 'https://thone-aruf.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // Don't intercept auth endpoints — they handle their own errors
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getPatientScans = (patientId) => api.get(`/patients/${patientId}/scans`);
export const analyzeMedicalScan = (patientId, data) => api.post(`/patients/${patientId}/scans/analyze`, data);
export const applyScanActions = (scanId) => api.post(`/scans/${scanId}/apply`);
export const deleteMedicalScan = (scanId) => api.delete(`/scans/${scanId}`);
export const deletePatient = (patientId) => api.delete(`/patients/${patientId}`);

export default api;
