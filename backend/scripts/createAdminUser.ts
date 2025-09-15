import mongoose from 'mongoose';
import User from '../src/models/User';
import config from '../src/config/env';

async function createAdminUser() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ email: 'admin@piezasyaya.com' });
    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('Email: admin@piezasyaya.com');
      console.log('Password: admin123');
      return;
    }

    // Crear usuario admin
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@piezasyaya.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      points: 1000,
      loyaltyLevel: 'platinum',
      locationEnabled: false
    });

    console.log('✅ Usuario admin creado exitosamente');
    console.log('Email: admin@piezasyaya.com');
    console.log('Password: admin123');
    console.log('ID:', adminUser._id);

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

createAdminUser();
