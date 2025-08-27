const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir esquemas simplificados para el script
const riderSchema = new mongoose.Schema({
  type: { type: String, enum: ['internal', 'external'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  idNumber: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  vehicle: {
    type: { type: String, enum: ['motorcycle', 'bicycle', 'car'], required: true },
    brand: String,
    model: String,
    plate: String,
    color: String
  },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'pending_verification'], default: 'active' },
  availability: {
    isOnline: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date
    }
  },
  rating: {
    average: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  stats: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 }
  },
  serviceAreas: [{
    name: String,
    coordinates: { lat: Number, lng: Number },
    radius: Number,
    isActive: { type: Boolean, default: true }
  }],
  externalProvider: {
    name: String,
    type: { type: String, enum: ['mototaxista', 'courier', 'independent'] },
    commissionRate: Number
  }
}, { timestamps: true });

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  riderType: { type: String, enum: ['internal', 'external'], required: true },
  riderName: { type: String, required: true },
  riderPhone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'], default: 'pending' },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
    storeName: { type: String, required: true }
  },
  deliveryLocation: {
    address: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true }
  },
  deliveryFee: { type: Number, required: true },
  riderPayment: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  trackingCode: { type: String, required: true, unique: true },
  trackingUrl: String,
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String,
    updatedBy: String
  }]
}, { timestamps: true });

const Rider = mongoose.model('Rider', riderSchema);
const Delivery = mongoose.model('Delivery', deliverySchema);

// Función para generar código de tracking único
function generateTrackingCode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `DEL-${timestamp}-${random}`.toUpperCase();
}

// Función para generar coordenadas aleatorias en un área específica
function generateRandomCoordinates(centerLat, centerLng, radiusKm = 5) {
  const lat = centerLat + (Math.random() - 0.5) * (radiusKm / 111);
  const lng = centerLng + (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(centerLat * Math.PI / 180)));
  return { lat, lng };
}

// Función para generar riders de prueba
async function generateTestRiders() {
  console.log('🚚 Generando riders de prueba...');

  const riders = [
    // Riders internos
    {
      type: 'internal',
      firstName: 'Carlos',
      lastName: 'González',
      email: 'carlos.gonzalez@delivery.com',
      phone: '+573001234567',
      idNumber: 'CC12345678',
      dateOfBirth: new Date('1990-05-15'),
      vehicle: {
        type: 'motorcycle',
        brand: 'Honda',
        model: 'CG 150',
        plate: 'ABC123',
        color: 'Rojo'
      },
      availability: {
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          lat: 4.6097,
          lng: -74.0817,
          timestamp: new Date()
        }
      },
      rating: { average: 4.8, totalReviews: 45 },
      stats: { totalDeliveries: 156, completedDeliveries: 150, totalEarnings: 1250.50, averageDeliveryTime: 18 },
      serviceAreas: [
        { name: 'Centro', coordinates: { lat: 4.6097, lng: -74.0817 }, radius: 5, isActive: true }
      ]
    },
    {
      type: 'internal',
      firstName: 'María',
      lastName: 'Rodríguez',
      email: 'maria.rodriguez@delivery.com',
      phone: '+573001234568',
      idNumber: 'CC87654321',
      dateOfBirth: new Date('1988-12-03'),
      vehicle: {
        type: 'motorcycle',
        brand: 'Yamaha',
        model: 'YBR 125',
        plate: 'XYZ789',
        color: 'Azul'
      },
      availability: {
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          lat: 4.6200,
          lng: -74.0700,
          timestamp: new Date()
        }
      },
      rating: { average: 4.6, totalReviews: 32 },
      stats: { totalDeliveries: 98, completedDeliveries: 95, totalEarnings: 890.25, averageDeliveryTime: 22 },
      serviceAreas: [
        { name: 'Chapinero', coordinates: { lat: 4.6200, lng: -74.0700 }, radius: 4, isActive: true }
      ]
    },
    {
      type: 'internal',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@delivery.com',
      phone: '+573001234569',
      idNumber: 'CC11223344',
      dateOfBirth: new Date('1992-08-20'),
      vehicle: {
        type: 'bicycle',
        brand: 'Trek',
        model: 'FX 2',
        plate: null,
        color: 'Verde'
      },
      availability: {
        isOnline: true,
        isAvailable: false,
        currentLocation: {
          lat: 4.6000,
          lng: -74.0900,
          timestamp: new Date()
        }
      },
      rating: { average: 4.9, totalReviews: 67 },
      stats: { totalDeliveries: 203, completedDeliveries: 200, totalEarnings: 1800.75, averageDeliveryTime: 25 },
      serviceAreas: [
        { name: 'La Candelaria', coordinates: { lat: 4.6000, lng: -74.0900 }, radius: 3, isActive: true }
      ]
    },
    // Riders externos
    {
      type: 'external',
      firstName: 'Pedro',
      lastName: 'López',
      email: 'pedro.lopez@mototaxi.com',
      phone: '+573001234570',
      idNumber: 'CC55667788',
      dateOfBirth: new Date('1985-03-10'),
      vehicle: {
        type: 'motorcycle',
        brand: 'Suzuki',
        model: 'GN 125',
        plate: 'MOT001',
        color: 'Negro'
      },
      availability: {
        isOnline: true,
        isAvailable: true,
        currentLocation: {
          lat: 4.6300,
          lng: -74.0600,
          timestamp: new Date()
        }
      },
      rating: { average: 4.4, totalReviews: 28 },
      stats: { totalDeliveries: 75, completedDeliveries: 72, totalEarnings: 675.30, averageDeliveryTime: 20 },
      serviceAreas: [
        { name: 'Usaquén', coordinates: { lat: 4.6300, lng: -74.0600 }, radius: 6, isActive: true }
      ],
      externalProvider: {
        name: 'Mototaxis Unidos',
        type: 'mototaxista',
        commissionRate: 75
      }
    },
    {
      type: 'external',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@courier.com',
      phone: '+573001234571',
      idNumber: 'CC99887766',
      dateOfBirth: new Date('1991-11-25'),
      vehicle: {
        type: 'car',
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'CAR001',
        color: 'Blanco'
      },
      availability: {
        isOnline: false,
        isAvailable: false,
        currentLocation: null
      },
      rating: { average: 4.7, totalReviews: 41 },
      stats: { totalDeliveries: 89, completedDeliveries: 87, totalEarnings: 1200.45, averageDeliveryTime: 30 },
      serviceAreas: [
        { name: 'Suba', coordinates: { lat: 4.6500, lng: -74.0800 }, radius: 8, isActive: true }
      ],
      externalProvider: {
        name: 'Express Courier',
        type: 'courier',
        commissionRate: 80
      }
    }
  ];

  try {
    // Limpiar riders existentes
    await Rider.deleteMany({});
    console.log('🧹 Riders existentes eliminados');

    // Insertar nuevos riders
    const createdRiders = await Rider.insertMany(riders);
    console.log(`✅ ${createdRiders.length} riders creados exitosamente`);

    return createdRiders;
  } catch (error) {
    console.error('❌ Error generando riders:', error);
    throw error;
  }
}

