import mongoose from 'mongoose';
import PointsPolicy from '../models/PointsPolicy';
import User from '../models/User';
import { config } from '../config/env';
const defaultPolicies = [
  {
    action: 'purchase',
    points: 1,
    description: 'Puntos por cada compra realizada (1 punto por cada $1)',
    isActive: true,
    conditions: {
      minAmount: 1,
      frequency: 'once'
    }
  },
  {
    action: 'review',
    points: 10,
    description: 'Puntos por enviar una reseña de producto',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'referral',
    points: 50,
    description: 'Puntos por referir a un nuevo cliente que se registre',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'share',
    points: 5,
    description: 'Puntos por compartir productos en redes sociales',
    isActive: true,
    conditions: {
      frequency: 'daily'
    }
  },
  {
    action: 'login',
    points: 1,
    description: 'Puntos por iniciar sesión diariamente',
    isActive: true,
    conditions: {
      frequency: 'daily'
    }
  },
  {
    action: 'birthday',
    points: 100,
    description: 'Puntos por cumpleaños del cliente',
    isActive: true,
    conditions: {
      frequency: 'once'
    }
  },
  {
    action: 'anniversary',
    points: 25,
    description: 'Puntos por aniversario de registro',
    isActive: true,
    conditions: {
      frequency: 'monthly'
    }
  }
];
async function seedPointsPolicies() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(config.MONGODB_URI);
    console.log('Conectado a MongoDB');
    // Obtener un usuario admin para asignar como creador
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No se encontró un usuario admin. Creando políticas sin creador...');
    }
    // Eliminar políticas existentes
    await PointsPolicy.deleteMany({});
    console.log('Políticas existentes eliminadas');
    // Crear nuevas políticas
    const policiesToCreate = defaultPolicies.map(policy => ({
      ...policy,
      createdBy: adminUser?._id || new mongoose.Types.ObjectId()
    }));
    const createdPolicies = await PointsPolicy.insertMany(policiesToCreate);
    console.log(`${createdPolicies.length} políticas creadas exitosamente`);
    // Mostrar las políticas creadas
    console.log('\nPolíticas creadas:');
    createdPolicies.forEach(policy => {
      console.log(`- ${policy.action}: ${policy.points} puntos - ${policy.description}`);
    });
  } catch (error) {
    console.error('Error inicializando políticas de puntos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}
// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedPointsPolicies();
}
export default seedPointsPolicies;