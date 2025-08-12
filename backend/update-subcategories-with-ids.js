const fs = require('fs');
const path = require('path');

// Mapeo de nombres de categorías a IDs de MongoDB
const categoryIdMap = {
  'Neumaticos y productos relacionados': '688be19c6ac83beacbf4fb38',
  'Frenos': '688be19c6ac83beacbf4fb39',
  'Filtros': '688be19c6ac83beacbf4fb3a',
  'Aceite y líquidos': '688be19c6ac83beacbf4fb3b',
  'Motor': '688be19c6ac83beacbf4fb3c',
  'Carroceria': '688be19c6ac83beacbf4fb3d',
  'Suspensión y brazos': '688be19c6ac83beacbf4fb3e',
  'Amortiguación': '688be19c6ac83beacbf4fb3f',
  'Limpieza de Cristales': '688be19c6ac83beacbf4fb40',
  'Sistemas de Escape': '688be19c6ac83beacbf4fb41',
  'Accesorios': '688be19c6ac83beacbf4fb42',
  'Sistema de encendido e incandecencia': '688be19c6ac83beacbf4fb43',
  'Interior y confort': '688be19c6ac83beacbf4fb44',
  'Correas cadenas': '688be19c6ac83beacbf4fb45',
  'Iluminación': '688be19c6ac83beacbf4fb46',
  'Sistema eléctrico': '688be19c6ac83beacbf4fb47',
  'Sistema de refrigeración de motor': '688be19c6ac83beacbf4fb48',
  'tripoides': '688be19c6ac83beacbf4fb49',
  'Productos de cuidado para el carro': '688be19c6ac83beacbf4fb4a',
  'Herramientas': '688be19c6ac83beacbf4fb4b',
  'Aire acondicionado': '688be19c6ac83beacbf4fb4c',
  'Sistema de Combustible': '688be19c6ac83beacbf4fb4d',
  'Dirección': '688be19c6ac83beacbf4fb4e',
  'Transmisión': '688be19c6ac83beacbf4fb4f',
  'Sujeciones': '688be19c6ac83beacbf4fb50',
  'Mangueras': '688be19c6ac83beacbf4fb51',
  'Juntas y retenes': '688be19c6ac83beacbf4fb52',
  'Calefacción / Ventilación': '688be19c6ac83beacbf4fb53',
  'Suspensión Neumática': '688be19c6ac83beacbf4fb54',
  'Sensores Reles Unidades de control': '688be19c6ac83beacbf4fb55',
  'Kit de reparación': '688be19c6ac83beacbf4fb56',
  'Arboles de transmisión y diferenciales': '688be19c6ac83beacbf4fb57',
  'Remolque / Piezas adicionales': '688be19c6ac83beacbf4fb58'
};

// Leer el archivo CSV actual
const csvPath = path.join(__dirname, 'real-subcategories.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Dividir en líneas
const lines = csvContent.split('\n');
const header = lines[0];
const dataLines = lines.slice(1);

// Procesar cada línea
const updatedLines = [header];
let orderCounter = 1;

dataLines.forEach(line => {
  if (line.trim()) {
    const columns = line.split(',');
    const categoryName = columns[0];
    const categoryId = categoryIdMap[categoryName];
    
    if (categoryId) {
      // Reemplazar el nombre de la categoría con el ID
      columns[0] = categoryId;
      // Actualizar el orden
      columns[4] = orderCounter.toString();
      updatedLines.push(columns.join(','));
      orderCounter++;
    } else {
      console.log(`⚠️ Categoría no encontrada: ${categoryName}`);
    }
  }
});

// Escribir el archivo actualizado
const updatedCsvPath = path.join(__dirname, 'real-subcategories-with-ids.csv');
fs.writeFileSync(updatedCsvPath, updatedLines.join('\n'));

console.log(`✅ Archivo actualizado: ${updatedCsvPath}`);
console.log(`📊 Total de subcategorías procesadas: ${orderCounter - 1}`);

// Mostrar estadísticas por categoría
const stats = {};
dataLines.forEach(line => {
  if (line.trim()) {
    const columns = line.split(',');
    const categoryName = columns[0];
    if (categoryIdMap[categoryName]) {
      stats[categoryName] = (stats[categoryName] || 0) + 1;
    }
  }
});

console.log('\n📈 Estadísticas por categoría:');
Object.entries(stats).forEach(([category, count]) => {
  console.log(`   ${category}: ${count} subcategorías`);
}); 