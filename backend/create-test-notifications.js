const mongoose = require('mongoose');
const config = require('./src/config/env');

// Conectar a MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Esquema de notificación
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'promotion', 'order', 'delivery', 'system'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['order', 'delivery', 'promotion', 'security', 'system', 'marketing'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  archivedAt: Date,
  data: {
    orderId: String,
    deliveryId: String,
    productId: String,
    promotionId: String,
    url: String,
    actionUrl: String,
    actionText: String,
    imageUrl: String
  },
  delivery: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    pushSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false }
  },
  metadata: {
    source: { type: String, required: true },
    trigger: { type: String, required: true },
    ipAddress: String,
    userAgent: String
  },
  scheduledFor: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Índices
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isArchived: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Esquema de usuario
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ['admin', 'client', 'delivery', 'store_manager'],
    default: 'client'
  }
});

const User = mongoose.model('User', userSchema);

// Notificaciones de prueba
const testNotifications = [
  {
    title: '¡Bienvenido a PiezasYA!',
    message: 'Gracias por registrarte en nuestra plataforma. Disfruta de todos nuestros servicios y productos de calidad.',
    type: 'success',
    category: 'system',
    priority: 'medium',
    data: {
      url: '/profile',
      actionUrl: '/products',
      actionText: 'Explorar Productos'
    },
    metadata: {
      source: 'system',
      trigger: 'user_registration'
    }
  },
  {
    title: 'Promoción Especial - 20% de Descuento',
    message: 'Aprovecha nuestro descuento especial en repuestos de motor. Válido hasta el final del mes.',
    type: 'promotion',
    category: 'promotion',
    priority: 'high',
    data: {
      url: '/promotions',
      actionUrl: '/products?category=motor',
      actionText: 'Ver Ofertas'
    },
    metadata: {
      source: 'marketing',
      trigger: 'promotion_launch'
    }
  },
  {
    title: 'Tu pedido #12345 ha sido confirmado',
    message: 'Tu pedido ha sido confirmado y está siendo procesado. Te notificaremos cuando esté listo para envío.',
    type: 'order',
    category: 'order',
    priority: 'medium',
    data: {
      orderId: '12345',
      url: '/orders/12345',
      actionUrl: '/orders',
      actionText: 'Ver Pedido'
    },
    metadata: {
      source: 'order_system',
      trigger: 'order_confirmed'
    }
  },
  {
    title: 'Tu pedido está en camino',
    message: 'Tu pedido #12345 ha sido enviado y está en camino. El delivery llegará en aproximadamente 30 minutos.',
    type: 'delivery',
    category: 'delivery',
    priority: 'high',
    data: {
      orderId: '12345',
      deliveryId: 'DEL001',
      url: '/orders/12345',
      actionUrl: '/orders/12345/tracking',
      actionText: 'Rastrear Pedido'
    },
    metadata: {
      source: 'delivery_system',
      trigger: 'delivery_started'
    }
  },
  {
    title: 'Actualización de Seguridad',
    message: 'Hemos actualizado nuestras medidas de seguridad. Te recomendamos cambiar tu contraseña regularmente.',
    type: 'warning',
    category: 'security',
    priority: 'medium',
    data: {
      url: '/security',
      actionUrl: '/security/password',
      actionText: 'Cambiar Contraseña'
    },
    metadata: {
      source: 'security_system',
      trigger: 'security_update'
    }
  },
  {
    title: 'Producto Agotado',
    message: 'El producto "Filtro de Aceite Premium" que tenías en tu lista de deseos está agotado temporalmente.',
    type: 'info',
    category: 'system',
    priority: 'low',
    data: {
      productId: 'PROD001',
      url: '/products/PROD001',
      actionUrl: '/favorites',
      actionText: 'Ver Favoritos'
    },
    metadata: {
      source: 'inventory_system',
      trigger: 'product_out_of_stock'
    }
  },
  {
    title: '¡Feliz Cumpleaños!',
    message: '¡Feliz cumpleaños! Como regalo especial, tienes un 15% de descuento en tu próxima compra.',
    type: 'promotion',
    category: 'marketing',
    priority: 'medium',
    data: {
      url: '/promotions',
      actionUrl: '/products',
      actionText: 'Usar Descuento'
    },
    metadata: {
      source: 'marketing',
      trigger: 'birthday_promotion'
    }
  },
  {
    title: 'Mantenimiento Programado',
    message: 'El sistema estará en mantenimiento mañana de 2:00 AM a 4:00 AM. Disculpa las molestias.',
    type: 'warning',
    category: 'system',
    priority: 'medium',
    data: {
      url: '/maintenance',
      actionUrl: '/',
      actionText: 'Entendido'
    },
    metadata: {
      source: 'system',
      trigger: 'maintenance_scheduled'
    }
  },
  {
    title: 'Nuevo Producto Disponible',
    message: 'Hemos agregado nuevos repuestos de frenos de alta calidad. ¡Échales un vistazo!',
    type: 'info',
    category: 'marketing',
    priority: 'low',
    data: {
      url: '/products?category=frenos',
      actionUrl: '/products?category=frenos&new=true',
      actionText: 'Ver Nuevos Productos'
    },
    metadata: {
      source: 'catalog_system',
      trigger: 'new_products_added'
    }
  },
  {
    title: 'Encuesta de Satisfacción',
    message: 'Ayúdanos a mejorar. Completa nuestra encuesta de satisfacción y obtén puntos de fidelización.',
    type: 'info',
    category: 'marketing',
    priority: 'low',
    data: {
      url: '/survey',
      actionUrl: '/survey/complete',
      actionText: 'Completar Encuesta'
    },
    metadata: {
      source: 'feedback_system',
      trigger: 'satisfaction_survey'
    }
  }
];

// Función para crear notificaciones de prueba
async function createTestNotifications() {
  try {
    console.log('🚀 Iniciando creación de notificaciones de prueba...');

    // Obtener usuarios cliente
    const users = await User.find({ role: 'client' }).limit(5);
    
    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios cliente. Creando un usuario de prueba...');
      
      const testUser = new User({
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        role: 'client'
      });
      
      await testUser.save();
      users.push(testUser);
    }

    console.log(`📋 Encontrados ${users.length} usuarios cliente`);

    // Crear notificaciones para cada usuario
    for (const user of users) {
      console.log(`📝 Creando notificaciones para ${user.name} (${user.email})`);
      
      const userNotifications = testNotifications.map((notification, index) => ({
        ...notification,
        userId: user._id,
        isRead: Math.random() > 0.7, // 30% de probabilidad de estar leída
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
        updatedAt: new Date()
      }));

      await Notification.insertMany(userNotifications);
      console.log(`✅ Creadas ${userNotifications.length} notificaciones para ${user.name}`);
    }

    // Mostrar estadísticas
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    
    console.log('\n📊 Estadísticas de notificaciones:');
    console.log(`   Total: ${totalNotifications}`);
    console.log(`   No leídas: ${unreadNotifications}`);
    console.log(`   Leídas: ${totalNotifications - unreadNotifications}`);

    console.log('\n✅ Notificaciones de prueba creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando notificaciones de prueba:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
createTestNotifications();
