// Centralized API Base URL configuration for local dev and production deployment
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '');
export default API_BASE_URL;
