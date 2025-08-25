require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

console.log('🔍 Verificando configuración de Cloudinary...');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No configurado');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ No configurado');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ No configurado');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Probar conexión con Cloudinary
async function testCloudinaryConnection() {
  try {
    console.log('🔗 Probando conexión con Cloudinary...');
    
    // Intentar obtener información de la cuenta
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa con Cloudinary');
    console.log('📊 Respuesta:', result);
    
    // Intentar subir una imagen de prueba
    console.log('📤 Probando subida de imagen...');
    
    // Crear una imagen base64 simple (1x1 pixel transparente)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'piezasya/test',
      public_id: `test_${Date.now()}`,
      resource_type: 'image'
    });
    
    console.log('✅ Imagen de prueba subida exitosamente');
    console.log('📄 URL:', uploadResult.secure_url);
    console.log('🆔 Public ID:', uploadResult.public_id);
    
    // Eliminar la imagen de prueba
    console.log('🗑️ Eliminando imagen de prueba...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Imagen de prueba eliminada');
    
  } catch (error) {
    console.error('❌ Error con Cloudinary:', error.message);
    console.error('❌ Error completo:', error);
  }
}

testCloudinaryConnection();
