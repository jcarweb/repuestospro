const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos');

// Definir esquemas
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  specifications: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

// Datos de prueba
const sampleCategories = [
  {
    name: 'Frenos',
    description: 'Sistema de frenos para vehículos',
    image: 'https://via.placeholder.com/150',
    order: 1
  },
  {
    name: 'Motor',
    description: 'Partes del motor y accesorios',
    image: 'https://via.placeholder.com/150',
    order: 2
  },
  {
    name: 'Suspensión',
    description: 'Componentes del sistema de suspensión',
    image: 'https://via.placeholder.com/150',
    order: 3
  },
  {
    name: 'Iluminación',
    description: 'Sistema de iluminación vehicular',
    image: 'https://via.placeholder.com/150',
    order: 4
  },
  {
    name: 'Herramientas',
    description: 'Herramientas para mecánica automotriz',
    image: 'https://via.placeholder.com/150',
    order: 5
  }
];

const sampleProducts = [
  {
    name: 'Pastillas de Freno Delanteras',
    description: 'Pastillas de freno de alta calidad para el eje delantero',
    price: 45.99,
    image: 'https://via.placeholder.com/300x200?text=Pastillas+Freno',
    brand: 'Brembo',
    sku: 'PF001',
    stock: 50,
    tags: ['frenos', 'seguridad', 'delantero']
  },
  {
    name: 'Aceite de Motor 5W-30',
    description: 'Aceite sintético de alto rendimiento para motor',
    price: 28.50,
    image: 'https://via.placeholder.com/300x200?text=Aceite+Motor',
    brand: 'Mobil',
    sku: 'AM001',
    stock: 100,
    tags: ['motor', 'aceite', 'sintético']
  },
  {
    name: 'Amortiguadores Traseros',
    description: 'Amortiguadores de gas para el eje trasero',
    price: 89.99,
    image: 'https://via.placeholder.com/300x200?text=Amortiguadores',
    brand: 'Monroe',
    sku: 'AT001',
    stock: 25,
    tags: ['suspensión', 'trasero', 'confort']
  },
  {
    name: 'Faros LED H4',
    description: 'Faros LED de alta intensidad para mejor visibilidad',
    price: 65.00,
    image: 'https://via.placeholder.com/300x200?text=Faros+LED',
    brand: 'Philips',
    sku: 'FL001',
    stock: 30,
    tags: ['iluminación', 'led', 'visibilidad']
  },
  {
    name: 'Juego de Llaves Combinadas',
    description: 'Set de llaves combinadas de 8-24mm',
    price: 35.99,
    image: 'https://via.placeholder.com/300x200?text=Llaves+Combinadas',
    brand: 'Stanley',
    sku: 'LC001',
    stock: 40,
    tags: ['herramientas', 'llaves', 'profesional']
  },
  {
    name: 'Filtro de Aire Motor',
    description: 'Filtro de aire de alta eficiencia para motor',
    price: 15.50,
    image: 'https://via.placeholder.com/300x200?text=Filtro+Aire',
    brand: 'Mann',
    sku: 'FA001',
    stock: 75,
    tags: ['motor', 'filtro', 'mantenimiento']
  },
  {
    name: 'Discos de Freno Traseros',
    description: 'Discos de freno ventilados para el eje trasero',
    price: 75.00,
    image: 'https://via.placeholder.com/300x200?text=Discos+Freno',
    brand: 'Brembo',
    sku: 'DF001',
    stock: 20,
    tags: ['frenos', 'trasero', 'ventilados']
  },
  {
    name: 'Bujías de Encendido',
    description: 'Bujías de iridio para mejor combustión',
    price: 12.99,
    image: 'https://via.placeholder.com/300x200?text=Bujías',
    brand: 'NGK',
    sku: 'BE001',
    stock: 60,
    tags: ['motor', 'encendido', 'iridio']
  },
  {
    name: 'Resortes de Suspensión',
    description: 'Resortes deportivos para mejor manejo',
    price: 120.00,
    image: 'https://via.placeholder.com/300x200?text=Resortes',
    brand: 'Eibach',
    sku: 'RS001',
    stock: 15,
    tags: ['suspensión', 'deportivo', 'manejo']
  },
  {
    name: 'Lámparas LED Interiores',
    description: 'Kit de lámparas LED para interior del vehículo',
    price: 25.99,
    image: 'https://via.placeholder.com/300x200?text=Lámparas+LED',
    brand: 'Osram',
    sku: 'LI001',
    stock: 45,
    tags: ['iluminación', 'interior', 'led']
  }
];

async function createSampleData() {
  try {
    console.log('🗑️ Limpiando datos existentes...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('📁 Creando categorías...');
    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ ${categories.length} categorías creadas`);

    console.log('📦 Creando productos...');
    const productsWithCategories = sampleProducts.map((product, index) => ({
      ...product,
      category: categories[index % categories.length]._id
    }));

    const products = await Product.insertMany(productsWithCategories);
    console.log(`✅ ${products.length} productos creados`);

    console.log('🎉 Datos de prueba creados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Categorías: ${categories.length}`);
    console.log(`- Productos: ${products.length}`);

    // Mostrar algunos productos creados
    console.log('\n📋 Productos disponibles:');
    const allProducts = await Product.find().populate('category', 'name');
    allProducts.forEach(product => {
      console.log(`- ${product.name} (${product.category.name}) - $${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

createSampleData(); 