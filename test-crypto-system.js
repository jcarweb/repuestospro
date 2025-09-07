const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Función para hacer login
async function login(email, password) {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_BASE_URL}/crypto-auth/login`, {
      email,
      password
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login exitoso');
      console.log('👤 Usuario:', response.data.data.user.name);
      console.log('🔑 Rol:', response.data.data.user.role);
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    return false;
  }
}

// Función para subir una foto de prueba
async function uploadTestPhoto() {
  try {
    console.log('📸 Subiendo foto de prueba...');
    
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('name', 'Tienda de Prueba Crypto');
    formData.append('phone', '+584121234567');
    formData.append('lat', '10.4806');
    formData.append('lng', '-66.9036');
    formData.append('image', testImageBuffer, {
      filename: 'test-store.png',
      contentType: 'image/png'
    });

    const response = await axios.post(`${API_BASE_URL}/store-photos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      console.log('✅ Foto subida exitosamente');
      console.log('🆔 ID:', response.data.data.id);
      console.log('🌐 URL:', response.data.data.imageUrl);
      return response.data.data.id;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error subiendo foto:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para obtener fotos
async function getPhotos() {
  try {
    console.log('📋 Obteniendo fotos...');
    const response = await axios.get(`${API_BASE_URL}/store-photos`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Fotos obtenidas:', response.data.data.photos.length);
      return response.data.data.photos;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error obteniendo fotos:', error.response?.data?.message || error.message);
    return [];
  }
}

// Función para ejecutar enriquecimiento
async function runEnrichment(photoId = null) {
  try {
    console.log('🔄 Ejecutando enriquecimiento...');
    const response = await axios.post(`${API_BASE_URL}/store-photos/admin/enrichment/run`, {
      photoId
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Enriquecimiento iniciado');
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error ejecutando enriquecimiento:', error.response?.data?.message || error.message);
    return false;
  }
}

// Función para obtener estadísticas
async function getStats() {
  try {
    console.log('📊 Obteniendo estadísticas...');
    const response = await axios.get(`${API_BASE_URL}/store-photos/admin/enrichment/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Estadísticas obtenidas');
      console.log('📈 Total:', response.data.data.total);
      console.log('📊 Por estado:', response.data.data.byStatus);
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para verificar el token
async function verifyToken() {
  try {
    console.log('🔍 Verificando token...');
    const response = await axios.get(`${API_BASE_URL}/crypto-auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Token válido');
      console.log('👤 Usuario:', response.data.data.user.name);
      console.log('🔑 Rol:', response.data.data.user.role);
      return true;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('❌ Error verificando token:', error.response?.data?.message || error.message);
    return false;
  }
}

// Función principal de prueba
async function testCryptoSystem() {
  console.log('🚀 Iniciando prueba del sistema crypto...\n');

  // 1. Login
  const loginSuccess = await login('admin@piezasya.com', 'admin123');
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login. Terminando prueba.');
    return;
  }

  // 2. Verificar token
  await verifyToken();

  // 3. Obtener estadísticas iniciales
  await getStats();

  // 4. Subir foto de prueba
  const photoId = await uploadTestPhoto();
  if (!photoId) {
    console.log('❌ No se pudo subir foto. Terminando prueba.');
    return;
  }

  // 5. Obtener fotos
  await getPhotos();

  // 6. Ejecutar enriquecimiento
  await runEnrichment(photoId);

  // 7. Esperar un poco y verificar resultados
  console.log('⏳ Esperando 5 segundos para que se procese...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 8. Obtener estadísticas finales
  await getStats();

  // 9. Obtener fotos actualizadas
  const updatedPhotos = await getPhotos();
  const testPhoto = updatedPhotos.find(photo => photo._id === photoId);
  if (testPhoto) {
    console.log('📸 Estado de la foto de prueba:', testPhoto.status);
    if (testPhoto.status === 'enriched') {
      console.log('🎉 ¡Enriquecimiento exitoso!');
      console.log('📝 OCR Text:', testPhoto.ocrText || 'No disponible');
      console.log('🛒 MercadoLibre:', testPhoto.metrics.mercadoLibre?.found ? 'Encontrado' : 'No encontrado');
      console.log('🔍 DuckDuckGo:', testPhoto.metrics.duckduckgo?.found ? 'Encontrado' : 'No encontrado');
    }
  }

  console.log('\n✅ Prueba del sistema crypto completada!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testCryptoSystem().catch(console.error);
}

module.exports = {
  testCryptoSystem,
  login,
  uploadTestPhoto,
  getPhotos,
  runEnrichment,
  getStats,
  verifyToken
};
