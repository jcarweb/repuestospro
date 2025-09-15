#!/usr/bin/env node

/**
 * Script para crear específicamente las marcas venezolanas
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

// Marcas venezolanas específicas
const venezuelaBrands = [
  // Motocicletas
  { name: 'Empire Keeway', country: 'China', description: 'Marca china de motocicletas', vehicleType: 'motos' },
  { name: 'Toro', country: 'China', description: 'Marca china de motocicletas', vehicleType: 'motos' },
  { name: 'MD', country: 'China', description: 'Marca china de motocicletas', vehicleType: 'motos' },
  { name: 'Skygo', country: 'China', description: 'Marca china de motocicletas', vehicleType: 'motos' },
  { name: 'AVA', country: 'China', description: 'Marca china de motocicletas', vehicleType: 'motos' },
  { name: 'Haojue', country: 'China', description: 'Marca china de motocicletas (Suzuki-Haojue)', vehicleType: 'motos' },
  { name: 'Vefase', country: 'Venezuela', description: 'Marca venezolana de motocicletas', vehicleType: 'motos' },
  
  // Camiones
  { name: 'Foton', country: 'China', description: 'Fabricante chino de camiones', vehicleType: 'camiones' },
  { name: 'Dongfeng', country: 'China', description: 'Fabricante chino de camiones', vehicleType: 'camiones' },
  { name: 'JAC Motors', country: 'China', description: 'Fabricante chino de camiones', vehicleType: 'camiones' },
  { name: 'Dina', country: 'México', description: 'Fabricante mexicano de camiones', vehicleType: 'camiones' },
  
  // Maquinaria Industrial
  { name: 'Agrometal', country: 'Venezuela', description: 'Fabricante venezolano de maquinaria agrícola', vehicleType: 'maquinaria industrial' },
  { name: 'Bombagua', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' },
  { name: 'Induveca', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' },
  { name: 'INVEVAL', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' },
  { name: 'Metalúrgica Venezolana', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' },
  { name: 'Industrias Venoco', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' },
  { name: 'Maquinarias del Sur', country: 'Venezuela', description: 'Fabricante venezolano de maquinaria', vehicleType: 'maquinaria industrial' },
  { name: 'Equipos Industriales CA', country: 'Venezuela', description: 'Fabricante venezolano de equipos industriales', vehicleType: 'maquinaria industrial' }
];

async function createVenezuelaBrands() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener tipos de vehículos
    const vehicleTypes = await VehicleType.find({});
    const vehicleTypeMap = {};
    vehicleTypes.forEach(vt => {
      vehicleTypeMap[vt.name] = vt._id;
    });
    
    console.log('📊 Tipos de vehículos disponibles:');
    Object.keys(vehicleTypeMap).forEach(name => {
      console.log(`   - ${name}: ${vehicleTypeMap[name]}`);
    });
    
    console.log('\n🏷️  Creando marcas venezolanas específicas...\n');
    
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const brandData of venezuelaBrands) {
      try {
        console.log(`🔍 Procesando: ${brandData.name} (${brandData.country})`);
        
        // Buscar si la marca ya existe
        let brand = await Brand.findOne({ name: brandData.name });
        
        if (brand) {
          console.log(`   ℹ️  Marca ${brandData.name} ya existe`);
          
          // Verificar si ya tiene el tipo de vehículo
          const vehicleTypeId = vehicleTypeMap[brandData.vehicleType];
          if (vehicleTypeId && !brand.vehicleTypes.includes(vehicleTypeId)) {
            brand.vehicleTypes.push(vehicleTypeId);
            brand.country = brandData.country;
            brand.description = brandData.description;
            await brand.save();
            console.log(`   ✅ Marca ${brandData.name} actualizada`);
            updatedCount++;
          } else {
            console.log(`   ℹ️  Marca ${brandData.name} ya tiene este tipo de vehículo`);
          }
        } else {
          // Crear nueva marca
          const vehicleTypeId = vehicleTypeMap[brandData.vehicleType];
          if (!vehicleTypeId) {
            console.log(`   ❌ Tipo de vehículo '${brandData.vehicleType}' no encontrado`);
            errorCount++;
            continue;
          }
          
          brand = new Brand({
            name: brandData.name,
            description: brandData.description,
            country: brandData.country,
            vehicleTypes: [vehicleTypeId],
            isActive: true
          });
          
          await brand.save();
          console.log(`   ✅ Marca ${brandData.name} creada exitosamente`);
          createdCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error procesando ${brandData.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Proceso completado!');
    console.log(`📊 Resumen:`);
    console.log(`   - Marcas creadas: ${createdCount}`);
    console.log(`   - Marcas actualizadas: ${updatedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    
    // Verificar marcas venezolanas finales
    console.log('\n🇻🇪 Marcas venezolanas en la base de datos:');
    const venezuelaBrandsInDB = await Brand.find({ country: 'Venezuela' });
    console.log(`📊 Total: ${venezuelaBrandsInDB.length}`);
    
    venezuelaBrandsInDB.forEach(brand => {
      console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
    });
    
    // Verificar marcas chinas
    console.log('\n🇨🇳 Marcas chinas en la base de datos:');
    const chinaBrandsInDB = await Brand.find({ country: 'China' });
    console.log(`📊 Total: ${chinaBrandsInDB.length}`);
    
    chinaBrandsInDB.forEach(brand => {
      console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
createVenezuelaBrands();
