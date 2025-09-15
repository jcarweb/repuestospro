#!/usr/bin/env node

/**
 * Script de prueba para crear una marca venezolana
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

// Esquema simple para Brand
const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  vehicleTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleType',
    required: true
  }],
  country: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Brand = mongoose.model('Brand', BrandSchema);

// Esquema simple para VehicleType
const VehicleTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryType: {
    type: String,
    enum: ['delivery_motorizado', 'pickup'],
    required: true
  },
  icon: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const VehicleType = mongoose.model('VehicleType', VehicleTypeSchema);

async function testCreateBrand() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener un tipo de vehículo
    const vehicleType = await VehicleType.findOne({ name: 'motos' });
    if (!vehicleType) {
      console.log('❌ No se encontró el tipo de vehículo "motos"');
      return;
    }
    
    console.log(`✅ Tipo de vehículo encontrado: ${vehicleType.name} (${vehicleType._id})`);
    
    // Crear una marca venezolana de prueba
    const testBrand = new Brand({
      name: 'Bera',
      description: 'Marca venezolana de motocicletas',
      country: 'Venezuela',
      vehicleTypes: [vehicleType._id],
      isActive: true
    });
    
    console.log('🧪 Creando marca venezolana de prueba...');
    await testBrand.save();
    console.log('✅ Marca venezolana creada exitosamente');
    
    // Verificar que se creó
    const savedBrand = await Brand.findOne({ name: 'Bera' });
    if (savedBrand) {
      console.log('✅ Marca verificada en la base de datos:');
      console.log(`   - Nombre: ${savedBrand.name}`);
      console.log(`   - País: ${savedBrand.country}`);
      console.log(`   - Descripción: ${savedBrand.description}`);
      console.log(`   - Tipos de vehículo: ${savedBrand.vehicleTypes.length}`);
      console.log(`   - Fecha: ${savedBrand.createdAt}`);
    } else {
      console.log('❌ Marca no encontrada después de crear');
    }
    
    // Buscar todas las marcas venezolanas
    console.log('\n🇻🇪 Buscando todas las marcas venezolanas:');
    const venezuelaBrands = await Brand.find({ country: 'Venezuela' });
    console.log(`📊 Total de marcas venezolanas: ${venezuelaBrands.length}`);
    
    venezuelaBrands.forEach(brand => {
      console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testCreateBrand();
