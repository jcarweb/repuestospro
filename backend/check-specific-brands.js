#!/usr/bin/env node

/**
 * Script para verificar marcas específicas venezolanas
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

// Esquema simple para Brand
const BrandSchema = new mongoose.Schema({
  name: String,
  description: String,
  vehicleTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType' }],
  country: String,
  isActive: Boolean
}, { timestamps: true });

const Brand = mongoose.model('Brand', BrandSchema);

async function checkSpecificBrands() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar marcas venezolanas específicas
    const venezuelaBrands = [
      'Bera', 'Empire Keeway', 'Toro', 'MD', 'Skygo', 'AVA', 'Haojue', 'Vefase',
      'Agrometal', 'Bombagua', 'Induveca', 'INVEVAL', 'Metalúrgica Venezolana',
      'Foton', 'Dongfeng', 'JAC Motors', 'Dina'
    ];
    
    console.log('\n🔍 Verificando marcas venezolanas específicas:');
    
    for (const brandName of venezuelaBrands) {
      const brand = await Brand.findOne({ name: brandName });
      if (brand) {
        console.log(`✅ ${brandName}:`);
        console.log(`   - País: ${brand.country || 'No especificado'}`);
        console.log(`   - Descripción: ${brand.description || 'No especificada'}`);
        console.log(`   - Activa: ${brand.isActive ? 'Sí' : 'No'}`);
        console.log(`   - Fecha creación: ${brand.createdAt}`);
        console.log(`   - Tipos de vehículo: ${brand.vehicleTypes.length}`);
      } else {
        console.log(`❌ ${brandName}: No encontrada`);
      }
    }
    
    // Buscar marcas que contengan "Venezuela" en el país
    console.log('\n🇻🇪 Marcas con país Venezuela:');
    const venezuelaCountryBrands = await Brand.find({ country: 'Venezuela' });
    console.log(`📊 Total: ${venezuelaCountryBrands.length}`);
    
    venezuelaCountryBrands.forEach(brand => {
      console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
    });
    
    // Buscar marcas que contengan "China" en el país
    console.log('\n🇨🇳 Marcas con país China:');
    const chinaCountryBrands = await Brand.find({ country: 'China' });
    console.log(`📊 Total: ${chinaCountryBrands.length}`);
    
    chinaCountryBrands.forEach(brand => {
      console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
    });
    
    // Buscar marcas que contengan palabras clave venezolanas
    console.log('\n🔍 Marcas con palabras clave venezolanas:');
    const keywords = ['Foton', 'Dongfeng', 'JAC', 'Dina', 'Agrometal', 'Bombagua'];
    
    for (const keyword of keywords) {
      const brands = await Brand.find({ 
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      });
      
      if (brands.length > 0) {
        console.log(`✅ "${keyword}": ${brands.length} marcas encontradas`);
        brands.forEach(brand => {
          console.log(`   - ${brand.name} (${brand.country || 'N/A'})`);
        });
      } else {
        console.log(`❌ "${keyword}": No encontrado`);
      }
    }
    
    console.log('\n✅ Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la verificación
checkSpecificBrands();
