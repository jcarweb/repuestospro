#!/usr/bin/env node

/**
 * Script para poblar la base de datos con marcas de vehículos específicas de Venezuela
 * 
 * Uso:
 *   node seed-venezuela-brands.js
 * 
 * O con npm:
 *   npm run seed:venezuela-brands
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando proceso de carga de marcas venezolanas...\n');

// Compilar TypeScript y ejecutar el script
const scriptPath = path.join(__dirname, 'src/scripts/seedVenezuelaBrands.ts');

exec(`npx ts-node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando el script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Advertencias:', stderr);
  }
  
  console.log(stdout);
  console.log('\n✅ Proceso completado!');
});
