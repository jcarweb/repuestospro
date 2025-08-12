const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario actualizado
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  googleId: String,
  role: {
    type: String,
    enum: ['admin', 'client', 'delivery', 'store_manager'],
    default: 'client'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  pin: String,
  fingerprintData: String,
  fingerprintEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Ubicación GPS
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  locationEnabled: {
    type: Boolean,
    default: false
  },
  lastLocationUpdate: Date,
  
  // Sistema de fidelización
  points: {
    type: Number,
    default: 0
  },
  referralCode: String,
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  loyaltyLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  // Configuraciones de notificaciones
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  marketingEmails: {
    type: Boolean,
    default: false
  },
  
  // Campos específicos para Delivery
  deliveryStatus: {
    type: String,
    enum: ['available', 'unavailable', 'busy', 'on_route', 'returning_to_store'],
    default: 'unavailable'
  },
  autoStatusMode: {
    type: Boolean,
    default: true
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  deliveryZone: {
    center: [Number],
    radius: {
      type: Number,
      default: 10
    }
  },
  vehicleInfo: {
    type: String,
    model: String,
    plate: String
  },
  workSchedule: {
    startTime: String,
    endTime: String,
    daysOfWeek: [Number]
  },
  
  // Campos específicos para Store Manager
  storeInfo: {
    name: String,
    address: String,
    phone: String,
    email: String,
    description: String,
    logo: String,
    banner: String,
    businessHours: {
      type: Map,
      of: {
        open: String,
        close: String,
        closed: Boolean
      }
    },
    deliverySettings: {
      enabled: {
        type: Boolean,
        default: true
      },
      freeDeliveryThreshold: {
        type: Number,
        default: 50
      },
      deliveryFee: {
        type: Number,
        default: 5
      },
      maxDeliveryDistance: {
        type: Number,
        default: 20
      }
    },
    paymentSettings: {
      cash: {
        type: Boolean,
        default: true
      },
      card: {
        type: Boolean,
        default: true
      },
      transfer: {
        type: Boolean,
        default: false
      },
      digitalWallet: {
        type: Boolean,
        default: false
      }
    }
  },
  commissionRate: {
    type: Number,
    default: 10
  },
  taxRate: {
    type: Number,
    default: 12
  },
  
  // Campos específicos para Admin
  adminPermissions: {
    userManagement: {
      type: Boolean,
      default: true
    },
    systemConfiguration: {
      type: Boolean,
      default: true
    },
    analyticsAccess: {
      type: Boolean,
      default: true
    },
    codeGeneration: {
      type: Boolean,
      default: true
    },
    globalSettings: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function updateUserRoles() {
  try {
    console.log('🔄 Iniciando actualización de roles de usuario...');

    // Actualizar usuarios con rol 'user' a 'client'
    const userUpdateResult = await User.updateMany(
      { role: 'user' },
      { 
        $set: { 
          role: 'client',
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          points: 0,
          totalPurchases: 0,
          totalSpent: 0,
          loyaltyLevel: 'bronze'
        }
      }
    );

    console.log(`✅ ${userUpdateResult.modifiedCount} usuarios con rol 'user' actualizados a 'client'`);

    // Actualizar usuarios con rol 'admin' para incluir permisos de administrador
    const adminUpdateResult = await User.updateMany(
      { role: 'admin' },
      { 
        $set: { 
          adminPermissions: {
            userManagement: true,
            systemConfiguration: true,
            analyticsAccess: true,
            codeGeneration: true,
            globalSettings: true
          },
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        }
      }
    );

    console.log(`✅ ${adminUpdateResult.modifiedCount} usuarios administradores actualizados con permisos`);

    // Actualizar usuarios con rol 'store_manager' para incluir configuraciones de tienda
    const storeManagerUpdateResult = await User.updateMany(
      { role: 'store_manager' },
      { 
        $set: { 
          storeInfo: {
            deliverySettings: {
              enabled: true,
              freeDeliveryThreshold: 50,
              deliveryFee: 5,
              maxDeliveryDistance: 20
            },
            paymentSettings: {
              cash: true,
              card: true,
              transfer: false,
              digitalWallet: false
            }
          },
          commissionRate: 10,
          taxRate: 12,
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        }
      }
    );

    console.log(`✅ ${storeManagerUpdateResult.modifiedCount} gestores de tienda actualizados con configuraciones`);

    // Actualizar usuarios con rol 'delivery' para incluir configuraciones de delivery
    const deliveryUpdateResult = await User.updateMany(
      { role: 'delivery' },
      { 
        $set: { 
          deliveryStatus: 'unavailable',
          autoStatusMode: true,
          deliveryZone: {
            radius: 10
          },
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        }
      }
    );

    console.log(`✅ ${deliveryUpdateResult.modifiedCount} usuarios de delivery actualizados con configuraciones`);

    // Generar códigos de referido para usuarios que no los tengan
    const usersWithoutReferralCode = await User.find({ referralCode: { $exists: false } });
    
    for (const user of usersWithoutReferralCode) {
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await User.updateOne(
        { _id: user._id },
        { $set: { referralCode } }
      );
    }

    console.log(`✅ ${usersWithoutReferralCode.length} códigos de referido generados`);

    // Mostrar estadísticas finales
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Estadísticas de usuarios por rol:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} usuarios`);
    });

    console.log('\n✅ Actualización de roles completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Ejecutar la actualización
updateUserRoles();
