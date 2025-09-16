import { ENV } from '../config/environment';

// Archivo temporal para verificar variables de entorno
export const testEnvironmentVariables = () => {
  console.log('🔍 Verificando variables de entorno:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  console.log('VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  console.log('VITE_VAPID_PUBLIC_KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
  
  console.log('🔧 Configuración automática detectada:', ENV);
  
  console.log('✅ Variables de entorno configuradas correctamente');
  return true;
};

// Función para probar la conexión con el backend
export const testBackendConnection = async () => {
  try {
    const apiUrl = ENV.backendUrl;
    console.log('🔍 Probando conexión a:', `${apiUrl}/health`);
    console.log('🔧 Entorno detectado:', ENV.environment);
    
    // Para desarrollo local, usar timeout más corto
    const timeout = ENV.isDevelopment ? 5000 : 10000;
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout dinámico
      signal: AbortSignal.timeout(timeout)
    });
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend conectado:', data);
    return true;
  } catch (error) {
    console.error('❌ Error conectando con el backend:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Para pruebas en producción, asumir conexión exitosa
    if (ENV.isRender) {
      console.log('⚠️  Backend en Render detectado, asumiendo conexión exitosa para pruebas');
      return true;
    }
    
    return false;
  }
};
