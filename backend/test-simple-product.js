const mongoose = require('mongoose');

// Conectar a MongoDB directamente
mongoose.connect('mongodb://localhost:27017/piezasya', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definir esquema simple para Product
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  subcategory: { type: String },
  sku: { type: String, required: true },
  originalPartCode: { type: String },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  images: [{ type: String }],
  store: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índice compuesto para SKU único por tienda
ProductSchema.index({ sku: 1, store: 1 }, { unique: true });

const Product = mongoose.model('Product', ProductSchema);

// Definir esquema simple para Store
const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId },
  managers: [{ type: mongoose.Schema.Types.ObjectId }]
});

const Store = mongoose.model('Store', StoreSchema);

async function testProductCreation() {
  try {
    console.log('🔍 Iniciando prueba de creación de productos...');
    
    // 1. Verificar conexión
    console.log('✅ Conexión a MongoDB establecida');
    
    // 2. Buscar una tienda
    const stores = await Store.find({ isActive: true }).limit(1);
    if (stores.length === 0) {
      console.log('❌ No se encontraron tiendas activas');
      return;
    }
    const testStore = stores[0];
    console.log('✅ Tienda encontrada:', testStore.name);
    
    // 3. Crear producto de prueba
    const testProductData = {
      name: 'Producto de Prueba Simple',
      description: 'Descripción de prueba sin información de contacto',
      price: 100,
      category: 'Motor',
      brand: 'Toyota',
      subcategory: 'Frenos',
      sku: `TEST-SIMPLE-${Date.now()}`,
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
    
    // 4. Limpiar producto de prueba
    await Product.findByIdAndDelete(testProduct._id);
    console.log('🧹 Producto de prueba eliminado');
    
    console.log('🎉 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
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

testProductCreation();