// Función para generar deliveries de prueba
async function generateTestDeliveries(riders) {
  console.log('📦 Generando deliveries de prueba...');

  const deliveryStatuses = ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
  const statusWeights = [0.1, 0.15, 0.1, 0.1, 0.1, 0.4, 0.05]; // Más entregados que otros estados

  const deliveries = [];
  const stores = [
    { name: 'AutoParts Central', lat: 4.6097, lng: -74.0817 },
    { name: 'Repuestos Express', lat: 4.6200, lng: -74.0700 },
    { name: 'Mecánica Rápida', lat: 4.6000, lng: -74.0900 },
    { name: 'Taller del Norte', lat: 4.6300, lng: -74.0600 }
  ];

  const customers = [
    { name: 'Roberto Silva', phone: '+573001111111' },
    { name: 'Carmen Vega', phone: '+573002222222' },
    { name: 'Luis Morales', phone: '+573003333333' },
    { name: 'Patricia Ruiz', phone: '+573004444444' },
    { name: 'Fernando Castro', phone: '+573005555555' },
    { name: 'Diana Herrera', phone: '+573006666666' },
    { name: 'Miguel Torres', phone: '+573007777777' },
    { name: 'Laura Jiménez', phone: '+573008888888' }
  ];

  // Generar 50 deliveries de prueba
  for (let i = 0; i < 50; i++) {
    const store = stores[Math.floor(Math.random() * stores.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const rider = riders[Math.floor(Math.random() * riders.length)];
    
    // Generar coordenadas aleatorias cerca de la tienda
    const pickupCoords = generateRandomCoordinates(store.lat, store.lng, 1);
    const deliveryCoords = generateRandomCoordinates(store.lat, store.lng, 8);
    
    // Generar estado basado en pesos
    const random = Math.random();
    let cumulativeWeight = 0;
    let status = 'pending';
    for (let j = 0; j < deliveryStatuses.length; j++) {
      cumulativeWeight += statusWeights[j];
      if (random <= cumulativeWeight) {
        status = deliveryStatuses[j];
        break;
      }
    }

    // Calcular fechas basadas en el estado
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Últimos 7 días
    let estimatedPickupTime = null;
    let estimatedDeliveryTime = null;
    let actualPickupTime = null;
    let actualDeliveryTime = null;

    if (['assigned', 'accepted', 'picked_up', 'in_transit', 'delivered'].includes(status)) {
      estimatedPickupTime = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 min después
      estimatedDeliveryTime = new Date(estimatedPickupTime.getTime() + 30 * 60 * 1000); // 30 min después
    }

    if (['picked_up', 'in_transit', 'delivered'].includes(status)) {
      actualPickupTime = new Date(estimatedPickupTime.getTime() + (Math.random() - 0.5) * 10 * 60 * 1000); // ±5 min
    }

    if (status === 'delivered') {
      actualDeliveryTime = new Date(estimatedDeliveryTime.getTime() + (Math.random() - 0.5) * 15 * 60 * 1000); // ±7.5 min
    }

    const deliveryFee = 5 + Math.random() * 15; // $5-$20
    const riderPayment = deliveryFee * 0.8;
    const platformFee = deliveryFee * 0.2;

    const delivery = {
      orderId: new mongoose.Types.ObjectId(), // ID ficticio
      storeId: new mongoose.Types.ObjectId(), // ID ficticio
      customerId: new mongoose.Types.ObjectId(), // ID ficticio
      riderId: rider._id,
      riderType: rider.type,
      riderName: `${rider.firstName} ${rider.lastName}`,
      riderPhone: rider.phone,
      status,
      pickupLocation: {
        address: `${Math.floor(Math.random() * 100) + 1} Calle ${Math.floor(Math.random() * 50) + 1}, Bogotá`,
        coordinates: pickupCoords,
        storeName: store.name
      },
      deliveryLocation: {
        address: `${Math.floor(Math.random() * 100) + 1} Carrera ${Math.floor(Math.random() * 50) + 1}, Bogotá`,
        coordinates: deliveryCoords,
        customerName: customer.name,
        customerPhone: customer.phone
      },
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      riderPayment: Math.round(riderPayment * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      trackingCode: generateTrackingCode(),
      trackingUrl: `https://app.piezasya.com/tracking/${generateTrackingCode()}`,
      estimatedPickupTime,
      estimatedDeliveryTime,
      actualPickupTime,
      actualDeliveryTime,
      statusHistory: [
        {
          status: 'pending',
          timestamp: createdAt,
          notes: 'Delivery creado',
          updatedBy: 'system'
        }
      ],
      createdAt,
      updatedAt: createdAt
    };

    // Agregar historial de estados
    if (status !== 'pending') {
      delivery.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(createdAt.getTime() + 5 * 60 * 1000),
        notes: `Asignado a ${rider.firstName} ${rider.lastName}`,
        updatedBy: 'system'
      });
    }

    if (['accepted', 'picked_up', 'in_transit', 'delivered'].includes(status)) {
      delivery.statusHistory.push({
        status: 'accepted',
        timestamp: new Date(createdAt.getTime() + 10 * 60 * 1000),
        notes: 'Rider aceptó el delivery',
        updatedBy: 'rider'
      });
    }

    if (['picked_up', 'in_transit', 'delivered'].includes(status)) {
      delivery.statusHistory.push({
        status: 'picked_up',
        timestamp: actualPickupTime,
        notes: 'Producto recogido de la tienda',
        updatedBy: 'rider'
      });
    }

    if (['in_transit', 'delivered'].includes(status)) {
      delivery.statusHistory.push({
        status: 'in_transit',
        timestamp: new Date(actualPickupTime.getTime() + 5 * 60 * 1000),
        notes: 'En camino al cliente',
        updatedBy: 'rider'
      });
    }

    if (status === 'delivered') {
      delivery.statusHistory.push({
        status: 'delivered',
        timestamp: actualDeliveryTime,
        notes: 'Delivery completado exitosamente',
        updatedBy: 'rider'
      });
    }

    deliveries.push(delivery);
  }

  try {
    // Limpiar deliveries existentes
    await Delivery.deleteMany({});
    console.log('🧹 Deliveries existentes eliminados');

    // Insertar nuevos deliveries
    const createdDeliveries = await Delivery.insertMany(deliveries);
    console.log(`✅ ${createdDeliveries.length} deliveries creados exitosamente`);

    return createdDeliveries;
  } catch (error) {
    console.error('❌ Error generando deliveries:', error);
    throw error;
  }
}

// Función principal
async function generateDeliveryTestData() {
  try {
    console.log('🚀 Iniciando generación de datos de prueba para delivery...');

    // Generar riders
    const riders = await generateTestRiders();

    // Generar deliveries
    const deliveries = await generateTestDeliveries(riders);

    console.log('🎉 Datos de prueba generados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Riders: ${riders.length}`);
    console.log(`   - Deliveries: ${deliveries.length}`);

    // Mostrar estadísticas
    const statusCounts = {};
    deliveries.forEach(d => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    });

    console.log(`📈 Estados de delivery:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    const typeCounts = {};
    riders.forEach(r => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });

    console.log(`👥 Tipos de riders:`);
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error en la generación de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateDeliveryTestData();
}

module.exports = { generateDeliveryTestData };
