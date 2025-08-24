require('dotenv').config();
const { v2 as cloudinary } = require('cloudinary');

console.log('🔍 Verificando configuración de Cloudinary...\n');

// Verificar variables de entorno
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('📋 Variables de entorno:');
console.log(`   Cloud Name: ${cloudName ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   API Key: ${apiKey ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   API Secret: ${apiSecret ? '✅ Configurado' : '❌ Faltante'}`);

if (!cloudName || !apiKey || !apiSecret) {
  console.log('\n❌ Error: Faltan variables de entorno de Cloudinary');
  console.log('   Asegúrate de tener un archivo .env en el directorio backend con:');
  console.log('   CLOUDINARY_CLOUD_NAME=tu_cloud_name');
  console.log('   CLOUDINARY_API_KEY=tu_api_key');
  console.log('   CLOUDINARY_API_SECRET=tu_api_secret');
  process.exit(1);
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('\n🔧 Configurando Cloudinary...');

// Probar conexión con Cloudinary
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Conexión exitosa con Cloudinary');
    console.log(`   Status: ${result.status}`);
    console.log('\n🎉 Configuración de Cloudinary completada exitosamente!');
    console.log('   El sistema está listo para procesar imágenes.');
  })
  .catch(error => {
    console.log('❌ Error conectando con Cloudinary:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Verifica:');
    console.log('   1. Que las credenciales sean correctas');
    console.log('   2. Que tu cuenta de Cloudinary esté activa');
    console.log('   3. Que tengas conexión a internet');
  });
