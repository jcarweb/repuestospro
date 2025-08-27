import mongoose from 'mongoose';
import Store from './src/models/Store';
import Subscription from './src/models/Subscription';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');

async function assignSampleSubscriptions() {
  try {
    console.log('🎯 Asignando suscripciones de ejemplo a tiendas...');

    // Obtener todos los planes de suscripción
    const subscriptions = await Subscription.find().sort({ price: 1 });
    if (subscriptions.length === 0) {
      console.log('❌ No hay planes de suscripción disponibles. Ejecuta primero seed-subscriptions.ts');
      return;
    }

    console.log(`📋 Planes disponibles: ${subscriptions.map(s => s.name).join(', ')}`);

    // Obtener todas las tiendas
    const stores = await Store.find();
    if (stores.length === 0) {
      console.log('❌ No hay tiendas disponibles');
      return;
    }

    console.log(`🏪 Encontradas ${stores.length} tiendas`);

    // Asignar suscripciones de ejemplo
    const basicPlan = subscriptions.find(s => s.type === 'basic');
    const proPlan = subscriptions.find(s => s.type === 'pro');
    const elitePlan = subscriptions.find(s => s.type === 'elite');

    let updatedCount = 0;

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      let subscriptionId = null;
      let status = 'inactive';
      let expiresAt = null;

      // Asignar planes de forma rotativa
      if (i % 3 === 0) {
        // 33% - Plan Básico
        subscriptionId = basicPlan?._id;
        status = 'active';
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (i % 3 === 1) {
        // 33% - Plan Pro
        subscriptionId = proPlan?._id;
        status = 'active';
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        // 33% - Plan Élite
        subscriptionId = elitePlan?._id;
        status = 'active';
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // Actualizar la tienda
      await Store.findByIdAndUpdate(store._id, {
        subscription: subscriptionId,
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt
      });

      updatedCount++;
      const planName = subscriptions.find(s => (s as any)._id.toString() === subscriptionId?.toString())?.name || 'Sin plan';
      console.log(`✅ ${store.name} - ${planName}`);
    }

    console.log(`🎉 ${updatedCount} tiendas actualizadas con suscripciones`);

    // Mostrar estadísticas
    const stats = await Store.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscription',
          foreignField: '_id',
          as: 'subscriptionDetails'
        }
      },
      {
        $group: {
          _id: '$subscriptionStatus',
          count: { $sum: 1 },
          plans: {
            $push: {
              name: { $arrayElemAt: ['$subscriptionDetails.name', 0] },
              type: { $arrayElemAt: ['$subscriptionDetails.type', 0] }
            }
          }
        }
      }
    ]);

    console.log('\n📊 Estadísticas de suscripciones:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} tiendas`);
      const planCounts: { [key: string]: number } = {};
      stat.plans.forEach((plan: any) => {
        if (plan.name) {
          planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
        }
      });
      Object.entries(planCounts).forEach(([plan, count]) => {
        console.log(`     - ${plan}: ${count}`);
      });
    });

  } catch (error) {
    console.error('❌ Error al asignar suscripciones:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
assignSampleSubscriptions();
