import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletNotification extends Document {
  storeId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  type: WalletNotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  channels: ('email' | 'sms' | 'push')[];
  metadata?: {
    balance?: number;
    threshold?: number;
    transactionId?: string;
    orderId?: string;
    [key: string]: any;
  };
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WalletNotificationType = 
  | 'low_balance'           // Saldo bajo
  | 'insufficient_balance'  // Saldo insuficiente
  | 'cash_payment_blocked'   // Pago en efectivo bloqueado
  | 'cash_payment_enabled'  // Pago en efectivo habilitado
  | 'recharge_successful'   // Recarga exitosa
  | 'recharge_failed'       // Recarga fallida
  | 'commission_deducted'    // Comisión descontada
  | 'transaction_failed'    // Transacción fallida
  | 'wallet_created'        // Wallet creada
  | 'wallet_deactivated'    // Wallet desactivada
  | 'settings_updated';      // Configuración actualizada

const WalletNotificationSchema = new Schema<IWalletNotification>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  walletId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreWallet',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'low_balance',
      'insufficient_balance',
      'cash_payment_blocked',
      'cash_payment_enabled',
      'recharge_successful',
      'recharge_failed',
      'commission_deducted',
      'transaction_failed',
      'wallet_created',
      'wallet_deactivated',
      'settings_updated'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push']
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
WalletNotificationSchema.index({ storeId: 1, createdAt: -1 });
WalletNotificationSchema.index({ walletId: 1, status: 1 });
WalletNotificationSchema.index({ type: 1, priority: 1 });
WalletNotificationSchema.index({ status: 1, createdAt: -1 });

// Middleware pre-save para actualizar sentAt
WalletNotificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  next();
});

export default mongoose.model<IWalletNotification>('WalletNotification', WalletNotificationSchema);
