import mongoose from 'mongoose';
import fs from 'fs';
import Brand from '../models/Brand';
import config from '../config/env';

function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n');
  return lines
    .filter(line => line.trim() !== '')
    .map(line => {
      // Manejar campos que contienen comas dentro de comillas
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Agregar el último campo
      result.push(current.trim());
      
      return result.map(cell => cell.replace(/^"|"$/g, ''));
    });
}

function readCSVFile(filePath: string): string[][] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSV(content);
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    throw error;
  }
}

async function importBrands(brandsFile: string): Promise<void> {
  try {
    console.log('🚀 Iniciando importación de marcas desde CSV...');

    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a la base de datos');

    console.log(`📖 Leyendo marcas desde: ${brandsFile}`);
    const brandsData = readCSVFile(brandsFile);
    
    const brands = [];
    
    // Saltar la primera fila (encabezados)
    for (let i = 1; i < brandsData.length; i++) {
      const row = brandsData[i];
      if (row.length >= 3) {
        brands.push({
          name: row[0],
          description: row[1] || '',
          vehicleType: row[2] || 'car',
          order: parseInt(row[3]) || 1,
          isActive: true,
          country: row[4] || '',
          website: row[5] || '',
          logo: row[6] || ''
        });
      }
    }
    
    console.log(`✅ ${brands.length} marcas procesadas`);

    // Limpiar colección de marcas existente
    await Brand.deleteMany({});
    console.log('🧹 Colección de marcas limpiada');

    // Insertar marcas
    if (brands.length > 0) {
      const createdBrands = await Brand.insertMany(brands);
      console.log(`✅ ${createdBrands.length} marcas insertadas`);
    }

    console.log('🎉 Importación de marcas completada exitosamente');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');

  } catch (error) {
    console.error('❌ Error en la importación:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Obtener el archivo de marcas desde los argumentos de línea de comandos
const brandsFile = process.argv[2];

if (!brandsFile) {
  console.error('❌ Error: Debe especificar un archivo de marcas');
  console.log('Uso: npm run import-brands <archivo-marcas.csv>');
  process.exit(1);
}

importBrands(brandsFile); 