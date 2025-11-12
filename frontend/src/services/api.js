import axios from 'axios';

// Для Vite используй import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const usersAPI = {
  create: (userData) => api.post('/users', userData),
  getById: (userId) => api.get(`/users/${userId}`),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
};

// Tasks API
export const tasksAPI = {
  getByDate: (userId, date) => api.get(`/users/${userId}/tasks?date=${date}`),
  create: (userId, taskData) => api.post(`/users/${userId}/tasks`, taskData),
  update: (userId, taskId, taskData) => api.put(`/users/${userId}/tasks/${taskId}`, taskData),
  delete: (userId, taskId) => api.delete(`/users/${userId}/tasks/${taskId}`),
  toggleComplete: (userId, taskId) => api.patch(`/users/${userId}/tasks/${taskId}/toggle`),
  updatePriority: (userId, taskId, priority) => 
    api.patch(`/users/${userId}/tasks/${taskId}/priority`, { priority }),
};

// Statistics API
export const statsAPI = {
  getSummary: (userId) => api.get(`/users/${userId}/stats/summary`),
  getCalendar: (userId, year, month) => 
    api.get(`/users/${userId}/stats/calendar?year=${year}&month=${month}`),
  getDaily: (userId, startDate, endDate) =>
    api.get(`/users/${userId}/stats/daily?start_date=${startDate}&end_date=${endDate}`),
};