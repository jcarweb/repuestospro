import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Subcategory from '../models/Subcategory';
import config from '../config/env';
interface CSVData {
  categories: any[];
  brands: any[];
  subcategories: any[];
}
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
async function importFromCSVFiles(
  categoriesFile?: string,
  brandsFile?: string,
  subcategoriesFile?: string
): Promise<void> {
  try {
    console.log('🚀 Iniciando importación desde archivos CSV...');
    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    const data: CSVData = { categories: [], brands: [], subcategories: [] };
    // Procesar archivo de categorías
    if (categoriesFile && fs.existsSync(categoriesFile)) {
      console.log(`📖 Leyendo categorías desde: ${categoriesFile}`);
      const categoriesData = readCSVFile(categoriesFile);
      // Saltar la primera fila (encabezados)
      for (let i = 1; i < categoriesData.length; i++) {
        const row = categoriesData[i];
        if (row && row.length >= 3) {
          data.categories.push({
            name: row[0] || '',
            description: row[1] || '',
            vehicleType: row[2] || 'car',
            order: parseInt(row[3] || '1') || 1,
            isActive: true,
            icon: row[4] || ''
          });
        }
      }
    }
    // Procesar archivo de marcas
    if (brandsFile && fs.existsSync(brandsFile)) {
      console.log(`📖 Leyendo marcas desde: ${brandsFile}`);
      const brandsData = readCSVFile(brandsFile);
      // Saltar la primera fila (encabezados)
      for (let i = 1; i < brandsData.length; i++) {
        const row = brandsData[i];
        if (row && row.length >= 3) {
          data.brands.push({
            name: row[0] || '',
            description: row[1] || '',
            vehicleType: row[2] || 'car',
            order: parseInt(row[3] || '1') || 1,
            isActive: true,
            country: row[4] || '',
            website: row[5] || '',
            logo: row[6] || ''
          });
        }
      }
    }
    // Procesar archivo de subcategorías
    if (subcategoriesFile && fs.existsSync(subcategoriesFile)) {
      console.log(`📖 Leyendo subcategorías desde: ${subcategoriesFile}`);
      const subcategoriesData = readCSVFile(subcategoriesFile);
      // Saltar la primera fila (encabezados)
      for (let i = 1; i < subcategoriesData.length; i++) {
        const row = subcategoriesData[i];
        if (row && row.length >= 6) {
          data.subcategories.push({
            categoryName: row[0] || '', // Nombre de la categoría padre
            name: row[1] || '',
            description: row[2] || '',
            vehicleType: row[3] || 'car',
            order: parseInt(row[4] || '1') || 1,
            icon: row[5] || '',
            image: row[6] || ''
          });
        }
      }
    }
    // Limpiar colecciones existentes
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('🧹 Colecciones limpiadas');
    // Insertar categorías
    if (data.categories.length > 0) {
      const createdCategories = await Category.insertMany(data.categories);
    }
    // Insertar marcas
    if (data.brands.length > 0) {
      const createdBrands = await Brand.insertMany(data.brands);
    }
    // Insertar subcategorías (necesitamos mapear categoryName a categoryId)
    if (data.subcategories.length > 0) {
      const categories = await Category.find({});
      const categoryMap = new Map(categories.map(cat => [cat.name, cat._id]));
      const subcategoriesWithIds = data.subcategories.map(sub => ({
        ...sub,
        categoryId: categoryMap.get(sub.categoryName),
      })).filter(sub => sub.categoryId); // Solo incluir si se encontró la categoría
      if (subcategoriesWithIds.length > 0) {
        await Subcategory.insertMany(subcategoriesWithIds);
      }
      // Mostrar subcategorías que no se pudieron mapear
      const unmappedSubcategories = data.subcategories.filter(sub =>
        !categoryMap.has(sub.categoryName)
      );
      if (unmappedSubcategories.length > 0) {
        unmappedSubcategories.forEach(sub => {
          console.log(`   - ${sub.name} (categoría: ${sub.categoryName})`);
        });
      }
    }
    console.log('🎉 Importación completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la importación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}
// Ejecutar el script si se llama directamente
if (require.main === module) {
  const categoriesFile = process.argv[2];
  const brandsFile = process.argv[3];
  const subcategoriesFile = process.argv[4];
  if (!categoriesFile && !brandsFile && !subcategoriesFile) {
    console.error('❌ Debes proporcionar al menos un archivo CSV');
    console.log('Uso: npm run import-csv [categories.csv] [brands.csv] [subcategories.csv]');
    process.exit(1);
  }
  importFromCSVFiles(categoriesFile, brandsFile, subcategoriesFile);
}
export default importFromCSVFiles;