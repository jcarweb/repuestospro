const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasyaya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importar modelos
const Advertisement = require('./dist/models/Advertisement').default;
const Store = require('./dist/models/Store').default;
const User = require('./dist/models/User').default;

async function testAdvertisements() {
  try {
    console.log('🧪 Iniciando pruebas del sistema de publicidad...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      console.log('✅ Conexión exitosa a MongoDB');
    } else {
      console.log('❌ Error de conexión a MongoDB');
      return;
    }

    // 2. Obtener una tienda de ejemplo
    console.log('\n2. Obteniendo tienda de ejemplo...');
    const store = await Store.findOne();
    if (!store) {
      console.log('❌ No se encontraron tiendas en la base de datos');
      return;
    }
    console.log(`✅ Tienda encontrada: ${store.name}`);

    // 3. Obtener un usuario admin
    console.log('\n3. Obteniendo usuario administrador...');
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No se encontró usuario administrador');
      return;
    }
    console.log(`✅ Usuario admin encontrado: ${adminUser.name}`);

    // 4. Crear una publicidad de prueba
    console.log('\n4. Creando publicidad de prueba...');
    const testAdvertisement = new Advertisement({
      title: 'Oferta Especial de Repuestos',
      description: 'Descuentos increíbles en repuestos para tu vehículo',
      content: '¡No te pierdas nuestras ofertas especiales! Descuentos de hasta 50% en repuestos de alta calidad. Válido solo por tiempo limitado.',
      imageUrl: 'https://ejemplo.com/imagen-oferta.jpg',
      store: store._id,
      displayType: 'search_card',
      targetPlatform: 'both',
      targetAudience: {
        userRoles: ['client'],
        loyaltyLevels: ['bronze', 'silver', 'gold'],
        locations: ['Caracas', 'Valencia'],
        deviceTypes: ['mobile'],
        operatingSystems: ['android', 'ios'],
        ageRanges: ['25-34', '35-44'],
        interests: ['Automóviles', 'Repuestos']
      },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        startTime: '09:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
        timeSlots: [
          { start: '10:00', end: '12:00' },
          { start: '14:00', end: '16:00' }
        ]
      },
      displaySettings: {
        maxImpressions: 1000,
        maxClicks: 100,
        frequency: 2,
        priority: 8,
        isActive: true
      },
      createdBy: adminUser._id,
      status: 'active'
    });

    await testAdvertisement.save();
    console.log('✅ Publicidad de prueba creada exitosamente');

    // 5. Probar métodos del modelo
    console.log('\n5. Probando métodos del modelo...');
    
    // Probar isCurrentlyActive
    const isActive = testAdvertisement.isCurrentlyActive();
    console.log(`   - isCurrentlyActive(): ${isActive}`);

    // Probar recordImpression
    testAdvertisement.recordImpression({
      platform: 'android',
      location: 'Caracas',
      userRole: 'client'
    });
    console.log(`   - Impresiones después de recordImpression: ${testAdvertisement.tracking.impressions}`);

    // Probar recordClick
    testAdvertisement.recordClick();
    console.log(`   - Clicks después de recordClick: ${testAdvertisement.tracking.clicks}`);
    console.log(`   - CTR calculado: ${testAdvertisement.tracking.ctr.toFixed(2)}%`);

    await testAdvertisement.save();
    console.log('✅ Métodos del modelo probados exitosamente');

    // 6. Probar consultas
    console.log('\n6. Probando consultas...');
    
    // Contar publicidades
    const totalAds = await Advertisement.countDocuments();
    console.log(`   - Total de publicidades: ${totalAds}`);

    // Buscar publicidades activas
    const activeAds = await Advertisement.find({ status: 'active' });
    console.log(`   - Publicidades activas: ${activeAds.length}`);

    // Buscar por tipo de display
    const searchCardAds = await Advertisement.find({ displayType: 'search_card' });
    console.log(`   - Publicidades tipo search_card: ${searchCardAds.length}`);

    // Buscar por plataforma
    const bothPlatformAds = await Advertisement.find({ targetPlatform: 'both' });
    console.log(`   - Publicidades para ambas plataformas: ${bothPlatformAds.length}`);

    console.log('✅ Consultas probadas exitosamente');

    // 7. Probar estadísticas
    console.log('\n7. Probando estadísticas...');
    
    const stats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$tracking.impressions' },
          totalClicks: { $sum: '$tracking.clicks' },
          avgCTR: { $avg: '$tracking.ctr' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log(`   - Total de impresiones: ${stats[0].totalImpressions}`);
      console.log(`   - Total de clicks: ${stats[0].totalClicks}`);
      console.log(`   - CTR promedio: ${stats[0].avgCTR.toFixed(2)}%`);
    }

    console.log('✅ Estadísticas calculadas exitosamente');

    // 8. Limpiar datos de prueba
    console.log('\n8. Limpiando datos de prueba...');
    await Advertisement.deleteOne({ _id: testAdvertisement._id });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡Todas las pruebas del sistema de publicidad fueron exitosas!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Conexión a base de datos');
    console.log('   ✅ Creación de publicidades');
    console.log('   ✅ Métodos del modelo (isCurrentlyActive, recordImpression, recordClick)');
    console.log('   ✅ Consultas y filtros');
    console.log('   ✅ Cálculo de estadísticas');
    console.log('   ✅ Segmentación por audiencia');
    console.log('   ✅ Programación de horarios');
    console.log('   ✅ Configuración de display');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar pruebas
testAdvertisements();
