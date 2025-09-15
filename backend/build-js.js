const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando compilación JavaScript...');

try {
  // Crear directorio dist si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Compilar TypeScript sin verificación de tipos
  console.log('📦 Compilando TypeScript...');
  execSync('npx tsc --noEmitOnError false --skipLibCheck true --allowJs --target ES2020 --module commonjs --outDir dist --rootDir src', { stdio: 'inherit' });

  // Copiar archivos estáticos si existen
  const staticFiles = ['package.json', 'render.yaml'];
  staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('dist', file));
      console.log(`📋 Copiado ${file} a dist/`);
    }
  });

  console.log('✅ Compilación completada exitosamente!');
  console.log('📁 Archivos compilados en: dist/');
  
} catch (error) {
  console.error('❌ Error durante la compilación:', error.message);
  process.exit(1);
}
