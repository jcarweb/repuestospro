const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// Cargar los modelos
require('./src/models/Category');
require('./src/models/Brand');
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

async function cleanAndImportAll() {
  try {
    console.log('🚀 Iniciando proceso completo de limpieza e importación...');
    
    // Conectar usando la configuración del .env
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB Atlas');
    
    const Category = mongoose.model('Category');
    const Brand = mongoose.model('Brand');
    const Subcategory = mongoose.model('Subcategory');
    
    // PASO 1: Limpiar todas las colecciones
    console.log('\n🧹 Limpiando todas las colecciones...');
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Subcategory.deleteMany({});
    console.log('✅ Colecciones limpiadas');
    
    // PASO 2: Importar categorías
    console.log('\n📖 Importando categorías...');
    const categoriesData = readCSVFile('real-categories.csv');
    
    const categories = [];
    for (let i = 1; i < categoriesData.length; i++) {
      const row = categoriesData[i];
      if (row.length >= 3) {
        categories.push({
          name: row[0],
          description: row[1] || '',
          vehicleType: row[2] || 'car',
          order: parseInt(row[3]) || 1,
          isActive: true,
          icon: row[4] || ''
        });
      }
    }
    
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categorías insertadas`);
    
    // PASO 3: Mostrar IDs de categorías
    console.log('\n📋 IDs de categorías creadas:');
    createdCategories.forEach(cat => {
      console.log(`   ${cat.name}: ${cat._id}`);
    });
    
    // PASO 4: Importar marcas
    console.log('\n📖 Importando marcas...');
    const brandsData = readCSVFile('real-brands.csv');
    
    const brands = [];
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
    
    const createdBrands = await Brand.insertMany(brands);
    console.log(`✅ ${createdBrands.length} marcas insertadas`);
    
    // PASO 5: Crear mapeo de categorías para subcategorías
    console.log('\n📋 Creando mapeo de categorías...');
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id.toString();
    });
    
    console.log('Mapeo de categorías:');
    Object.entries(categoryMap).forEach(([name, id]) => {
      console.log(`   ${name}: ${id}`);
    });
    
    // PASO 6: Actualizar archivo de subcategorías con IDs correctos
    console.log('\n📝 Actualizando archivo de subcategorías...');
    const subcategoriesData = readCSVFile('real-subcategories.csv');
    
    const updatedSubcategories = [];
    updatedSubcategories.push(subcategoriesData[0]); // Mantener encabezado
    
    for (let i = 1; i < subcategoriesData.length; i++) {
      const row = subcategoriesData[i];
      if (row.length >= 6) {
        const categoryName = row[0];
        const categoryId = categoryMap[categoryName];
        
        if (categoryId) {
          const updatedRow = [categoryId, ...row.slice(1)];
          updatedSubcategories.push(updatedRow);
        } else {
          console.log(`⚠️ Categoría no encontrada: ${categoryName}`);
        }
      }
    }
    
    // Escribir archivo actualizado
    const updatedContent = updatedSubcategories.map(row => row.join(',')).join('\n');
    fs.writeFileSync('real-subcategories-with-correct-ids.csv', updatedContent);
    console.log(`✅ Archivo actualizado: real-subcategories-with-correct-ids.csv`);
    console.log(`📊 ${updatedSubcategories.length - 1} subcategorías procesadas`);
    
    // PASO 7: Importar subcategorías
    console.log('\n📖 Importando subcategorías...');
    const subcategories = [];
    
    for (let i = 1; i < updatedSubcategories.length; i++) {
      const row = updatedSubcategories[i];
      if (row.length >= 6) {
        subcategories.push({
          categoryId: row[0],
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
    
    const createdSubcategories = await Subcategory.insertMany(subcategories);
    console.log(`✅ ${createdSubcategories.length} subcategorías insertadas`);
    
    console.log('\n🎉 Proceso completo finalizado exitosamente');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

cleanAndImportAll(); 