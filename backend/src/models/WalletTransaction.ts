import mongoose, { Document, Schema } from 'mongoose';

export interface IWalletTransaction extends Document {
  _id: string;
  storeId: string;
  walletId: string;
  rechargeRequestId?: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  amount: number;
  currency: 'USD' | 'VES';
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  balanceBefore: number;
  balanceAfter: number;
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
  metadata?: {
    paymentMethod?: string;
    transactionId?: string;
    fees?: number;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  storeId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Store',
    required: true,
    index: true
  },
  walletId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Wallet',
    required: true,
    index: true
  },
  rechargeRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'RechargeRequest',
    sparse: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'payment', 'refund', 'commission'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'VES'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  originalCurrency: {
    type: String,
    enum: ['USD', 'EUR', 'VES']
  },
  metadata: {
    paymentMethod: String,
    transactionId: String,
    fees: Number,
    notes: String
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
WalletTransactionSchema.index({ storeId: 1, type: 1, createdAt: -1 });
WalletTransactionSchema.index({ walletId: 1, status: 1 });
WalletTransactionSchema.index({ createdAt: -1 });

export default mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);