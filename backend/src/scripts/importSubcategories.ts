import mongoose from 'mongoose';
import fs from 'fs';
import Subcategory from '../models/Subcategory';
import Category from '../models/Category';
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
async function importSubcategories(subcategoriesFile: string): Promise<void> {
  try {
    console.log('🚀 Iniciando importación de subcategorías desde CSV...');
    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log(`📖 Leyendo subcategorías desde: ${subcategoriesFile}`);
    const subcategoriesData = readCSVFile(subcategoriesFile);
    const subcategories = [];
    // Saltar la primera fila (encabezados)
    for (let i = 1; i < subcategoriesData.length; i++) {
      const row = subcategoriesData[i];
      if (row && row.length >= 6) {
        subcategories.push({
          categoryId: row[0] || '', // ID de la categoría (ya mapeado)
          name: row[1] || '',
          description: row[2] || '',
          vehicleType: row[3] || 'car',
          order: parseInt(row[4] || '1') || 1,
          isActive: true,
          icon: row[5] || '',
          image: row[6] || ''
        });
      }
    }
    // Verificar que las categorías existen
    const categoryIds = [...new Set(subcategories.map(sub => sub.categoryId))];
    const existingCategories = await Category.find({ _id: { $in: categoryIds } });
    const existingCategoryIds = existingCategories.map(cat => cat._id?.toString() || '');
    const validSubcategories = subcategories.filter(sub =>
      existingCategoryIds.includes(sub.categoryId)
    );
    const invalidSubcategories = subcategories.filter(sub =>
      !existingCategoryIds.includes(sub.categoryId)
    );
    if (invalidSubcategories.length > 0) {
      invalidSubcategories.forEach(sub => {
        console.log(`   - ${sub.name} (categoryId: ${sub.categoryId})`);
      });
    }
    // Limpiar colección de subcategorías existente
    await Subcategory.deleteMany({});
    console.log('🧹 Colección de subcategorías limpiada');
    // Insertar subcategorías válidas
    if (validSubcategories.length > 0) {
      const createdSubcategories = await Subcategory.insertMany(validSubcategories);
    }
    console.log('🎉 Importación de subcategorías completada exitosamente');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  } catch (error) {
    console.error('❌ Error en la importación:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}
// Obtener el archivo de subcategorías desde los argumentos de línea de comandos
const subcategoriesFile = process.argv[2];
if (!subcategoriesFile) {
  console.error('❌ Error: Debe especificar un archivo de subcategorías');
  console.log('Uso: npm run import-subcategories <archivo-subcategorias.csv>');
  process.exit(1);
}
importSubcategories(subcategoriesFile);