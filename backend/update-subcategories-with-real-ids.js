const fs = require('fs');
const path = require('path');

// Mapeo de nombres de categorías a IDs reales de MongoDB
const categoryIdMap = {
  'Neumaticos y productos relacionados': '688bf07e20d85dee52256324',
  'Frenos': '688bf07e20d85dee52256325',
  'Filtros': '688bf07e20d85dee52256326',
  'Aceite y líquidos': '688bf07e20d85dee52256327',
  'Motor': '688bf07e20d85dee52256328',
  'Carroceria': '688bf07e20d85dee52256329',
  'Suspensión y brazos': '688bf07e20d85dee5225632a',
  'Amortiguación': '688bf07e20d85dee5225632b',
  'Limpieza de Cristales': '688bf07e20d85dee5225632c',
  'Sistemas de Escape': '688bf07e20d85dee5225632d',
  'Accesorios': '688bf07e20d85dee5225632e',
  'Sistema de encendido e incandecencia': '688bf07e20d85dee5225632f',
  'Interior y confort': '688bf07e20d85dee52256330',
  'Correas cadenas': '688bf07e20d85dee52256331',
  'Iluminación': '688bf07e20d85dee52256332',
  'Sistema eléctrico': '688bf07e20d85dee52256333',
  'Sistema de refrigeración de motor': '688bf07e20d85dee52256334',
  'tripoides': '688bf07e20d85dee52256335',
  'Productos de cuidado para el carro': '688bf07e20d85dee52256336',
  'Herramientas': '688bf07e20d85dee52256337',
  'Aire acondicionado': '688bf07e20d85dee52256338',
  'Sistema de Combustible': '688bf07e20d85dee52256339',
  'Dirección': '688bf07e20d85dee5225633a',
  'Transmisión': '688bf07e20d85dee5225633b',
  'Sujeciones': '688bf07e20d85dee5225633c',
  'Mangueras': '688bf07e20d85dee5225633d',
  'Juntas y retenes': '688bf07e20d85dee5225633e',
  'Calefacción / Ventilación': '688bf07e20d85dee5225633f',
  'Suspensión Neumática': '688bf07e20d85dee52256340',
  'Sensores Reles Unidades de control': '688bf07e20d85dee52256341',
  'Kit de reparación': '688bf07e20d85dee52256342',
  'Arboles de transmisión y diferenciales': '688bf07e20d85dee52256343',
  'Remolque / Piezas adicionales': '688bf07e20d85dee52256344'
};

// Leer el archivo CSV original
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
const updatedCsvPath = path.join(__dirname, 'real-subcategories-with-real-ids.csv');
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