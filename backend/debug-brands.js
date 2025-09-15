#!/usr/bin/env node

/**
 * Script de depuración para verificar el proceso de creación de marcas
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

console.log('🔍 Configuración de depuración:');
console.log('   MONGODB_URI:', MONGODB_URI);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Esquema simple para Brand (igual al del script original)
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
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  history: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const VehicleType = mongoose.model('VehicleType', VehicleTypeSchema);

async function debugBrands() {
  try {
    console.log('\n🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar tipos de vehículos
    console.log('\n🔍 Verificando tipos de vehículos...');
    const vehicleTypes = await VehicleType.find({});
    console.log(`📊 Tipos de vehículos encontrados: ${vehicleTypes.length}`);
    
    vehicleTypes.forEach(vt => {
      console.log(`   - ${vt.name}: ${vt.description || 'Sin descripción'}`);
    });
    
    // Buscar tipos específicos
    const specificTypes = ['automovil', 'motocicleta', 'camion', 'maquinaria_agricola', 'maquinaria_industrial'];
    console.log('\n🔍 Verificando tipos específicos:');
    
    for (const typeName of specificTypes) {
      const vt = await VehicleType.findOne({ name: typeName });
      if (vt) {
        console.log(`✅ ${typeName}: ${vt._id}`);
      } else {
        console.log(`❌ ${typeName}: No encontrado`);
      }
    }
    
    // Verificar marcas existentes
    console.log('\n🔍 Verificando marcas existentes...');
    const totalBrands = await Brand.countDocuments();
    console.log(`📊 Total de marcas: ${totalBrands}`);
    
    // Intentar crear una marca de prueba
    console.log('\n🧪 Creando marca de prueba...');
    
    const testBrand = new Brand({
      name: 'Marca de Prueba Venezuela',
      description: 'Marca de prueba para verificar la conexión',
      country: 'Venezuela',
      vehicleTypes: vehicleTypes.length > 0 ? [vehicleTypes[0]._id] : [],
      isActive: true
    });
    
    try {
      await testBrand.save();
      console.log('✅ Marca de prueba creada exitosamente');
      
      // Verificar que se guardó
      const savedBrand = await Brand.findOne({ name: 'Marca de Prueba Venezuela' });
      if (savedBrand) {
        console.log('✅ Marca de prueba verificada en la base de datos');
        console.log(`   ID: ${savedBrand._id}`);
        console.log(`   País: ${savedBrand.country}`);
        console.log(`   Fecha: ${savedBrand.createdAt}`);
        
        // Eliminar la marca de prueba
        await Brand.deleteOne({ _id: savedBrand._id });
        console.log('🗑️  Marca de prueba eliminada');
      } else {
        console.log('❌ Marca de prueba no encontrada después de guardar');
      }
    } catch (error) {
      console.error('❌ Error creando marca de prueba:', error.message);
    }
    
    // Mostrar algunas marcas existentes
    console.log('\n📋 Algunas marcas existentes:');
    const sampleBrands = await Brand.find({}).limit(5).sort({ createdAt: -1 });
    sampleBrands.forEach(brand => {
      console.log(`   - ${brand.name} (${brand.country || 'N/A'}) - ${brand.createdAt}`);
    });
    
    console.log('\n✅ Depuración completada!');
    
  } catch (error) {
    console.error('❌ Error durante la depuración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la depuración
debugBrands();
