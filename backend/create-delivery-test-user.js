const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
console.log('🔌 Conectando a MongoDB...');
console.log('📡 URI:', process.env.MONGODB_URI ? 'Configurada' : 'No configurada');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasyapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB exitosamente');
}).catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Usar el modelo User existente
const User = mongoose.model('User');

async function createDeliveryTestUser() {
  try {
    console.log('🚀 Creando usuario de delivery de prueba...');

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email: 'delivery.test@piezasyapp.com' });
    if (existingUser) {
      console.log('✅ Usuario de delivery ya existe');
      console.log('📧 Email: delivery.test@piezasyapp.com');
      console.log('🔑 Contraseña: password123');
      console.log('👤 Nombre: Carlos Delivery Test');
      console.log('📱 Teléfono: +58 412-123-4567');
      console.log('🚗 Vehículo: Honda CG 150 - ABC-123');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Crear usuario de delivery
    const deliveryUser = new User({
      name: 'Carlos Delivery Test',
      email: 'delivery.test@piezasyapp.com',
      password: hashedPassword,
      phone: '+58 412-123-4567',
      role: 'delivery',
      isEmailVerified: true,
      isActive: true,
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
      points: 0,
      referralCode: 'CARLOS123',
      totalPurchases: 0,
      totalSpent: 0,
      loyaltyLevel: 'bronze',
      notificationsEnabled: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: 'light',
      language: 'es',
      profileVisibility: 'public',
      showEmail: true,
      showPhone: true,
      pushEnabled: false,
      locationEnabled: true
    });

    await deliveryUser.save();

    console.log('✅ Usuario de delivery creado exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('📧 Email: delivery.test@piezasyapp.com');
    console.log('🔑 Contraseña: password123');
    console.log('👤 Nombre: Carlos Delivery Test');
    console.log('📱 Teléfono: +58 412-123-4567');
    console.log('🚗 Vehículo: Honda CG 150 - ABC-123');
    console.log('⭐ Calificación: 4.8/5 (156 reseñas)');
    console.log('📍 Zona de trabajo: 15 km de radio en Caracas');

  } catch (error) {
    console.error('❌ Error creando usuario de delivery:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Ejecutar el script
createDeliveryTestUser();
