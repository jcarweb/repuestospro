const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
async function testAuth() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/repuestospro');
    console.log('✅ Conectado a MongoDB');

    // Definir el esquema de Usuario
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true, maxlength: 100 },
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
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
      lastLogin: { type: Date },
      loginAttempts: { type: Number, default: 0 },
      lockUntil: { type: Date },
      preferences: {
        notifications: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
        language: { type: String, default: 'es' }
      }
    }, {
      timestamps: true
    });

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

    // Definir el esquema de Actividad
    const activitySchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { 
        type: String, 
        required: true,
        enum: [
          'login', 'logout', 'register', 'password_reset', 'email_verification',
          'cart_add', 'cart_remove', 'cart_clear', 'purchase', 'profile_update',
          'pin_setup', 'fingerprint_setup', 'google_login', 'account_lock', 'account_unlock'
        ]
      },
      description: { type: String, required: true },
      metadata: {
        ip: String,
        userAgent: String,
        device: String,
        location: String,
        productId: String,
        productName: String,
        quantity: Number,
        total: Number,
        paymentMethod: String,
        orderId: String
      },
      success: { type: Boolean, required: true, default: true },
      errorMessage: String
    }, {
      timestamps: true
    });

    const Activity = mongoose.model('Activity', activitySchema);

    // Probar registro de usuario
    console.log('\n🧪 Probando registro de usuario...');
    
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: '123456',
      phone: '+1234567890'
    };

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('⚠️ Usuario ya existe, eliminando...');
      await User.findByIdAndDelete(existingUser._id);
    }

    // Crear nuevo usuario
    const user = await User.create(userData);
    console.log('✅ Usuario creado exitosamente:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Registrar actividad
    await Activity.create({
      userId: user._id,
      type: 'register',
      description: 'Usuario registrado exitosamente',
      metadata: { ip: '127.0.0.1', userAgent: 'Test Script' }
    });
    console.log('✅ Actividad registrada');

    // Probar login
    console.log('\n🧪 Probando login...');
    
    const loginUser = await User.findOne({ email: userData.email }).select('+password');
    const isValidPassword = await loginUser.comparePassword(userData.password);
    
    if (isValidPassword) {
      console.log('✅ Login exitoso');
      
      // Registrar actividad de login
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'Inicio de sesión exitoso',
        metadata: { ip: '127.0.0.1', userAgent: 'Test Script' }
      });
      console.log('✅ Actividad de login registrada');
    } else {
      console.log('❌ Login fallido');
    }

    // Listar usuarios
    console.log('\n📋 Usuarios en la base de datos:');
    const users = await User.find().select('-password');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    // Listar actividades
    console.log('\n📋 Actividades en la base de datos:');
    const activities = await Activity.find().populate('userId', 'name email');
    activities.forEach(activity => {
      console.log(`- ${activity.type}: ${activity.description} (${activity.userId.name})`);
    });

    console.log('\n✅ Todas las pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testAuth();