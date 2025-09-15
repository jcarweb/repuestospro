const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro';
    console.log('📍 URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Verificar si hay productos en la base de datos
    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      category: String,
      brand: String,
      sku: String,
      stock: Number,
      isActive: Boolean,
      isFeatured: Boolean,
      images: [String],
      tags: [String],
      store: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    }));
    
    const productCount = await Product.countDocuments();
    console.log(`📦 Productos en la base de datos: ${productCount}`);
    
    // Verificar si hay tiendas en la base de datos
    const Store = mongoose.model('Store', new mongoose.Schema({
      name: String,
      description: String,
      address: String,
      city: String,
      state: String,
      country: String,
      phone: String,
      email: String,
      isActive: Boolean,
      isMainStore: Boolean,
      owner: mongoose.Schema.Types.ObjectId,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      createdAt: Date,
      updatedAt: Date
    }));
    
    const storeCount = await Store.countDocuments();
    console.log(`🏪 Tiendas en la base de datos: ${storeCount}`);
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
