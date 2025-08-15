const mongoose = require('mongoose');
const Store = require('./src/models/Store');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro';

async function testGeolocation() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Coordenadas de prueba (Caracas, Venezuela)
    const testLocation = {
      latitude: 10.4806,
      longitude: -66.9036
    };

    console.log('\n📍 Probando búsqueda geográfica...');
    console.log(`Ubicación de prueba: ${testLocation.latitude}, ${testLocation.longitude}`);

    // Buscar tiendas cercanas (radio de 10 km)
    const nearbyStores = await Store.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [testLocation.longitude, testLocation.latitude] // MongoDB usa [lng, lat]
          },
          $maxDistance: 10000 // 10 km en metros
        }
      },
      isActive: true
    }).select('name city state coordinates');

    console.log(`\n🏪 Tiendas encontradas en 10km: ${nearbyStores.length}`);

    if (nearbyStores.length > 0) {
      console.log('\n📋 Detalles de tiendas cercanas:');
      nearbyStores.forEach((store, index) => {
        const distance = calculateDistance(
          testLocation.latitude,
          testLocation.longitude,
          store.coordinates.latitude,
          store.coordinates.longitude
        );
        console.log(`${index + 1}. ${store.name}`);
        console.log(`   📍 ${store.city}, ${store.state}`);
        console.log(`   🗺️  Coordenadas: ${store.coordinates.latitude}, ${store.coordinates.longitude}`);
        console.log(`   📏 Distancia: ${distance.toFixed(2)} km`);
        console.log('');
      });
    } else {
      console.log('❌ No se encontraron tiendas cercanas');
    }

    // Probar con diferentes radios
    console.log('\n🔍 Probando diferentes radios de búsqueda...');
    const radii = [5, 10, 20, 50]; // km

    for (const radius of radii) {
      const storesInRadius = await Store.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [testLocation.longitude, testLocation.latitude]
            },
            $maxDistance: radius * 1000 // Convertir km a metros
          }
        },
        isActive: true
      }).countDocuments();

      console.log(`Radio ${radius}km: ${storesInRadius} tiendas`);
    }

    // Verificar índices geográficos
    console.log('\n📊 Verificando índices...');
    const indexes = await Store.collection.getIndexes();
    
    const geoIndex = Object.values(indexes).find(index => 
      index.key && index.key.coordinates === '2dsphere'
    );

    if (geoIndex) {
      console.log('✅ Índice geográfico 2dsphere encontrado');
      console.log(`   Índice: ${JSON.stringify(geoIndex.key)}`);
    } else {
      console.log('❌ Índice geográfico no encontrado');
      console.log('💡 Creando índice geográfico...');
      await Store.collection.createIndex({ coordinates: '2dsphere' });
      console.log('✅ Índice geográfico creado');
    }

    // Estadísticas generales
    console.log('\n📈 Estadísticas generales:');
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });
    const storesWithCoordinates = await Store.countDocuments({
      coordinates: { $exists: true, $ne: null }
    });

    console.log(`Total de tiendas: ${totalStores}`);
    console.log(`Tiendas activas: ${activeStores}`);
    console.log(`Tiendas con coordenadas: ${storesWithCoordinates}`);

    if (storesWithCoordinates < activeStores) {
      console.log('⚠️  Algunas tiendas no tienen coordenadas GPS');
      console.log('💡 Es importante que todas las tiendas tengan coordenadas para la búsqueda por proximidad');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Función para calcular distancia (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en kilómetros
  return distance;
}

// Ejecutar prueba
if (require.main === module) {
  testGeolocation();
}

module.exports = { testGeolocation, calculateDistance };
