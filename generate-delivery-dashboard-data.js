const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasyapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Esquemas simplificados para el script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  deliveryStatus: String,
  autoStatusMode: Boolean,
  deliveryZone: {
    center: [Number],
    radius: Number
  },
  vehicleInfo: {
    type: String,
    model: String,
    plate: String
  },
  workSchedule: {
    startTime: String,
    endTime: String,
    daysOfWeek: [Number]
  },
  rating: {
    average: Number,
    totalReviews: Number
  }
}, { timestamps: true });

const deliverySchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  storeId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  riderId: mongoose.Schema.Types.ObjectId,
  riderType: String,
  status: String,
  pickupLocation: {
    address: String,
    coordinates: { lat: Number, lng: Number },
    storeName: String
  },
  deliveryLocation: {
    address: String,
    coordinates: { lat: Number, lng: Number },
    customerName: String,
    customerPhone: String,
    instructions: String
  },
  deliveryFee: Number,
  riderPayment: Number,
  platformFee: Number,
  trackingCode: String,
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  statusHistory: [{
    status: String,
    timestamp: Date,
    notes: String,
    updatedBy: String
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Delivery = mongoose.model('Delivery', deliverySchema);

// Datos de prueba
const deliveryUsers = [
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.delivery@piezasyapp.com',
    password: '$2b$10$hashedpassword',
    phone: '+58 412-123-4567',
    role: 'delivery',
    deliveryStatus: 'available',
    autoStatusMode: true,
    deliveryZone: {
      center: [10.4806, -66.9036], // Caracas
      radius: 15
    },
    vehicleInfo: {
      type: 'motorcycle',
      model: 'Honda CG 150',
      plate: 'ABC-123'
    },
    workSchedule: {
      startTime: '08:00',
      endTime: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6]
    },
    rating: {
      average: 4.8,
      totalReviews: 156
    }
  },
  {
    name: 'María González',
    email: 'maria.delivery@piezasyapp.com',
    password: '$2b$10$hashedpassword',
    phone: '+58 414-987-6543',
    role: 'delivery',
    deliveryStatus: 'busy',
    autoStatusMode: false,
    deliveryZone: {
      center: [10.4806, -66.9036],
      radius: 12
    },
    vehicleInfo: {
      type: 'motorcycle',
      model: 'Yamaha YBR 125',
      plate: 'XYZ-789'
    },
    workSchedule: {
      startTime: '09:00',
      endTime: '19:00',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    rating: {
      average: 4.6,
      totalReviews: 89
    }
  },
  {
    name: 'José Pérez',
    email: 'jose.delivery@piezasyapp.com',
    password: '$2b$10$hashedpassword',
    phone: '+58 416-555-1234',
    role: 'delivery',
    deliveryStatus: 'unavailable',
    autoStatusMode: true,
    deliveryZone: {
      center: [10.4806, -66.9036],
      radius: 10
    },
    vehicleInfo: {
      type: 'bicycle',
      model: 'Mountain Bike',
      plate: ''
    },
    workSchedule: {
      startTime: '07:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0]
    },
    rating: {
      average: 4.9,
      totalReviews: 234
    }
  }
];

const deliveryData = [
  {
    orderId: new mongoose.Types.ObjectId(),
    storeId: new mongoose.Types.ObjectId(),
    customerId: new mongoose.Types.ObjectId(),
    riderId: null, // Se asignará después
    riderType: 'internal',
    status: 'pending',
    pickupLocation: {
      address: 'Av. Libertador, Caracas',
      coordinates: { lat: 10.4806, lng: -66.9036 },
      storeName: 'Repuestos Automotrices Central'
    },
    deliveryLocation: {
      address: 'Calle Real, Los Rosales, Caracas',
      coordinates: { lat: 10.4850, lng: -66.9000 },
      customerName: 'Juan Martínez',
      customerPhone: '+58 412-111-2222',
      instructions: 'Entregar en la portería del edificio'
    },
    deliveryFee: 8.50,
    riderPayment: 6.80,
    platformFee: 1.70,
    trackingCode: 'DEL-ABC123',
    estimatedPickupTime: new Date(Date.now() + 30 * 60000), // 30 min
    estimatedDeliveryTime: new Date(Date.now() + 60 * 60000), // 60 min
    statusHistory: [{
      status: 'pending',
      timestamp: new Date(),
      notes: 'Orden creada',
      updatedBy: 'system'
    }]
  },
  {
    orderId: new mongoose.Types.ObjectId(),
    storeId: new mongoose.Types.ObjectId(),
    customerId: new mongoose.Types.ObjectId(),
    riderId: null,
    riderType: 'internal',
    status: 'assigned',
    pickupLocation: {
      address: 'Centro Comercial Sambil, Caracas',
      coordinates: { lat: 10.4700, lng: -66.9100 },
      storeName: 'Auto Parts Express'
    },
    deliveryLocation: {
      address: 'Urbanización El Rosal, Caracas',
      coordinates: { lat: 10.4900, lng: -66.8900 },
      customerName: 'Ana López',
      customerPhone: '+58 414-333-4444',
      instructions: 'Llamar al llegar'
    },
    deliveryFee: 12.00,
    riderPayment: 9.60,
    platformFee: 2.40,
    trackingCode: 'DEL-DEF456',
    estimatedPickupTime: new Date(Date.now() + 15 * 60000),
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000),
    statusHistory: [{
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60000),
      notes: 'Orden creada',
      updatedBy: 'system'
    }, {
      status: 'assigned',
      timestamp: new Date(),
      notes: 'Asignado a Carlos Rodríguez',
      updatedBy: 'system'
    }]
  },
  {
    orderId: new mongoose.Types.ObjectId(),
    storeId: new mongoose.Types.ObjectId(),
    customerId: new mongoose.Types.ObjectId(),
    riderId: null,
    riderType: 'internal',
    status: 'in_transit',
    pickupLocation: {
      address: 'Plaza Venezuela, Caracas',
      coordinates: { lat: 10.5000, lng: -66.8800 },
      storeName: 'Mega Repuestos'
    },
    deliveryLocation: {
      address: 'Colinas de Bello Monte, Caracas',
      coordinates: { lat: 10.4750, lng: -66.9200 },
      customerName: 'Roberto Silva',
      customerPhone: '+58 416-555-6666',
      instructions: 'Entregar en la entrada principal'
    },
    deliveryFee: 10.00,
    riderPayment: 8.00,
    platformFee: 2.00,
    trackingCode: 'DEL-GHI789',
    estimatedPickupTime: new Date(Date.now() - 20 * 60000),
    estimatedDeliveryTime: new Date(Date.now() + 10 * 60000),
    actualPickupTime: new Date(Date.now() - 15 * 60000),
    statusHistory: [{
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60000),
      notes: 'Orden creada',
      updatedBy: 'system'
    }, {
      status: 'assigned',
      timestamp: new Date(Date.now() - 25 * 60000),
      notes: 'Asignado a María González',
      updatedBy: 'system'
    }, {
      status: 'picked_up',
      timestamp: new Date(Date.now() - 15 * 60000),
      notes: 'Producto recogido',
      updatedBy: 'maria.delivery@piezasyapp.com'
    }, {
      status: 'in_transit',
      timestamp: new Date(Date.now() - 5 * 60000),
      notes: 'En camino al cliente',
      updatedBy: 'maria.delivery@piezasyapp.com'
    }]
  }
];

