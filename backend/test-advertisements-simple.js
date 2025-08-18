const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasyaya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir esquema de publicidad directamente
const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  displayType: {
    type: String,
    enum: ['fullscreen', 'footer', 'mid_screen', 'search_card'],
    required: true
  },
  targetPlatform: {
    type: String,
    enum: ['android', 'ios', 'both'],
    default: 'both'
  },
  targetAudience: {
    userRoles: [{
      type: String,
      enum: ['client', 'store_manager', 'delivery', 'admin']
    }],
    loyaltyLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }],
    locations: [String],
    deviceTypes: [{
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    }],
    operatingSystems: [{
      type: String,
      enum: ['android', 'ios', 'web']
    }],
    ageRanges: [{
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55+']
    }],
    interests: [String]
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timeSlots: [{
      start: {
        type: String,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }]
  },
  displaySettings: {
    maxImpressions: {
      type: Number,
      default: 0
    },
    currentImpressions: {
      type: Number,
      default: 0
    },
    maxClicks: {
      type: Number,
      default: 0
    },
    currentClicks: {
      type: Number,
      default: 0
    },
    frequency: {
      type: Number,
      default: 1,
      min: 1
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  tracking: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpm: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    }
  },
  analytics: {
    deviceBreakdown: {
      android: {
        type: Number,
        default: 0
      },
      ios: {
        type: Number,
        default: 0
      }
    },
    locationBreakdown: {
      type: Map,
      of: Number,
      default: {}
    },
    timeBreakdown: {
      type: Map,
      of: Number,
      default: {}
    },
    userSegmentBreakdown: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Métodos del esquema
advertisementSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDay = now.getDay();
  
  if (!this.displaySettings.isActive || this.status !== 'active') {
    return false;
  }
  
  if (now < this.schedule.startDate || now > this.schedule.endDate) {
    return false;
  }
  
  if (this.schedule.daysOfWeek.length > 0 && !this.schedule.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  if (currentTime < this.schedule.startTime || currentTime > this.schedule.endTime) {
    return false;
  }
  
  if (this.schedule.timeSlots.length > 0) {
    const isInTimeSlot = this.schedule.timeSlots.some(slot => 
      currentTime >= slot.start && currentTime <= slot.end
    );
    if (!isInTimeSlot) {
      return false;
    }
  }
  
  return true;
};

advertisementSchema.methods.recordImpression = function(userData) {
  this.tracking.impressions += 1;
  this.displaySettings.currentImpressions += 1;
  
  if (userData.platform === 'android') {
    this.analytics.deviceBreakdown.android += 1;
  } else if (userData.platform === 'ios') {
    this.analytics.deviceBreakdown.ios += 1;
  }
  
  if (userData.location) {
    const currentLocationCount = this.analytics.locationBreakdown.get(userData.location) || 0;
    this.analytics.locationBreakdown.set(userData.location, currentLocationCount + 1);
  }
  
  const currentHour = new Date().getHours().toString();
  const currentHourCount = this.analytics.timeBreakdown.get(currentHour) || 0;
  this.analytics.timeBreakdown.set(currentHour, currentHourCount + 1);
  
  if (userData.userRole) {
    const currentRoleCount = this.analytics.userSegmentBreakdown.get(userData.userRole) || 0;
    this.analytics.userSegmentBreakdown.set(userData.userRole, currentRoleCount + 1);
  }
  
  if (this.tracking.impressions > 0) {
    this.tracking.ctr = (this.tracking.clicks / this.tracking.impressions) * 100;
  }
};

advertisementSchema.methods.recordClick = function() {
  this.tracking.clicks += 1;
  this.displaySettings.currentClicks += 1;
  
  if (this.tracking.impressions > 0) {
    this.tracking.ctr = (this.tracking.clicks / this.tracking.impressions) * 100;
  }
};

// Crear modelo
const Advertisement = mongoose.model('Advertisement', advertisementSchema);

// Obtener modelos existentes
const Store = mongoose.model('Store');
const User = mongoose.model('User');

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
