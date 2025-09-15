const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Sembrando categorías de repuestos automotrices...\n');

// Ejecutar el script de TypeScript
const scriptPath = path.join(__dirname, 'src/scripts/seedCategories.ts');
const command = `npx ts-node ${scriptPath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando el script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Advertencias:', stderr);
  }
  
  console.log(stdout);
  console.log('✅ Proceso completado');
});
