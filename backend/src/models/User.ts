import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  googleId?: string;
  role: 'user' | 'admin' | 'store_manager' | 'delivery';
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
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'store_manager', 'delivery'],
    default: 'user'
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
    maxlength: 60 // Aumentado para permitir el hash de bcrypt
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
      default: undefined
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
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Hash PIN antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  
  try {
    if (this.pin) {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para comparar PIN
userSchema.methods.comparePin = async function(candidatePin: string): Promise<boolean> {
  if (!this.pin) return false;
  return bcrypt.compare(candidatePin, this.pin);
};

// Método para verificar si la cuenta está bloqueada
userSchema.methods.isAccountLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Método para incrementar intentos de login
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Si ya está bloqueado y el tiempo de bloqueo ha expirado, resetear
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta después de 5 intentos fallidos por 2 horas
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  await this.updateOne(updates);
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Método para verificar código 2FA
userSchema.methods.verifyTwoFactorCode = function(code: string): boolean {
  if (!this.twoFactorSecret || !this.twoFactorEnabled) return false;
  
  try {
    const speakeasy = require('speakeasy');
    return speakeasy.totp.verify({
      secret: this.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Permitir 2 ventanas de tiempo (60 segundos)
    });
  } catch (error) {
    console.error('Error verificando código 2FA:', error);
    return false;
  }
};

// Método para generar códigos de respaldo
userSchema.methods.generateBackupCodes = function(): string[] {
  try {
    const codes: string[] = [];
    
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.slice(0, 8));
    }
    
    return codes;
  } catch (error) {
    console.error('Error generando códigos de respaldo:', error);
    return [];
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 