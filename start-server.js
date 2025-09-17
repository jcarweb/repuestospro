#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor PiezasYA...');

try {
  // Cambiar al directorio backend
  process.chdir(path.join(__dirname, 'backend'));
  console.log('📁 Directorio actual:', process.cwd());
  
  // Verificar si node_modules existe
  const fs = require('fs');
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Verificar si dist existe
  if (!fs.existsSync('dist')) {
    console.log('🔨 Compilando proyecto...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  console.log('▶️ Iniciando servidor...');
  // Ejecutar el servidor
  execSync('node dist/index.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error al iniciar el servidor:', error.message);
  process.exit(1);
}
