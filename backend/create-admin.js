const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: true // Para el admin, lo verificamos automáticamente
  },
  isActive: {
    type: Boolean,
    default: true
  },
  points: {
    type: Number,
    default: 0
  },
  referralCode: String,
  loyaltyLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Crear hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Generar código de referido
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Crear usuario administrador
    const adminUser = new User({
      name: 'Administrador',
      email: 'admin@repuestospro.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      points: 1000,
      referralCode: referralCode,
      loyaltyLevel: 'platinum'
    });

    await adminUser.save();

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`   Email: admin@repuestospro.com`);
    console.log(`   Contraseña: admin123`);
    console.log(`   Role: admin`);
    console.log(`   Código de referido: ${referralCode}`);

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 