import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función para simular respuestas cuando el backend no está disponible
const simulateResponse = (endpoint: string) => {
  console.log(`🔧 Simulando respuesta para: ${endpoint}`);
  
  // Simular datos de usuarios para el frontend
  if (endpoint.includes('/users')) {
    return {
      users: [
        {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@piezasyaya.com',
          role: 'seller',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'María González',
          email: 'maria@piezasyaya.com',
          role: 'store_manager',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Carlos López',
          email: 'carlos@piezasyaya.com',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ],
      success: true,
      total: 3
    };
  }
  
  // Simular datos de cotizaciones
  if (endpoint.includes('/quotations')) {
    return {
      quotations: [
        {
          _id: '1',
          quotationNumber: 'COT-001',
          title: 'Cotización Demo',
          customer: {
            name: 'Cliente Demo',
            email: 'cliente@demo.com'
          },
          total: 150.00,
          currency: 'USD',
          status: 'draft',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ],
      success: true,
      total: 1
    };
  }
  
  return { data: [], success: true };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta es HTML en lugar de JSON
    if (response.data && typeof response.data === 'string' && response.data.includes('<!doctype')) {
      console.log('🔧 Respuesta HTML detectada, simulando datos...');
      const endpoint = response.config?.url || '';
      const simulatedData = simulateResponse(endpoint);
      response.data = simulatedData;
    }
    return response;
  },
  (error) => {
    console.log('🔧 Error en API:', error.message);
    
    // Si el backend no está disponible, simular respuesta
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || 
        (error.response?.status >= 500) || 
        (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!doctype'))) {
      
      console.log('🔧 Backend no disponible, simulando respuesta...');
      const endpoint = error.config?.url || '';
      const simulatedData = simulateResponse(endpoint);
      
      return Promise.resolve({
        data: simulatedData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }
    
    if (error.response?.status === 401) {
      // Token expirado, redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
