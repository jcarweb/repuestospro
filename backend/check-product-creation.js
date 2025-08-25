const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasya', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Importar modelos
const Product = require('./src/models/Product');
const Store = require('./src/models/Store');
const ContentFilter = require('./src/models/ContentFilter');

async function checkProductCreation() {
  try {
    console.log('🔍 Verificando configuración para creación de productos...');
    
    // 1. Verificar conexión a MongoDB
    console.log('✅ Conexión a MongoDB establecida');
    
    // 2. Verificar si existe al menos una tienda
    const stores = await Store.find({ isActive: true }).limit(1);
    if (stores.length === 0) {
      console.log('❌ No se encontraron tiendas activas');
      return;
    }
    const testStore = stores[0];
    console.log('✅ Tienda encontrada:', testStore.name);
    
    // 3. Verificar configuración de ContentFilter
    const contentFilters = await ContentFilter.find({ isActive: true });
    console.log('📋 Filtros de contenido activos:', contentFilters.length);
    
    // 4. Verificar configuración de Cloudinary
    console.log('☁️ Configuración Cloudinary:');
    console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'No configurado');
    console.log('  - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'No configurado');
    console.log('  - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'No configurado');
    
    // 5. Probar creación de producto sin imágenes
    console.log('🧪 Probando creación de producto sin imágenes...');
    
    const testProductData = {
      name: 'Producto de Prueba',
      description: 'Descripción de prueba sin información de contacto',
      price: 100,
      category: 'Motor',
      brand: 'Toyota',
      subcategory: 'Frenos',
      sku: `TEST-${Date.now()}`,
      originalPartCode: 'TEST-001',
      stock: 10,
      isActive: true,
      isFeatured: false,
      tags: ['test', 'motor'],
      specifications: { test: 'valor' },
      images: [],
      store: testStore._id,
      createdBy: testStore.owner || testStore._id
    };
    
    console.log('📝 Datos del producto de prueba:', testProductData);
    
    const testProduct = new Product(testProductData);
    await testProduct.save();
    
    console.log('✅ Producto de prueba creado exitosamente');
    console.log('✅ Producto ID:', testProduct._id);
    
    // 6. Limpiar producto de prueba
    await Product.findByIdAndDelete(testProduct._id);
    console.log('🧹 Producto de prueba eliminado');
    
    console.log('🎉 Todas las verificaciones pasaron exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

checkProductCreation();
