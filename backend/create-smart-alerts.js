const mongoose = require('mongoose');
const path = require('path');

// Cargar variables de entorno desde el directorio backend
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Conectar a MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquemas
const inventoryAlertSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  alertType: { type: String, enum: ['low_stock', 'out_of_stock', 'custom'], required: true },
  threshold: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  lastTriggered: { type: Date },
  notificationSettings: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const alertNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  alert: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryAlert', required: true },
  type: { type: String, enum: ['low_stock', 'out_of_stock', 'custom'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  currentStock: { type: Number, required: true },
  threshold: { type: Number, required: true },
  isRead: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
  sentAt: { type: Date },
  readAt: { type: Date }
}, {
  timestamps: true
});

const productInventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  mainStock: {
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'store_manager', 'delivery', 'client'], default: 'client' }
}, {
  timestamps: true
});

const InventoryAlert = mongoose.model('InventoryAlert', inventoryAlertSchema);
const AlertNotification = mongoose.model('AlertNotification', alertNotificationSchema);
const ProductInventory = mongoose.model('ProductInventory', productInventorySchema);
const User = mongoose.model('User', userSchema);

// Función para crear alertas inteligentes
const createSmartAlerts = async () => {
  try {
    console.log('🧠 Creando alertas inteligentes...');
    
    // Obtener un usuario gestor de tienda
    let storeManager = await User.findOne({ role: 'store_manager' });
    if (!storeManager) {
      storeManager = new User({
        name: 'Gestor de Tienda Test',
        email: 'gestor@test.com',
        role: 'store_manager'
      });
      await storeManager.save();
      console.log('👤 Creado usuario gestor de tienda de prueba');
    }

    // Obtener inventarios con información de productos y tiendas
    const inventories = await ProductInventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      {
        $unwind: '$productInfo'
      },
      {
        $unwind: '$storeInfo'
      },
      {
        $match: {
          'mainStock.available': { $gt: 0 } // Solo productos con stock disponible
        }
      },
      {
        $limit: 20 // Limitar a 20 productos para no crear demasiadas alertas
      }
    ]);

    if (inventories.length === 0) {
      console.log('❌ No hay inventarios con stock disponible');
      return;
    }

    console.log(`📦 Encontrados ${inventories.length} productos con stock disponible`);

    // Limpiar alertas existentes
    await InventoryAlert.deleteMany({});
    console.log('🗑️  Alertas existentes eliminadas');

    // Crear alertas inteligentes
    const testAlerts = [];
    
    for (const inventory of inventories) {
      const product = inventory.productInfo;
      const store = inventory.storeInfo;
      const currentStock = inventory.mainStock.available;
      
      // Crear alerta de stock bajo (umbral dinámico basado en stock actual)
      const lowStockThreshold = Math.max(1, Math.floor(currentStock * 0.3)); // 30% del stock actual
      
      const lowStockAlert = new InventoryAlert({
        store: store._id,
        product: product._id,
        alertType: 'low_stock',
        threshold: lowStockThreshold,
        notificationSettings: {
          email: true,
          inApp: true,
          sms: false
        },
        createdBy: storeManager._id,
        updatedBy: storeManager._id
      });

      // Crear alerta de sin stock
      const outOfStockAlert = new InventoryAlert({
        store: store._id,
        product: product._id,
        alertType: 'out_of_stock',
        threshold: 0,
        notificationSettings: {
          email: true,
          inApp: true,
          sms: false
        },
        createdBy: storeManager._id,
        updatedBy: storeManager._id
      });

      testAlerts.push(lowStockAlert, outOfStockAlert);
    }

    // Guardar las alertas
    const savedAlerts = await InventoryAlert.insertMany(testAlerts);
    console.log(`✅ Creadas ${savedAlerts.length} alertas inteligentes`);

    // Mostrar las alertas creadas
    console.log('\n📋 Alertas creadas:');
    for (let i = 0; i < Math.min(10, inventories.length); i++) {
      const inventory = inventories[i];
      const product = inventory.productInfo;
      const store = inventory.storeInfo;
      const currentStock = inventory.mainStock.available;
      const lowStockThreshold = Math.max(1, Math.floor(currentStock * 0.3));
      
      console.log(`   - ${product.name} en ${store.name}`);
      console.log(`     * Stock actual: ${currentStock}`);
      console.log(`     * Alerta stock bajo: ${lowStockThreshold}`);
      console.log(`     * Alerta sin stock: 0`);
    }

    return savedAlerts;

  } catch (error) {
    console.error('❌ Error creando alertas inteligentes:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función para verificar y generar notificaciones
const checkAndGenerateNotifications = async () => {
  try {
    console.log('\n🔍 Verificando alertas y generando notificaciones...');
    
    // Obtener todas las alertas activas
    const alerts = await InventoryAlert.find({
      isActive: true
    });

    console.log(`📊 Encontradas ${alerts.length} alertas activas`);

    const generatedNotifications = [];

    for (const alert of alerts) {
      // Obtener el inventario actual del producto
      const inventory = await ProductInventory.findOne({
        product: alert.product,
        store: alert.store
      });

      if (!inventory) {
        console.log(`⚠️  No se encontró inventario para producto ${alert.product} en tienda ${alert.store}`);
        continue;
      }

      const currentStock = inventory.mainStock.available;
      const shouldTrigger = currentStock <= alert.threshold;

      // Verificar si ya se generó una notificación recientemente (últimas 24 horas)
      const lastNotification = await AlertNotification.findOne({
        alert: alert._id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (shouldTrigger && !lastNotification) {
        // Obtener información del producto y tienda
        const product = await mongoose.connection.db.collection('products').findOne({ _id: alert.product });
        const store = await mongoose.connection.db.collection('stores').findOne({ _id: alert.store });
        
        // Generar notificación
        const notification = new AlertNotification({
          user: alert.createdBy,
          store: alert.store,
          product: alert.product,
          alert: alert._id,
          type: alert.alertType,
          title: `Alerta de Stock - ${product?.name || 'Producto'}`,
          message: `El producto ${product?.name || 'Producto'} (${product?.sku || 'N/A'}) tiene ${currentStock} unidades disponibles. Umbral: ${alert.threshold}`,
          currentStock,
          threshold: alert.threshold,
          isSent: false
        });

        await notification.save();
        generatedNotifications.push(notification);

        // Actualizar última vez que se activó la alerta
        alert.lastTriggered = new Date();
        await alert.save();

        console.log(`🔔 Generada notificación para ${product?.name || 'Producto'} en ${store?.name || 'Tienda'} - Stock: ${currentStock}/${alert.threshold}`);
      } else if (shouldTrigger && lastNotification) {
        console.log(`⏰ Alerta ya activada recientemente para producto ${alert.product} en tienda ${alert.store}`);
      } else {
        console.log(`✅ Stock normal para producto ${alert.product} en tienda ${alert.store} - Stock: ${currentStock}/${alert.threshold}`);
      }
    }

    console.log(`✅ Proceso completado. Se generaron ${generatedNotifications.length} notificaciones`);

    // Mostrar estadísticas
    const stats = await AlertNotification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } }
        }
      }
    ]);

    console.log('\n📈 Estadísticas de notificaciones:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} total, ${stat.unread} no leídas`);
    });

    return generatedNotifications;

  } catch (error) {
    console.error('❌ Error verificando alertas:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  
  // Crear alertas inteligentes
  await createSmartAlerts();
  
  // Verificar alertas y generar notificaciones
  await checkAndGenerateNotifications();
  
  await mongoose.disconnect();
  console.log('\n🔌 Desconectado de MongoDB');
  console.log('\n🎉 Sistema de alertas de inventario configurado y probado exitosamente!');
  console.log('💡 Ahora puedes acceder a la aplicación y configurar alertas desde el panel de gestor de tienda');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createSmartAlerts, checkAndGenerateNotifications };
