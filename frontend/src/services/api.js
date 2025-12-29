/**
 * API Service Layer
 * This module provides the interface for backend API operations.
 */

import axios from 'axios';

// Backend API Base URL - Proxy üzerinden erişim (CORS bypass)
// package.json'da "proxy": "http://localhost:8080" ayarlandı
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Custom Error class for API errors
class ApiError extends Error {
  constructor(message, success = false) {
    super(message);
    this.name = 'ApiError';
    this.success = success;
  }
}

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Request interceptor - Token ekleme (ileride auth eklenirse)

// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('emekToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );




const apiServices = {
  // SettingsService,
  // formService
};

// Named exports - form.js tarafından kullanılıyor
export { apiClient, API_BASE_URL, ApiError };

export default apiServices;
