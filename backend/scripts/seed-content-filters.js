const mongoose = require('mongoose');
require('dotenv').config();

const contentFilters = [
  {
    name: 'Filtro Básico Anti-Fuga',
    description: 'Filtro principal para prevenir fugas de venta fuera de la app',
    phonePatterns: [
      '\\+?[0-9]{1,4}[-.\\s]?[0-9]{7,15}',
      '\\([0-9]{3}\\)\\s*[0-9]{3}-[0-9]{4}',
      '[0-9]{3}-[0-9]{3}-[0-9]{4}',
      '[0-9]{10,15}',
      '\\+58\\s*[0-9]{10}',
      '0[0-9]{9}'
    ],
    emailPatterns: [
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
    ],
    externalLinks: [
      '(https?:\\/\\/)?(www\\.)?(?!piezasya\\.com)[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}',
      '(https?:\\/\\/)?(?!piezasya\\.com)[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}',
      'wa\\.me\\/[0-9]+',
      't\\.me\\/[a-zA-Z0-9_]+',
      'instagram\\.com\\/[a-zA-Z0-9_.]+',
      'facebook\\.com\\/[a-zA-Z0-9.]+'
    ],
    forbiddenKeywords: [
      'whatsapp', 'telegram', 'instagram', 'facebook', 'fuera de la app',
      'contactar directamente', 'llamar', 'escribir', 'mensaje directo',
      'número de teléfono', 'correo electrónico', 'email personal',
      'wa.me', 't.me', 'fb.com', 'ig.com', 'contacto directo',
      'pago fuera', 'transferencia directa', 'efectivo directo',
      'zelle', 'paypal personal', 'venmo', 'cash app',
      'pago en efectivo', 'pago directo', 'transferencia bancaria',
      'depósito bancario', 'pago por transferencia', 'pago por zelle',
      'pago por paypal', 'pago por venmo', 'pago por cash app',
      'contacto personal', 'teléfono personal', 'celular personal',
      'whatsapp personal', 'telegram personal', 'instagram personal',
      'facebook personal', 'mensaje privado', 'mensaje directo',
      'contacto privado', 'comunicación directa', 'comunicación privada'
    ],
    fraudPatterns: [
      'contacto\\s+directo',
      'pago\\s+fuera',
      'transferencia\\s+directa',
      'efectivo\\s+directo',
      'zelle',
      'paypal\\s+personal',
      'venmo',
      'cash\\s+app',
      'pago\\s+en\\s+efectivo',
      'pago\\s+directo',
      'transferencia\\s+bancaria',
      'depósito\\s+bancario',
      'pago\\s+por\\s+transferencia',
      'pago\\s+por\\s+zelle',
      'pago\\s+por\\s+paypal',
      'pago\\s+por\\s+venmo',
      'pago\\s+por\\s+cash\\s+app',
      'contacto\\s+personal',
      'teléfono\\s+personal',
      'celular\\s+personal',
      'whatsapp\\s+personal',
      'telegram\\s+personal',
      'instagram\\s+personal',
      'facebook\\s+personal',
      'mensaje\\s+privado',
      'mensaje\\s+directo',
      'contacto\\s+privado',
      'comunicación\\s+directa',
      'comunicación\\s+privada'
    ],
    isActive: true,
    createdBy: null // Se asignará al primer admin encontrado
  }
];

async function seedContentFilters() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    console.log('✅ Conectado a MongoDB');

    // Importar el modelo ContentFilter
    const ContentFilter = require('../src/models/ContentFilter');
    
    // Buscar un admin para asignar como creador
    const User = require('../src/models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('❌ No se encontró ningún administrador para asignar los filtros');
      console.log('💡 Creando un filtro sin asignar creador...');
    } else {
      console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})`);
    }

    // Eliminar filtros existentes
    console.log('🗑️ Eliminando filtros existentes...');
    await ContentFilter.deleteMany({});
    console.log('✅ Filtros existentes eliminados');
    
    // Crear nuevos filtros
    const filtersWithCreator = contentFilters.map(filter => ({
      ...filter,
      createdBy: admin ? admin._id : null
    }));
    
    console.log('📝 Creando filtros de contenido...');
    const createdFilters = await ContentFilter.insertMany(filtersWithCreator);
    
    console.log(`✅ Se crearon ${createdFilters.length} filtros de contenido`);
    console.log('📋 Filtros creados:');
    createdFilters.forEach(filter => {
      console.log(`  - ${filter.name}: ${filter.description}`);
      console.log(`    📱 Patrones de teléfono: ${filter.phonePatterns.length}`);
      console.log(`    📧 Patrones de email: ${filter.emailPatterns.length}`);
      console.log(`    🔗 Enlaces externos: ${filter.externalLinks.length}`);
      console.log(`    🚫 Palabras prohibidas: ${filter.forbiddenKeywords.length}`);
      console.log(`    ⚠️ Patrones de fraude: ${filter.fraudPatterns.length}`);
    });
    
    console.log('\n🎯 Configuración completada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`  - Filtros activos: ${createdFilters.filter(f => f.isActive).length}`);
    console.log(`  - Total de patrones: ${createdFilters.reduce((acc, f) => 
      acc + f.phonePatterns.length + f.emailPatterns.length + f.externalLinks.length + 
      f.forbiddenKeywords.length + f.fraudPatterns.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Error creando filtros de contenido:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
if (require.main === module) {
  seedContentFilters()
    .then(() => {
      console.log('🎉 Script completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { seedContentFilters };
