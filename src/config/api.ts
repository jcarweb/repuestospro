import axios from 'axios'; 
 
export const API_BASE_URL = 'http://localhost:5000/api'; 
export const api = axios.create({ 
  baseURL: API_BASE_URL, 
  timeout: 10000, 
  headers: { 
    'Content-Type': 'application/json', 
  }, 
}); 

// Exportación por defecto para compatibilidad
export default api;