// Generar datos históricos para estadísticas
const generateHistoricalDeliveries = (riderId, count = 50) => {
  const historicalDeliveries = [];
  const statuses = ['delivered', 'cancelled', 'failed'];
  const stores = [
    'Repuestos Automotrices Central',
    'Auto Parts Express',
    'Mega Repuestos',
    'Car Parts Plus',
    'Express Auto Parts'
  ];
  const customers = [
    'Juan Martínez', 'Ana López', 'Roberto Silva', 'Carmen Rodríguez',
    'Luis González', 'Patricia Pérez', 'Miguel Torres', 'Isabel Ruiz'
  ];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const deliveryDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Últimos 30 días
    const deliveryFee = Math.floor(Math.random() * 15) + 5; // $5-$20
    const riderPayment = deliveryFee * 0.8;
    const platformFee = deliveryFee * 0.2;

    const delivery = {
      orderId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      customerId: new mongoose.Types.ObjectId(),
      riderId: riderId,
      riderType: 'internal',
      status: status,
      pickupLocation: {
        address: `Dirección ${i + 1}, Caracas`,
        coordinates: { 
          lat: 10.4806 + (Math.random() - 0.5) * 0.02, 
          lng: -66.9036 + (Math.random() - 0.5) * 0.02 
        },
        storeName: stores[Math.floor(Math.random() * stores.length)]
      },
      deliveryLocation: {
        address: `Entrega ${i + 1}, Caracas`,
        coordinates: { 
          lat: 10.4806 + (Math.random() - 0.5) * 0.02, 
          lng: -66.9036 + (Math.random() - 0.5) * 0.02 
        },
        customerName: customers[Math.floor(Math.random() * customers.length)],
        customerPhone: `+58 41${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9999)}`,
        instructions: Math.random() > 0.7 ? 'Instrucciones especiales de entrega' : ''
      },
      deliveryFee: deliveryFee,
      riderPayment: riderPayment,
      platformFee: platformFee,
      trackingCode: `DEL-HIST${i.toString().padStart(3, '0')}`,
      estimatedPickupTime: new Date(deliveryDate.getTime() - 30 * 60000),
      estimatedDeliveryTime: new Date(deliveryDate.getTime() + 30 * 60000),
      actualPickupTime: status === 'delivered' ? new Date(deliveryDate.getTime() - 20 * 60000) : null,
      actualDeliveryTime: status === 'delivered' ? deliveryDate : null,
      createdAt: new Date(deliveryDate.getTime() - 60 * 60000),
      updatedAt: deliveryDate,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(deliveryDate.getTime() - 60 * 60000),
        notes: 'Orden creada',
        updatedBy: 'system'
      }]
    };

    if (status === 'delivered') {
      delivery.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(deliveryDate.getTime() - 45 * 60000),
        notes: 'Asignado a rider',
        updatedBy: 'system'
      });
      delivery.statusHistory.push({
        status: 'picked_up',
        timestamp: new Date(deliveryDate.getTime() - 20 * 60000),
        notes: 'Producto recogido',
        updatedBy: 'rider'
      });
      delivery.statusHistory.push({
        status: 'delivered',
        timestamp: deliveryDate,
        notes: 'Entregado exitosamente',
        updatedBy: 'rider'
      });
    }

    historicalDeliveries.push(delivery);
  }

  return historicalDeliveries;
};

