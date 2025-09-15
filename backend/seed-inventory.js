const mongoose = require('mongoose');
const path = require('path');

// Cargar variables de entorno desde el directorio backend
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema de ProductInventory
const productInventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  inventoryType: { 
    type: String, 
    enum: ['separate', 'shared'], 
    default: 'separate' 
  },
  mainStock: {
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  branchStocks: [{
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  alerts: {
    lowStock: { type: Number, default: 5 },
    outOfStock: { type: Boolean, default: false },
    lowStockAlert: { type: Boolean, default: false }
  },
  movements: [{
    type: { type: String, enum: ['in', 'out', 'adjustment', 'reserve', 'unreserve'] },
    quantity: { type: Number, required: true },
    reason: { type: String },
    reference: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now }
  }],
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
productInventorySchema.index({ product: 1, store: 1 }, { unique: true });

const ProductInventory = mongoose.model('ProductInventory', productInventorySchema);

// Esquema de Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  subcategory: { type: String },
  sku: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Esquema de Store
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

// Función para crear registros de inventario
const createInventoryRecords = async () => {
  try {
    console.log('🌱 Creando registros de inventario...');
    
    // Verificar si ya existen registros de inventario
    const existingInventory = await ProductInventory.countDocuments();
    console.log(`📊 Registros de inventario existentes: ${existingInventory}`);
    
    if (existingInventory > 0) {
      console.log(`⚠️  Ya existen ${existingInventory} registros de inventario`);
      const inventory = await ProductInventory.find({})
        .populate('product', 'name sku')
        .populate('store', 'name city')
        .limit(10);
      
      console.log('📋 Registros de inventario existentes:');
      inventory.forEach(inv => {
        console.log(`   - ${inv.product.name} (${inv.product.sku}) en ${inv.store.name} - Stock: ${inv.mainStock.quantity}`);
      });
      
      if (inventory.length > 10) {
        console.log(`   ... y ${inventory.length - 10} registros más`);
      }
      return;
    }
    
    // Verificar qué productos existen
    const totalProducts = await Product.countDocuments();
    console.log(`📦 Total de productos en la base de datos: ${totalProducts}`);
    
    const activeProducts = await Product.countDocuments({ isActive: true });
    console.log(`📦 Productos activos: ${activeProducts}`);
    
    const productsWithStore = await Product.countDocuments({ store: { $exists: true, $ne: null } });
    console.log(`📦 Productos con tienda asignada: ${productsWithStore}`);
    
    // Obtener algunos productos de ejemplo para ver su estructura
    const sampleProducts = await Product.find({}).limit(3);
    if (sampleProducts.length > 0) {
      console.log('📋 Ejemplo de productos:');
      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - isActive: ${product.isActive} - store: ${product.store}`);
      });
    }
    
    // Obtener todos los productos (activos o no)
    const products = await Product.find({}).populate('store');
    console.log(`📦 Encontrados ${products.length} productos totales`);
    
    if (products.length === 0) {
      console.log('❌ No hay productos en la base de datos.');
      return;
    }
    
    // Crear registros de inventario para cada producto
    const inventoryRecords = [];
    
    for (const product of products) {
      if (!product.store) {
        console.log(`⚠️  Producto ${product.name} no tiene tienda asignada, saltando...`);
        continue;
      }
      
      // Calcular stock disponible (usar el stock del producto como base)
      const totalStock = product.stock || Math.floor(Math.random() * 50) + 10;
      const reservedStock = Math.floor(Math.random() * 5); // 0-4 reservados
      const availableStock = Math.max(0, totalStock - reservedStock);
      
      // Determinar alertas
      const lowStockAlert = availableStock <= 5;
      const outOfStock = availableStock === 0;
      
      const inventoryRecord = {
        product: product._id,
        store: product.store._id,
        inventoryType: 'separate',
        mainStock: {
          quantity: totalStock,
          reserved: reservedStock,
          available: availableStock,
          lastUpdated: new Date()
        },
        alerts: {
          lowStock: 5,
          outOfStock: outOfStock,
          lowStockAlert: lowStockAlert
        },
        movements: [{
          type: 'in',
          quantity: totalStock,
          reason: 'Stock inicial',
          reference: 'SEED_INITIAL',
          performedAt: new Date()
        }],
        isActive: true
      };
      
      inventoryRecords.push(inventoryRecord);
    }
    
    console.log(`📝 Creando ${inventoryRecords.length} registros de inventario...`);
    
    // Insertar registros de inventario
    const createdInventory = await ProductInventory.insertMany(inventoryRecords);
    
    console.log(`✅ Creados ${createdInventory.length} registros de inventario:`);
    
    // Mostrar estadísticas por tienda
    const stats = await ProductInventory.aggregate([
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      {
        $unwind: '$storeInfo'
      },
      {
        $group: {
          _id: '$storeInfo.name',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$mainStock.quantity' },
          totalAvailable: { $sum: '$mainStock.available' },
          lowStockCount: { 
            $sum: { 
              $cond: [{ $eq: ['$alerts.lowStockAlert', true] }, 1, 0] 
            } 
          },
          outOfStockCount: { 
            $sum: { 
              $cond: [{ $eq: ['$alerts.outOfStock', true] }, 1, 0] 
            } 
          }
        }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`   - ${stat._id}:`);
      console.log(`     * ${stat.totalProducts} productos`);
      console.log(`     * Stock total: ${stat.totalStock}`);
      console.log(`     * Stock disponible: ${stat.totalAvailable}`);
      console.log(`     * Bajo stock: ${stat.lowStockCount}`);
      console.log(`     * Sin stock: ${stat.outOfStockCount}`);
    });
    
  } catch (error) {
    console.error('❌ Error creando registros de inventario:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await createInventoryRecords();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createInventoryRecords, ProductInventory, Product, Store };
