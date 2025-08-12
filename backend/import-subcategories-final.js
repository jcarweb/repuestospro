const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Cargar los modelos
require('./src/models/Category');
require('./src/models/Subcategory');

function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  return lines
    .filter(line => line.trim() !== '')
    .map(line => {
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
      
      result.push(current.trim());
      return result.map(cell => cell.replace(/^"|"$/g, ''));
    });
}

function readCSVFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCSV(content);
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error);
    throw error;
  }
}

async function importSubcategories() {
  try {
    console.log('🚀 Iniciando importación de subcategorías...');
    
    // Conectar usando la configuración del .env
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB Atlas');
    
    const Category = mongoose.model('Category');
    const Subcategory = mongoose.model('Subcategory');
    
    // Leer el archivo de subcategorías con IDs reales
    console.log('📖 Leyendo subcategorías...');
    const subcategoriesData = readCSVFile('real-subcategories-with-real-ids.csv');
    
    const subcategories = [];
    
    // Saltar la primera fila (encabezados)
    for (let i = 1; i < subcategoriesData.length; i++) {
      const row = subcategoriesData[i];
      if (row.length >= 6) {
        subcategories.push({
          categoryId: row[0], // ID de la categoría (ya mapeado)
          name: row[1],
          description: row[2] || '',
          vehicleType: row[3] || 'car',
          order: parseInt(row[4]) || 1,
          isActive: true,
          icon: row[5] || '',
          image: row[6] || ''
        });
      }
    }
    
    console.log(`✅ ${subcategories.length} subcategorías procesadas`);
    
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
      console.log(`⚠️ ${invalidSubcategories.length} subcategorías con IDs de categoría inválidos`);
    }
    
    // Limpiar colección de subcategorías existente
    await Subcategory.deleteMany({});
    console.log('🧹 Colección de subcategorías limpiada');
    
    // Insertar subcategorías válidas
    if (validSubcategories.length > 0) {
      const createdSubcategories = await Subcategory.insertMany(validSubcategories);
      console.log(`✅ ${createdSubcategories.length} subcategorías insertadas`);
    }
    
    console.log('🎉 Importación de subcategorías completada exitosamente');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error en la importación:', error.message);
    await mongoose.disconnect();
  }
}

importSubcategories(); 