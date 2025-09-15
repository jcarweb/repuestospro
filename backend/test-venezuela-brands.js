#!/usr/bin/env node

/**
 * Script de prueba para verificar que las marcas venezolanas se integren correctamente
 * 
 * Uso:
 *   node test-venezuela-brands.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBrandsAPI() {
  console.log('🧪 Iniciando pruebas de marcas venezolanas...\n');
  
  const vehicleTypes = [
    'automovil',
    'motocicleta', 
    'camion',
    'maquinaria_agricola',
    'maquinaria_industrial'
  ];
  
  const expectedVenezuelaBrands = {
    automovil: ['Datsun', 'Dongfeng', 'JAC Motors'],
    motocicleta: ['Bera', 'Empire Keeway', 'Toro', 'MD', 'Skygo', 'AVA', 'Haojue', 'Vefase'],
    camion: ['Foton', 'Dongfeng', 'Dina', 'JAC Motors', 'Mitsubishi Fuso', 'Datsun'],
    maquinaria_agricola: ['John Deere', 'New Holland', 'Massey Ferguson', 'Fendt', 'Kubota', 'Deutz-Fahr'],
    maquinaria_industrial: ['Foton', 'Dina', 'Dongfeng', 'JAC', 'Hino', 'Isuzu', 'Maxus', 'Agrometal', 'Bombagua', 'Induveca']
  };
  
  let allTestsPassed = true;
  
  for (const vehicleType of vehicleTypes) {
    try {
      console.log(`🔍 Probando marcas para ${vehicleType}...`);
      
      const response = await axios.get(`${API_BASE_URL}/products/brands/${vehicleType}`);
      
      if (response.data.success) {
        const brands = response.data.data;
        const expectedBrands = expectedVenezuelaBrands[vehicleType] || [];
        
        console.log(`   ✅ API respondió correctamente`);
        console.log(`   📊 Total de marcas: ${brands.length}`);
        
        // Verificar que las marcas venezolanas específicas estén presentes
        let foundBrands = 0;
        for (const expectedBrand of expectedBrands) {
          if (brands.includes(expectedBrand)) {
            foundBrands++;
            console.log(`   ✅ Encontrada marca venezolana: ${expectedBrand}`);
          } else {
            console.log(`   ❌ Marca venezolana no encontrada: ${expectedBrand}`);
            allTestsPassed = false;
          }
        }
        
        console.log(`   📈 Marcas venezolanas encontradas: ${foundBrands}/${expectedBrands.length}`);
        
        // Mostrar algunas marcas como ejemplo
        console.log(`   🏷️  Ejemplos de marcas: ${brands.slice(0, 5).join(', ')}...`);
        
      } else {
        console.log(`   ❌ API no respondió correctamente: ${response.data.message}`);
        allTestsPassed = false;
      }
      
    } catch (error) {
      console.log(`   ❌ Error probando ${vehicleType}: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen final
  console.log('📋 RESUMEN DE PRUEBAS');
  console.log('====================');
  
  if (allTestsPassed) {
    console.log('✅ Todas las pruebas pasaron exitosamente!');
    console.log('🎉 Las marcas venezolanas se han integrado correctamente en el sistema.');
  } else {
    console.log('❌ Algunas pruebas fallaron.');
    console.log('🔧 Revisa los errores anteriores y ejecuta el script de población de marcas.');
  }
  
  console.log('\n💡 Para poblar la base de datos con las marcas venezolanas, ejecuta:');
  console.log('   npm run seed:venezuela-brands');
}

// Ejecutar las pruebas
testBrandsAPI().catch(console.error);
