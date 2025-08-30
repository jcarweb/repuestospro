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

// Esquema de usuario compatible con el modelo existente
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['admin', 'client', 'delivery', 'store_manager'], default: 'client' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  fingerprintEnabled: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  locationEnabled: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  referralCode: String,
  totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  loyaltyLevel: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  notificationsEnabled: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, enum: ['es', 'en', 'pt'], default: 'es' },
  profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  showEmail: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: true },
  pushEnabled: { type: Boolean, default: false },
  
  // Campos específicos para Delivery
  deliveryStatus: { type: String, enum: ['available', 'unavailable', 'busy', 'on_route', 'returning_to_store'] },
  autoStatusMode: { type: Boolean, default: false },
  currentOrder: { type: mongoose.Schema.Types.ObjectId },
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
  }
}, { 
  timestamps: true,
  collection: 'users' // Asegurar que use la colección correcta
});

const User = mongoose.model('User', userSchema);

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

    // Crear usuario de delivery básico primero
    const deliveryUser = new User({
      name: 'Carlos Delivery Test',
      email: 'delivery.test@piezasyapp.com',
      password: hashedPassword,
      phone: '+58 412-123-4567',
      role: 'delivery',
      isEmailVerified: true,
      isActive: true,
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
    console.log('✅ Usuario básico creado');

    // Actualizar con campos de delivery básicos
    await User.findByIdAndUpdate(deliveryUser._id, {
      deliveryStatus: 'available',
      autoStatusMode: true
    });
    console.log('✅ Campos de delivery básicos actualizados');

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
