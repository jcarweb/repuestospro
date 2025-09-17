import { API_BASE_URL } from '../../config/api';
// Configuración de entorno automática
export const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  const isVercel = window.location.hostname.includes('vercel.app');
  const isRender = window.location.hostname.includes('render.com');
  
  // URLs del backend
  const localBackend = 'API_BASE_URL';
  const productionBackend = 'https://piezasya-back.onrender.com/api';
  
  // Detectar entorno automáticamente
  let backendUrl: string;
  let environment: string;
  
  if (isDevelopment) {
    // Desarrollo local
    backendUrl = localBackend;
    environment = 'development';
  } else if (isVercel) {
    // Producción en Vercel
    backendUrl = productionBackend;
    environment = 'production';
  } else {
    // Fallback a producción
    backendUrl = productionBackend;
    environment = 'production';
  }
  
  // Usar variable de entorno si está definida
  if (import.meta.env.VITE_API_URL) {
    backendUrl = import.meta.env.VITE_API_URL;
  }
  
  console.log('🔧 Configuración de entorno:', {
    isDevelopment,
    isProduction,
    isVercel,
    isRender,
    backendUrl,
    environment,
    hostname: window.location.hostname
  });
  
  return {
    backendUrl,
    environment,
    isDevelopment,
    isProduction,
    isVercel,
    isRender
  };
};

// Configuración global
export const ENV = getEnvironmentConfig();
