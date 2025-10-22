import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletSettings extends Document {
  storeId: mongoose.Types.ObjectId;
  commissionRate: number; // Porcentaje de comisión por defecto
  minimumRechargeAmount: number; // Monto mínimo de recarga
  maximumRechargeAmount: number; // Monto máximo de recarga
  lowBalanceThreshold: number; // Umbral para notificación de saldo bajo
  criticalBalanceThreshold: number; // Umbral crítico para bloquear pagos en efectivo
  autoRechargeEnabled: boolean; // Recarga automática habilitada
  autoRechargeAmount: number; // Monto de recarga automática
  autoRechargeThreshold: number; // Umbral para activar recarga automática
  notificationsEnabled: boolean; // Notificaciones habilitadas
  emailNotifications: boolean; // Notificaciones por email
  smsNotifications: boolean; // Notificaciones por SMS
  pushNotifications: boolean; // Notificaciones push
  createdAt: Date;
  updatedAt: Date;
}

const WalletSettingsSchema = new Schema<IWalletSettings>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 5.0, // 5% por defecto
    min: 0,
    max: 100
  },
  minimumRechargeAmount: {
    type: Number,
    required: true,
    default: 10.0, // $10 USD mínimo
    min: 0
  },
  maximumRechargeAmount: {
    type: Number,
    required: true,
    default: 10000.0, // $10,000 USD máximo
    min: 0
  },
  lowBalanceThreshold: {
    type: Number,
    required: true,
    default: 50.0, // $50 USD
    min: 0
  },
  criticalBalanceThreshold: {
    type: Number,
    required: true,
    default: 0.0, // $0 USD
    min: 0
  },
  autoRechargeEnabled: {
    type: Boolean,
    default: false
  },
  autoRechargeAmount: {
    type: Number,
    default: 100.0, // $100 USD
    min: 0
  },
  autoRechargeThreshold: {
    type: Number,
    default: 20.0, // $20 USD
    min: 0
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
WalletSettingsSchema.index({ storeId: 1 });

export default mongoose.model<IWalletSettings>('WalletSettings', WalletSettingsSchema);
