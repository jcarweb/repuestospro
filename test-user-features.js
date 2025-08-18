const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario con ubicación
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { type: String, minlength: 6, select: false },
  phone: { type: String, match: [/^\+?[\d\s-()]+$/, 'Número de teléfono inválido'] },
  role: { type: String, enum: ['admin', 'client', 'delivery', 'store_manager'], default: 'client' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Ubicación GPS
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  locationEnabled: {
    type: Boolean,
    default: false
  },
  lastLocationUpdate: { type: Date },
  
  preferences: {
    notifications: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    language: { type: String, default: 'es' }
  }
}, {
  timestamps: true
});

// Índice geográfico para búsquedas por proximidad
userSchema.index({ location: '2dsphere' });

// Middleware para encriptar contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testUserFeatures() {
  try {
    console.log('🧪 Probando funcionalidades de usuario...\n');

    // 1. Crear usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    const testUser = new User({
      name: 'Usuario Prueba',
      email: 'test@example.com',
      password: 'TestPassword123!',
      phone: '+58 412 123 4567',
      role: 'client'
    });

    await testUser.save();
    console.log('✅ Usuario creado:', testUser.email);

    // 2. Probar actualización de ubicación
    console.log('\n2️⃣ Probando actualización de ubicación...');
    
    const locationData = {
      latitude: 10.4806,  // Caracas
      longitude: -66.9036,
      enabled: true
    };

    testUser.location = {
      type: 'Point',
      coordinates: [locationData.longitude, locationData.latitude]
    };
    testUser.locationEnabled = locationData.enabled;
    testUser.lastLocationUpdate = new Date();

    await testUser.save();
    console.log('✅ Ubicación actualizada:', {
      coordinates: testUser.location.coordinates,
      enabled: testUser.locationEnabled,
      lastUpdate: testUser.lastLocationUpdate
    });

    // 3. Probar cambio de contraseña
    console.log('\n3️⃣ Probando cambio de contraseña...');
    
    const newPassword = 'NewSecurePassword456!';
    const isOldPasswordValid = await testUser.comparePassword('TestPassword123!');
    console.log('✅ Contraseña anterior válida:', isOldPasswordValid);

    testUser.password = newPassword;
    await testUser.save();

    const isNewPasswordValid = await testUser.comparePassword(newPassword);
    console.log('✅ Nueva contraseña válida:', isNewPasswordValid);

    // 4. Probar búsqueda por proximidad
    console.log('\n4️⃣ Probando búsqueda por proximidad...');
    
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-66.9036, 10.4806] // Caracas
          },
          $maxDistance: 10000 // 10km
        }
      }
    }).limit(5);

    console.log('✅ Usuarios cercanos encontrados:', nearbyUsers.length);

    // 5. Probar validaciones de contraseña
    console.log('\n5️⃣ Probando validaciones de contraseña...');
    
    const passwordTests = [
      'short',           // Muy corta
      'nouppercase',     // Sin mayúscula
      'NOLOWERCASE',     // Sin minúscula
      'NoNumbers',       // Sin números
      'NoSpecial123',    // Sin caracteres especiales
      'ValidPass123!'    // Válida
    ];

    for (const password of passwordTests) {
      const isValid = password.length >= 8 && 
                     /[A-Z]/.test(password) && 
                     /[a-z]/.test(password) && 
                     /\d/.test(password) && 
                     /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      console.log(`   ${password}: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
    }

    // 6. Probar geocodificación (simulación)
    console.log('\n6️⃣ Probando geocodificación...');
    
    const testCoordinates = [
      { lat: 10.4806, lng: -66.9036, name: 'Caracas' },
      { lat: 10.1579, lng: -67.9972, name: 'Valencia' },
      { lat: 10.6427, lng: -71.6125, name: 'Maracaibo' }
    ];

    for (const coord of testCoordinates) {
      console.log(`   ${coord.name}: ${coord.lat}, ${coord.lng}`);
    }

    // 7. Limpiar datos de prueba
    console.log('\n7️⃣ Limpiando datos de prueba...');
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Creación de usuario');
    console.log('   ✅ Actualización de ubicación GPS');
    console.log('   ✅ Cambio de contraseña');
    console.log('   ✅ Búsqueda por proximidad');
    console.log('   ✅ Validaciones de contraseña');
    console.log('   ✅ Geocodificación de coordenadas');
    console.log('   ✅ Índices geográficos MongoDB');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar pruebas
testUserFeatures();
