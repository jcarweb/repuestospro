const mongoose = require('mongoose');
require('dotenv').config();

// Definir esquemas directamente en el script
const WarrantySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['purchase_protection', 'return_guarantee', 'claim_protection'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'pending', 'resolved', 'expired', 'cancelled'],
    default: 'active'
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  
  // Cobertura y términos
  coverageAmount: { type: Number, required: true, min: 0 },
  coveragePercentage: { type: Number, required: true, min: 0, max: 100 },
  maxCoverageAmount: { type: Number, required: true, min: 0 },
  
  // Fechas
  activationDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  lastRenewalDate: { type: Date },
  
  // Términos específicos
  terms: {
    coversDefectiveProducts: { type: Boolean, default: true },
    coversNonDelivery: { type: Boolean, default: true },
    coversNotAsDescribed: { type: Boolean, default: true },
    coversLateDelivery: { type: Boolean, default: false },
    returnWindowDays: { type: Number, default: 30 },
    claimWindowDays: { type: Number, default: 90 }
  },
  
  // Costo y facturación
  cost: { type: Number, required: true, min: 0 },
  isIncluded: { type: Boolean, default: false },
  billingCycle: { 
    type: String, 
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  
  // Metadatos
  description: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Warranty = mongoose.model('Warranty', WarrantySchema);

// Configuraciones de garantías por defecto
const warrantyConfigs = [
  {
    name: 'Protección Básica de Compra',
    type: 'purchase_protection',
    level: 'basic',
    description: 'Protección básica que cubre productos defectuosos, no entregados o no conforme a la descripción',
    coveragePercentage: 100,
    maxCoverageAmount: 1000,
    costPercentage: 5,
    durationDays: 30,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: false,
      returnWindowDays: 30,
      claimWindowDays: 90
    }
  },
  {
    name: 'Protección Premium de Compra',
    type: 'purchase_protection',
    level: 'premium',
    description: 'Protección premium con cobertura extendida y beneficios adicionales',
    coveragePercentage: 100,
    maxCoverageAmount: 5000,
    costPercentage: 8,
    durationDays: 60,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: true,
      returnWindowDays: 45,
      claimWindowDays: 120
    }
  },
  {
    name: 'Protección Extendida de Compra',
    type: 'purchase_protection',
    level: 'extended',
    description: 'Protección extendida con máxima cobertura y beneficios completos',
    coveragePercentage: 100,
    maxCoverageAmount: 10000,
    costPercentage: 12,
    durationDays: 90,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: true,
      returnWindowDays: 60,
      claimWindowDays: 180
    }
  },
  {
    name: 'Garantía Básica de Devolución',
    type: 'return_guarantee',
    level: 'basic',
    description: 'Garantía básica para devoluciones sin preguntas',
    coveragePercentage: 100,
    maxCoverageAmount: 500,
    costPercentage: 3,
    durationDays: 15,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: false,
      coversNotAsDescribed: true,
      coversLateDelivery: false,
      returnWindowDays: 15,
      claimWindowDays: 30
    }
  },
  {
    name: 'Garantía Premium de Devolución',
    type: 'return_guarantee',
    level: 'premium',
    description: 'Garantía premium para devoluciones con cobertura extendida',
    coveragePercentage: 100,
    maxCoverageAmount: 2000,
    costPercentage: 5,
    durationDays: 30,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: false,
      returnWindowDays: 30,
      claimWindowDays: 60
    }
  },
  {
    name: 'Protección Básica de Reclamos',
    type: 'claim_protection',
    level: 'basic',
    description: 'Protección básica para disputas y reclamos',
    coveragePercentage: 100,
    maxCoverageAmount: 2000,
    costPercentage: 4,
    durationDays: 90,
    terms: {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: false,
      returnWindowDays: 90,
      claimWindowDays: 90
    }
  }
];

async function seedWarranties() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');
    console.log('✅ Conexión exitosa a MongoDB');

    // Crear garantías sin dependencias de otros modelos
    console.log('⚠️ Creando garantías sin dependencias de otros modelos');

    console.log('🧹 Limpiando configuraciones de garantías existentes...');
    await Warranty.deleteMany({});
    console.log('✅ Configuraciones anteriores eliminadas');

    console.log('🌱 Creando configuraciones de garantías...');
    
    const createdWarranties = [];
    
    for (const config of warrantyConfigs) {
      // Crear garantía de ejemplo para cada configuración
      const warranty = new Warranty({
        type: config.type,
        status: 'active',
        userId: null,
        storeId: null,
        transactionId: null,
        productId: null,
        
        // Cobertura y términos
        coverageAmount: config.maxCoverageAmount,
        coveragePercentage: config.coveragePercentage,
        maxCoverageAmount: config.maxCoverageAmount,
        
        // Fechas
        activationDate: new Date(),
        expirationDate: new Date(Date.now() + config.durationDays * 24 * 60 * 60 * 1000),
        
        // Términos específicos
        terms: config.terms,
        
        // Costo
        cost: 0, // Costo 0 para configuraciones de ejemplo
        isIncluded: true,
        billingCycle: 'one_time',
        
        // Metadatos
        description: config.description,
        notes: `Configuración de ejemplo para ${config.name}`,
        createdBy: null
      });

      const savedWarranty = await warranty.save();
      createdWarranties.push(savedWarranty);
      
      console.log(`✅ Creada garantía: ${config.name}`);
    }

    console.log(`\n🎉 ¡Script completado exitosamente!`);
    console.log(`📊 Resumen:`);
    console.log(`   - Configuraciones creadas: ${createdWarranties.length}`);
    console.log(`   - Tipos de garantía: ${[...new Set(createdWarranties.map(w => w.type))].length}`);
    console.log(`   - Niveles disponibles: ${[...new Set(createdWarranties.map(w => w.protectionLevel || 'basic'))].length}`);

    // Mostrar estadísticas
    const stats = await Warranty.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' }
        }
      }
    ]);

    console.log(`\n📈 Estadísticas por tipo:`);
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} configuraciones, $${stat.totalCoverage} cobertura total`);
    });

    console.log(`\n🚀 El sistema de garantías está listo para usar!`);
    console.log(`💡 Las configuraciones incluyen:`);
    console.log(`   - Protección de compra (Básica, Premium, Extendida)`);
    console.log(`   - Garantías de devolución (Básica, Premium)`);
    console.log(`   - Protección de reclamos (Básica)`);
    console.log(`   - Coberturas desde $500 hasta $10,000`);
    console.log(`   - Duración desde 15 hasta 90 días`);

  } catch (error) {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedWarranties();
}

module.exports = { seedWarranties };
