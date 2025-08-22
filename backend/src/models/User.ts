import mongoose, { Document, Schema } from 'mongoose';
import * as argon2 from 'argon2';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  googleId?: string;
  avatar?: string; // URL de la imagen de perfil
  role: 'admin' | 'client' | 'delivery' | 'store_manager';
  isEmailVerified: boolean;
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  pin?: string;
  fingerprintData?: string;
  fingerprintEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  backupCodes?: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // Ubicación GPS
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationEnabled: boolean;
  lastLocationUpdate?: Date;
  
  // Sistema de fidelización
  points: number;
  referralCode: string;
  referredBy?: string;
  totalPurchases: number;
  totalSpent: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Configuraciones de notificaciones
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  
  // Configuraciones de preferencias
  theme: 'light' | 'dark';
  language: 'es' | 'en' | 'pt';
  
  // Configuraciones de privacidad
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  
  // Configuraciones de notificaciones push
  pushToken?: string;
  pushEnabled: boolean;
  
  // Campos específicos para Delivery
  deliveryStatus?: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
  autoStatusMode: boolean; // true = automático, false = manual
  currentOrder?: mongoose.Types.ObjectId;
  deliveryZone?: {
    center: [number, number];
    radius: number; // en kilómetros
  };
  vehicleInfo?: {
    type: string;
    model: string;
    plate: string;
  };
  workSchedule?: {
    startTime: string; // formato HH:mm
    endTime: string; // formato HH:mm
    daysOfWeek: number[]; // 0-6 (domingo-sábado)
  };
  
  // Campos específicos para Store Manager
  stores?: mongoose.Types.ObjectId[]; // Referencias a las tiendas que gestiona
  commissionRate?: number; // porcentaje de comisión por venta
  taxRate?: number; // porcentaje de impuestos
  
  // Campos específicos para Admin
  adminPermissions?: {
    userManagement: boolean;
    systemConfiguration: boolean;
    analyticsAccess: boolean;
    codeGeneration: boolean;
    globalSettings: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos
  comparePassword(candidatePassword: string): Promise<boolean>;
  comparePin(candidatePin: string): Promise<boolean>;
  isAccountLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  verifyTwoFactorCode(code: string): boolean;
  generateBackupCodes(): string[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId; // Password no requerido si tiene Google ID
    },
    minlength: 6,
    maxlength: 100 // Aumentado para permitir el hash de argon2
  },
  phone: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: '/uploads/perfil/default-avatar.svg' // Avatar por defecto
  },
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
  lockUntil: {
    type: Date
  },
  pin: {
    type: String,
    minlength: 4,
    maxlength: 100 // Aumentado para permitir el hash de argon2 (más largo)
  },
  fingerprintData: {
    type: String,
    sparse: true
  },
  fingerprintEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false // No incluir en consultas por defecto
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [{
    type: String,
    select: false
  }],
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  
  // Ubicación GPS
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // Coordenadas por defecto en lugar de undefined
    }
  },
  locationEnabled: {
    type: Boolean,
    default: false
  },
  lastLocationUpdate: {
    type: Date
  },
  
  // Sistema de fidelización
  points: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: Schema.Types.ObjectId,
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
  
  // Configuraciones de preferencias
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  language: {
    type: String,
    enum: ['es', 'en', 'pt'],
    default: 'es'
  },
  
  // Configuraciones de privacidad
  profileVisibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showPhone: {
    type: Boolean,
    default: false
  },
  
  // Configuraciones de notificaciones push
  pushToken: {
    type: String
  },
  pushEnabled: {
    type: Boolean,
    default: true
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
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  deliveryZone: {
    center: {
      type: [Number],
      default: undefined
    },
    radius: {
      type: Number,
      default: 10 // 10km por defecto
    }
  },
  vehicleInfo: {
    type: {
      type: String
    },
    model: String,
    plate: String
  },
  workSchedule: {
    startTime: String,
    endTime: String,
    daysOfWeek: [Number]
  },
  
  // Campos específicos para Store Manager
  stores: [{
    type: Schema.Types.ObjectId,
    ref: 'Store'
  }],
  commissionRate: {
    type: Number,
    default: 10 // 10% por defecto
  },
  taxRate: {
    type: Number,
    default: 12 // 12% por defecto
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

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ referralCode: 1 });
userSchema.index({ deliveryStatus: 1 });
userSchema.index({ stores: 1 });

// Métodos de instancia
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Verificar si la contraseña almacenada tiene el formato correcto de Argon2
    if (!this.password || !this.password.startsWith('$argon2')) {
      console.error('Password format error:', this.password);
      return false;
    }
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

userSchema.methods.comparePin = async function(candidatePin: string): Promise<boolean> {
  if (!this.pin) return false;
  try {
    // Verificar si el PIN almacenado tiene el formato correcto de Argon2
    if (!this.pin.startsWith('$argon2')) {
      console.error('PIN format error:', this.pin);
      return false;
    }
    return await argon2.verify(this.pin, candidatePin);
  } catch (error) {
    console.error('Error comparing PIN:', error);
    return false;
  }
};

userSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Si hay un lockUntil y ya expiró, resetear
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta después de 5 intentos fallidos por 2 horas
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

userSchema.methods.verifyTwoFactorCode = function(code: string): boolean {
  if (!this.twoFactorSecret || !this.twoFactorEnabled) {
    return false;
  }

  // Aquí implementarías la verificación con la librería de 2FA
  // Por ahora, una implementación básica
  return code.length === 6 && /^\d+$/.test(code);
};

userSchema.methods.generateBackupCodes = function(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
  }
  return codes;
};

// Middleware pre-save para generar referralCode si no existe
userSchema.pre('save', async function(next) {
  try {
    if (!this.referralCode) {
      let referralCode = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10; // Limitar intentos para evitar bucles infinitos
      
      while (!isUnique && attempts < maxAttempts) {
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingUser = await mongoose.model('User').findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (isUnique) {
        this.referralCode = referralCode;
      } else {
        // Si no se puede generar un código único después de maxAttempts, usar timestamp
        this.referralCode = Date.now().toString(36).toUpperCase();
      }
    }

    // Hash password si ha sido modificado y no está ya hasheado
    if (this.isModified('password') && this.password && !this.password.startsWith('$argon2')) {
      try {
        this.password = await argon2.hash(this.password);
      } catch (error) {
        console.error('Error hashing password:', error);
        // Si hay error en el hash, mantener la contraseña original
      }
    }

    // Hash PIN si ha sido modificado y no está ya hasheado
    if (this.isModified('pin') && this.pin && !this.pin.startsWith('$argon2')) {
      try {
        this.pin = await argon2.hash(this.pin);
      } catch (error) {
        console.error('Error hashing PIN:', error);
        // Si hay error en el hash, mantener el PIN original
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware pre-save:', error);
    next(error);
  }
});



export default mongoose.model<IUser>('User', userSchema); 