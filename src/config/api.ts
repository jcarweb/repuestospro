import axios from 'axios';

// Configuración de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuración para retry logic
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    return error.response?.status === 429 || error.response?.status === 503;
  }
};

// Función para calcular delay exponencial
const getRetryDelay = (retryCount: number) => {
  return Math.min(1000 * Math.pow(2, retryCount), 10000);
};

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Manejar rate limiting (429) con retry logic
    if (retryConfig.retryCondition(error) && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= retryConfig.retries) {
        const delay = getRetryDelay(originalRequest._retryCount - 1);
        
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${originalRequest._retryCount}/${retryConfig.retries})`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, delay);
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
