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

const InventoryAlert = mongoose.model('InventoryAlert', inventoryAlertSchema);
const AlertNotification = mongoose.model('AlertNotification', alertNotificationSchema);
const ProductInventory = mongoose.model('ProductInventory', productInventorySchema);

// Función para verificar y generar alertas
const checkAndGenerateAlerts = async () => {
  try {
    console.log('🔍 Verificando alertas de inventario...');
    
    // Obtener todas las alertas activas
    const alerts = await InventoryAlert.find({
      isActive: true
    }).populate('product', 'name sku').populate('store', 'name');

    console.log(`📊 Encontradas ${alerts.length} alertas activas`);

    const generatedNotifications = [];

    for (const alert of alerts) {
      // Obtener el inventario actual del producto
      const inventory = await ProductInventory.findOne({
        product: alert.product._id,
        store: alert.store._id
      });

      if (!inventory) {
        console.log(`⚠️  No se encontró inventario para ${alert.product.name} en ${alert.store.name}`);
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
        // Generar notificación
        const notification = new AlertNotification({
          user: alert.createdBy,
          store: alert.store._id,
          product: alert.product._id,
          alert: alert._id,
          type: alert.alertType,
          title: `Alerta de Stock - ${alert.product.name}`,
          message: `El producto ${alert.product.name} (${alert.product.sku}) tiene ${currentStock} unidades disponibles. Umbral: ${alert.threshold}`,
          currentStock,
          threshold: alert.threshold,
          isSent: false
        });

        await notification.save();
        generatedNotifications.push(notification);

        // Actualizar última vez que se activó la alerta
        alert.lastTriggered = new Date();
        await alert.save();

        console.log(`🔔 Generada notificación para ${alert.product.name} en ${alert.store.name} - Stock: ${currentStock}/${alert.threshold}`);
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

  } catch (error) {
    console.error('❌ Error verificando alertas:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await checkAndGenerateAlerts();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkAndGenerateAlerts, InventoryAlert, AlertNotification, ProductInventory };
