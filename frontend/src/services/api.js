import axios from 'axios';
import { maxBridge } from './maxBridge.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const maxHeaders = maxBridge.getAuthHeaders();
  config.headers = { ...config.headers, ...maxHeaders };
  return config;
});

export const usersAPI = {
  create: (userData) => api.post('/users', userData),
  getById: (userId) => api.get(`/users/${userId}`),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
};

export const tasksAPI = {
  getByDate: (userId, date) => api.get(`/tasks/${userId}?date=${date}`),
  create: (userId, taskData) => api.post(`/tasks/${userId}`, taskData),
  update: (userId, taskId, taskData) => api.put(`/tasks/${userId}/${taskId}`, taskData),
  delete: (userId, taskId) => api.delete(`/tasks/${userId}/${taskId}`),
  toggleComplete: (userId, taskId) => api.patch(`/tasks/${userId}/${taskId}/toggle`),
  updatePriority: (userId, taskId, priority) => 
    api.patch(`/tasks/${userId}/${taskId}/priority`, { priority }),
};

export const statsAPI = {
  getSummary: (userId) => api.get(`/users/${userId}/stats/summary`),
  getCalendar: (userId, year, month) => 
    api.get(`/users/${userId}/stats/calendar?year=${year}&month=${month}`),
  getDaily: (userId, startDate, endDate) =>
    api.get(`/users/${userId}/stats/daily?start_date=${startDate}&end_date=${endDate}`),
};