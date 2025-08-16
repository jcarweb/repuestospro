const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Inicializando políticas de puntos...');

// Ejecutar el script de TypeScript
const scriptPath = path.join(__dirname, 'src/scripts/seedPointsPolicies.ts');

exec(`npx ts-node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando el script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Advertencias:', stderr);
  }
  
  console.log('✅ Script ejecutado correctamente');
  console.log(stdout);
});
