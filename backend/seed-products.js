const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema simplificado de Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  vehicleType: { type: String, default: 'automovil' },
  deliveryType: { type: String, default: 'delivery_motorizado' },
  brand: { type: String, required: true },
  subcategory: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed },
  popularity: { type: Number, default: 0 },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Esquema simplificado de Store
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

// Datos de productos de prueba
const sampleProducts = [
  {
    name: 'Filtro de Aceite Motor Toyota',
    description: 'Filtro de aceite de alta calidad para motores Toyota',
    price: 25.99,
    category: 'motor',
    brand: 'toyota',
    subcategory: 'filtros',
    sku: 'FIL-TOY-001',
    stock: 50,
    tags: ['filtro', 'aceite', 'motor', 'toyota'],
    specifications: {
      marca: 'Toyota',
      categoria: 'Motor',
      subcategoria: 'Filtros',
      compatibilidad: 'Toyota Corolla, Camry, RAV4',
      garantia: '12 meses'
    }
  },
  {
    name: 'Pastillas de Freno Delanteras Honda',
    description: 'Pastillas de freno delanteras de alta calidad para Honda',
    price: 89.50,
    category: 'frenos',
    brand: 'honda',
    subcategory: 'pastillas',
    sku: 'PAST-HON-001',
    stock: 25,
    tags: ['frenos', 'pastillas', 'honda', 'delanteras'],
    specifications: {
      marca: 'Honda',
      categoria: 'Frenos',
      subcategoria: 'Pastillas',
      compatibilidad: 'Honda Civic, Accord, CR-V',
      garantia: '18 meses'
    }
  },
  {
    name: 'Amortiguador Trasero Nissan',
    description: 'Amortiguador trasero de suspensión para Nissan',
    price: 145.00,
    category: 'suspension',
    brand: 'nissan',
    subcategory: 'amortiguadores',
    sku: 'AMOR-NIS-001',
    stock: 15,
    tags: ['suspension', 'amortiguador', 'nissan', 'trasero'],
    specifications: {
      marca: 'Nissan',
      categoria: 'Suspensión',
      subcategoria: 'Amortiguadores',
      compatibilidad: 'Nissan Sentra, Altima, Pathfinder',
      garantia: '24 meses'
    }
  },
  {
    name: 'Batería 12V 60Ah Ford',
    description: 'Batería de 12V 60Ah para vehículos Ford',
    price: 120.00,
    category: 'electrico',
    brand: 'ford',
    subcategory: 'baterias',
    sku: 'BAT-FOR-001',
    stock: 30,
    tags: ['bateria', 'electrico', 'ford', '12v'],
    specifications: {
      marca: 'Ford',
      categoria: 'Eléctrico',
      subcategoria: 'Baterías',
      compatibilidad: 'Ford Focus, Fiesta, Escape',
      garantia: '36 meses'
    }
  },
  {
    name: 'Aceite Motor 5W-30 Chevrolet',
    description: 'Aceite de motor sintético 5W-30 para Chevrolet',
    price: 35.99,
    category: 'lubricantes',
    brand: 'chevrolet',
    subcategory: 'aceites',
    sku: 'ACE-CHE-001',
    stock: 100,
    tags: ['aceite', 'motor', 'chevrolet', '5w30'],
    specifications: {
      marca: 'Chevrolet',
      categoria: 'Lubricantes',
      subcategoria: 'Aceites',
      compatibilidad: 'Chevrolet Cruze, Malibu, Equinox',
      garantia: '12 meses'
    }
  }
];

// Función para crear productos de prueba
const createTestProducts = async () => {
  try {
    console.log('🌱 Creando productos de prueba...');
    
    // Verificar si ya existen productos
    const existingProducts = await Product.countDocuments();
    console.log(`📊 Productos existentes en la base de datos: ${existingProducts}`);
    
    if (existingProducts > 0) {
      console.log(`⚠️  Ya existen ${existingProducts} productos en la base de datos`);
      const products = await Product.find({}).select('name sku store').populate('store', 'name city');
      console.log('📋 Productos existentes:');
      products.slice(0, 10).forEach(product => {
        console.log(`   - ${product.name} (${product.sku}) - ${product.store ? product.store.name : 'Sin tienda'}`);
      });
      if (products.length > 10) {
        console.log(`   ... y ${products.length - 10} productos más`);
      }
      return;
    }
    
    // Obtener tiendas existentes
    const stores = await Store.find({ isActive: true });
    if (stores.length === 0) {
      console.log('❌ No hay tiendas activas. Ejecuta primero el script de tiendas.');
      return;
    }
    
    console.log(`🏪 Usando ${stores.length} tiendas para asignar productos`);
    
    // Crear productos para cada tienda
    const productsToCreate = [];
    
    for (const store of stores) {
      console.log(`📦 Creando productos para tienda: ${store.name}`);
      
      // Crear 3-5 productos por tienda
      const numProducts = Math.floor(Math.random() * 3) + 3; // 3-5 productos
      
      for (let i = 0; i < numProducts; i++) {
        const baseProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const product = {
          ...baseProduct,
          sku: `${baseProduct.sku}-${store._id.toString().slice(-4)}-${i + 1}`,
          store: store._id,
          stock: Math.floor(Math.random() * 50) + 10, // Stock entre 10 y 60
          price: baseProduct.price + (Math.random() * 20 - 10) // Precio con variación ±$10
        };
        productsToCreate.push(product);
      }
    }
    
    console.log(`📝 Creando ${productsToCreate.length} productos...`);
    
    // Insertar productos en la base de datos
    const createdProducts = await Product.insertMany(productsToCreate);
    
    console.log(`✅ Creados ${createdProducts.length} productos de prueba:`);
    
    // Mostrar estadísticas por tienda
    const stats = await Product.aggregate([
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
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} productos, stock total: ${stat.totalStock}, precio promedio: $${stat.avgPrice.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error creando productos de prueba:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await createTestProducts();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestProducts, Product, Store };
