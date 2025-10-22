import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId; // Referencia a la orden si aplica
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  status: WalletTransactionStatus;
  description: string;
  reference?: string; // Referencia externa (transferencia, pago, etc.)
  metadata?: {
    paymentMethod?: string;
    paymentProvider?: string;
    transactionId?: string;
    commissionRate?: number;
    orderNumber?: string;
    [key: string]: any;
  };
  processedBy?: mongoose.Types.ObjectId; // Usuario que procesó la transacción
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WalletTransactionType = 
  | 'recharge'           // Recarga de saldo
  | 'commission_deduction' // Descuento de comisión
  | 'manual_adjustment'  // Ajuste manual
  | 'refund'             // Reembolso
  | 'withdrawal'         // Retiro
  | 'bonus'              // Bono
  | 'penalty'            // Penalización
  | 'system_adjustment'; // Ajuste del sistema

export type WalletTransactionStatus = 
  | 'pending'    // Pendiente
  | 'confirmed'  // Confirmado
  | 'failed'     // Fallido
  | 'cancelled'  // Cancelado
  | 'reversed';  // Revertido

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  walletId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreWallet',
    required: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'recharge',
      'commission_deduction',
      'manual_adjustment',
      'refund',
      'withdrawal',
      'bonus',
      'penalty',
      'system_adjustment'
    ]
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ storeId: 1, createdAt: -1 });
WalletTransactionSchema.index({ orderId: 1 });
WalletTransactionSchema.index({ type: 1, status: 1 });
WalletTransactionSchema.index({ status: 1, createdAt: -1 });
WalletTransactionSchema.index({ reference: 1 });

// Middleware pre-save para actualizar processedAt
WalletTransactionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'confirmed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

export default mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
