import axios from 'axios';

const API_BASE_URL = process.env['NX_API_URL'] || 'http://localhost:3333/api';

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
