require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  try {
    console.log('🔍 Verificando configuración de Cloudinary...');
    
    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ Faltante');
    console.log('  - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Faltante');
    console.log('  - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Faltante');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('\n❌ Error: Faltan variables de entorno de Cloudinary');
      console.log('📝 Crea un archivo .env en el directorio backend/ con:');
      console.log('   CLOUDINARY_CLOUD_NAME=tu_cloud_name');
      console.log('   CLOUDINARY_API_KEY=tu_api_key');
      console.log('   CLOUDINARY_API_SECRET=tu_api_secret');
      return;
    }
    
    // Probar conexión con Cloudinary
    console.log('\n🔗 Probando conexión con Cloudinary...');
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa:', result);
    
    // Verificar información de la cuenta
    console.log('\n📊 Información de la cuenta:');
    const accountInfo = await cloudinary.api.usage();
    console.log('  - Plan:', accountInfo.plan);
    console.log('  - Almacenamiento usado:', Math.round(accountInfo.used / 1024 / 1024), 'MB');
    console.log('  - Ancho de banda usado:', Math.round(accountInfo.bandwidth / 1024 / 1024), 'MB');
    console.log('  - Transformaciones usadas:', accountInfo.transformations.used);
    
    // Probar subida de imagen de prueba
    console.log('\n📤 Probando subida de imagen...');
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlc3Q8L3RleHQ+PC9zdmc+',
      {
        folder: 'piezasya/test',
        public_id: 'test-upload',
        overwrite: true
      }
    );
    
    console.log('✅ Imagen subida exitosamente:');
    console.log('  - URL:', uploadResult.secure_url);
    console.log('  - Public ID:', uploadResult.public_id);
    console.log('  - Tamaño:', uploadResult.bytes, 'bytes');
    
    // Eliminar imagen de prueba
    console.log('\n🗑️ Eliminando imagen de prueba...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Imagen eliminada:', deleteResult);
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ Cloudinary está configurado correctamente');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Solución: Verifica que las credenciales de Cloudinary sean correctas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Solución: Verifica tu conexión a internet');
    } else {
      console.log('\n💡 Revisa los logs para más detalles');
    }
  }
}

// Ejecutar pruebas
testCloudinary();
