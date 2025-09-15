// Script de build personalizado para Vercel
const { execSync } = require('child_process');

console.log('🚀 Iniciando build para Vercel...');

// Instalar dependencias
console.log('📦 Instalando dependencias...');
execSync('npm install', { stdio: 'inherit' });

// Build del frontend
console.log('🔨 Construyendo frontend...');
execSync('npm run build:frontend', { stdio: 'inherit' });

console.log('✅ Build completado exitosamente!');
