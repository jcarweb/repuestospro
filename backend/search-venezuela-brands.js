#!/usr/bin/env node

/**
 * Script para buscar marcas venezolanas en la base de datos
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

async function searchVenezuelaBrands() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    console.log('\n🔍 Buscando marcas venezolanas...\n');
    
    // Buscar marcas que contengan palabras clave venezolanas
    const searchTerms = ['Bera', 'Empire', 'Keeway', 'Toro', 'MD', 'Skygo', 'AVA', 'Haojue', 'Vefase', 'Agrometal', 'Bombagua', 'Induveca', 'INVEVAL', 'Foton', 'Dongfeng', 'JAC', 'Dina'];
    
    console.log('🔍 Buscando marcas por términos de búsqueda:');
    for (const term of searchTerms) {
      const brands = await Brand.find({ 
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ]
      });
      
      if (brands.length > 0) {
        console.log(`✅ Encontradas ${brands.length} marcas con "${term}":`);
        brands.forEach(brand => {
          console.log(`   - ${brand.name} (${brand.country || 'N/A'})`);
        });
      } else {
        console.log(`❌ No se encontraron marcas con "${term}"`);
      }
    }
    
    // Buscar marcas de Venezuela
    console.log('\n🇻🇪 Buscando marcas de Venezuela:');
    const venezuelaBrands = await Brand.find({ country: 'Venezuela' });
    console.log(`📊 Marcas de Venezuela encontradas: ${venezuelaBrands.length}`);
    
    if (venezuelaBrands.length > 0) {
      venezuelaBrands.forEach(brand => {
        console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
      });
    }
    
    // Buscar marcas de China (populares en Venezuela)
    console.log('\n🇨🇳 Buscando marcas de China:');
    const chinaBrands = await Brand.find({ country: 'China' });
    console.log(`📊 Marcas de China encontradas: ${chinaBrands.length}`);
    
    if (chinaBrands.length > 0) {
      chinaBrands.forEach(brand => {
        console.log(`   - ${brand.name}: ${brand.description || 'Sin descripción'}`);
      });
    }
    
    // Mostrar todas las marcas creadas recientemente
    console.log('\n🕒 Marcas creadas recientemente:');
    const recentBrands = await Brand.find({}).sort({ createdAt: -1 }).limit(20);
    recentBrands.forEach(brand => {
      const date = new Date(brand.createdAt).toLocaleString();
      console.log(`   - ${brand.name} (${brand.country || 'N/A'}) - ${date}`);
    });
    
    console.log('\n✅ Búsqueda completada!');
    
  } catch (error) {
    console.error('❌ Error durante la búsqueda:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la búsqueda
searchVenezuelaBrands();
