import mongoose from 'mongoose';
import User from '../models/User';

// Configuración de la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
} as any);

// Datos de usuarios de prueba
const testUsers = [
  {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+584121234567',
    password: 'password123', // Contraseña temporal
    role: 'store_manager', // Usar store_manager ya que store_owner no existe en el enum
    isEmailVerified: true,
    isActive: true,
    points: 100,
    loyaltyLevel: 'silver',
    theme: 'light',
    language: 'es'
  },
  {
    name: 'María García',
    email: 'maria@example.com',
    phone: '+584121234568',
    password: 'password123',
    role: 'store_manager',
    isEmailVerified: true,
    isActive: true,
    points: 150,
    loyaltyLevel: 'gold',
    theme: 'dark',
    language: 'es'
  },
  {
    name: 'Carlos López',
    email: 'carlos@example.com',
    phone: '+584121234569',
    password: 'password123',
    role: 'store_manager',
    isEmailVerified: true,
    isActive: true,
    points: 200,
    loyaltyLevel: 'platinum',
    theme: 'light',
    language: 'es'
  },
  {
    name: 'Ana Rodríguez',
    email: 'ana@example.com',
    phone: '+584121234570',
    password: 'password123',
    role: 'store_manager',
    isEmailVerified: true,
    isActive: true,
    points: 75,
    loyaltyLevel: 'bronze',
    theme: 'dark',
    language: 'es'
  },
  {
    name: 'Pedro Martínez',
    email: 'pedro@example.com',
    phone: '+584121234571',
    password: 'password123',
    role: 'store_manager',
    isEmailVerified: true,
    isActive: true,
    points: 300,
    loyaltyLevel: 'platinum',
    theme: 'light',
    language: 'es'
  },
  {
    name: 'Laura Sánchez',
    email: 'laura@example.com',
    phone: '+584121234572',
    password: 'password123',
    role: 'store_manager',
    isEmailVerified: true,
    isActive: true,
    points: 120,
    loyaltyLevel: 'silver',
    theme: 'dark',
    language: 'es'
  }
];

// Función para generar usuarios de prueba
export async function generateTestUsers() {
  try {
    console.log('🚀 Iniciando generación de usuarios de prueba...');
    
    // Verificar si ya existen usuarios con estos emails
    const existingEmails = await User.find({
      email: { $in: testUsers.map(user => (user as any).email) }
    }).select('email');
    
    const existingEmailSet = new Set(existingEmails.map(user => (user as any).email));
    const newUsers = testUsers.filter(user => !existingEmailSet.has((user as any).email));
    
    if (newUsers.length === 0) {
      console.log('✅ Todos los usuarios de prueba ya existen en la base de datos');
      return;
    }
    
    console.log(`📝 Creando ${newUsers.length} usuarios de prueba...`);
    
    // Crear usuarios
    const createdUsers = await User.insertMany(newUsers);
    console.log(`✅ Se crearon ${createdUsers.length} usuarios de prueba exitosamente`);
    
    // Mostrar estadísticas por rol
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Estadísticas por rol:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} usuarios`);
    });
    
    console.log('\n🎉 Generación de usuarios de prueba completada!');
    
  } catch (error) {
    console.error('❌ Error generando usuarios de prueba:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateTestUsers();
}