async function generateDeliveryDashboardData() {
  try {
    console.log('🚀 Generando datos para el dashboard de delivery...');

    // Limpiar datos existentes
    await User.deleteMany({ role: 'delivery' });
    await Delivery.deleteMany({});

    console.log('✅ Datos existentes limpiados');

    // Crear usuarios de delivery
    const createdUsers = await User.insertMany(deliveryUsers);
    console.log(`✅ ${createdUsers.length} usuarios de delivery creados`);

    // Asignar riderId a los deliveries
    deliveryData[0].riderId = createdUsers[0]._id; // Carlos
    deliveryData[1].riderId = createdUsers[1]._id; // María
    deliveryData[2].riderId = createdUsers[1]._id; // María

    // Crear deliveries actuales
    const createdDeliveries = await Delivery.insertMany(deliveryData);
    console.log(`✅ ${createdDeliveries.length} deliveries actuales creados`);

    // Generar datos históricos para cada rider
    for (const user of createdUsers) {
      const historicalDeliveries = generateHistoricalDeliveries(user._id, 30);
      await Delivery.insertMany(historicalDeliveries);
      console.log(`✅ 30 deliveries históricos creados para ${user.name}`);
    }

    console.log('\n🎉 Datos del dashboard de delivery generados exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- ${createdUsers.length} usuarios de delivery`);
    console.log(`- ${createdDeliveries.length} deliveries actuales`);
    console.log(`- ${createdUsers.length * 30} deliveries históricos`);
    console.log('\n🔑 Credenciales de prueba:');
    createdUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name})`);
    });

  } catch (error) {
    console.error('❌ Error generando datos:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Ejecutar el script
generateDeliveryDashboardData();
