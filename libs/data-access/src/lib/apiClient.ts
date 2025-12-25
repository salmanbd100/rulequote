import axios from 'axios';

// Use import.meta.env for Vite (browser environment)
// For Vite, environment variables must be prefixed with VITE_ to be exposed
const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - use Vite's import.meta.env
    return import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
  }
  // Node.js environment - safely check for process
  if (typeof process !== 'undefined' && process.env) {
    return process.env['NX_API_URL'] || 'http://localhost:3333/api';
  }
  return 'http://localhost:3333/api';
};

const API_BASE_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Handle common errors (401, 403, etc.)
    return Promise.reject(error);
  }
);
