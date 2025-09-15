import axios from 'axios'; 

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
export const api = axios.create({ 
  baseURL: API_BASE_URL, 
  timeout: 10000, 
  headers: { 
    'Content-Type': 'application/json', 
  }, 
}); 

// Interceptor para agregar el token de autenticación automáticamente
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

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401, limpiar el token y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // No redirigir automáticamente, dejar que el componente maneje
    }
    return Promise.reject(error);
  }
);

// Exportación por defecto para compatibilidad
export default api;
