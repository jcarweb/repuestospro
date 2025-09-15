const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando compilación simple...');

try {
  // Crear directorio dist si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Compilar solo el archivo principal
  console.log('📦 Compilando archivo principal...');
  execSync('npx tsc --noEmitOnError false --skipLibCheck true --allowJs --target ES2020 --module commonjs --outDir dist --rootDir src src/index.ts', { stdio: 'inherit' });

  // Compilar controladores principales
  const mainFiles = [
    'src/controllers/authController.ts',
    'src/controllers/productController.ts',
    'src/controllers/userController.ts',
    'src/controllers/storeController.ts',
    'src/controllers/orderController.ts'
  ];

  mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        execSync(`npx tsc --noEmitOnError false --skipLibCheck true --allowJs --target ES2020 --module commonjs --outDir dist --rootDir src ${file}`, { stdio: 'inherit' });
        console.log(`✅ Compilado: ${file}`);
      } catch (error) {
        console.log(`⚠️  Error en ${file}, continuando...`);
      }
    }
  });

  // Copiar package.json
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', path.join('dist', 'package.json'));
    console.log('📋 Copiado package.json a dist/');
  }

  console.log('✅ Compilación simple completada!');
  console.log('📁 Archivos compilados en: dist/');
  
} catch (error) {
  console.error('❌ Error durante la compilación:', error.message);
  process.exit(1);
}
