import mongoose from 'mongoose';
import User from '../models/User';
import config from '../config/env';

async function updateUserPreferences() {
  try {
    console.log('🚀 Iniciando actualización de preferencias de usuarios...');
    console.log('📊 URI de MongoDB:', config.MONGODB_URI);
    
    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Conectado a la base de datos');

    // Buscar usuarios que no tengan los campos de preferencias
    const usersToUpdate = await User.find({
      $or: [
        { theme: { $exists: false } },
        { language: { $exists: false } },
        { profileVisibility: { $exists: false } },
        { showEmail: { $exists: false } },
        { showPhone: { $exists: false } },
        { emailNotifications: { $exists: false } },
        { pushNotifications: { $exists: false } },
        { marketingEmails: { $exists: false } },
        { pushEnabled: { $exists: false } }
      ]
    });

    console.log(`📊 Encontrados ${usersToUpdate.length} usuarios para actualizar`);

    if (usersToUpdate.length === 0) {
      console.log('✅ Todos los usuarios ya tienen las preferencias configuradas');
      return;
    }

    // Actualizar cada usuario con las preferencias por defecto
    for (const user of usersToUpdate) {
      const updateData: any = {};

      // Solo actualizar campos que no existan
      if (!user.theme) updateData.theme = 'light';
      if (!user.language) updateData.language = 'es';
      if (!user.profileVisibility) updateData.profileVisibility = 'public';
      if (!user.showEmail) updateData.showEmail = false;
      if (!user.showPhone) updateData.showPhone = false;
      if (!(user as any).emailNotifications) updateData.emailNotifications = true;
      if (!user.pushNotifications) updateData.pushNotifications = true;
      if (!user.marketingEmails) updateData.marketingEmails = false;
      if (!user.pushEnabled) updateData.pushEnabled = true;

      await User.findByIdAndUpdate((user as any)._id, updateData);
      console.log(`✅ Usuario ${(user as any).email} actualizado`);
    }

    console.log('✅ Todos los usuarios han sido actualizados exitosamente');

  } catch (error) {
    console.error('❌ Error actualizando usuarios:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de la base de datos');
  }
}

// Ejecutar el script
updateUserPreferences();
