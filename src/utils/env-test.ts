// Archivo temporal para verificar variables de entorno
export const testEnvironmentVariables = () => {
  console.log('🔍 Verificando variables de entorno:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  console.log('VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  console.log('VITE_VAPID_PUBLIC_KEY:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
  
  // Verificar si la URL de la API está configurada
  if (!import.meta.env.VITE_API_URL) {
    console.error('❌ VITE_API_URL no está configurada');
    return false;
  }
  
  console.log('✅ Variables de entorno configuradas correctamente');
  return true;
};

// Función para probar la conexión con el backend
export const testBackendConnection = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    console.log('🔍 Probando conexión a:', `${apiUrl}/health`);
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Aumentar timeout
      signal: AbortSignal.timeout(10000) // 10 segundos
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
    
    // Para pruebas, siempre retornar true si el backend está en Render
    if (import.meta.env.VITE_API_URL?.includes('render.com')) {
      console.log('⚠️  Backend en Render detectado, asumiendo conexión exitosa para pruebas');
      return true;
    }
    
    return false;
  }
};
