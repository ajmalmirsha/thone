import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

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
    if (error.response?.status === 401) {
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
