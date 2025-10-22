import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreWallet extends Document {
  storeId: mongoose.Types.ObjectId;
  balance: number; // Saldo en USD
  currency: string; // Siempre USD
  isActive: boolean;
  cashPaymentEnabled: boolean; // Controla si se puede cobrar en efectivo
  minimumBalance: number; // Saldo mínimo requerido
  lastTransactionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instancia
  canProcessCashPayment(): boolean;
  hasSufficientBalance(amount: number): boolean;
  getBalanceStatus(): 'sufficient' | 'low' | 'insufficient';
}

const StoreWalletSchema = new Schema<IStoreWallet>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cashPaymentEnabled: {
    type: Boolean,
    default: true
  },
  minimumBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransactionAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
StoreWalletSchema.index({ storeId: 1 });
StoreWalletSchema.index({ balance: 1 });
StoreWalletSchema.index({ cashPaymentEnabled: 1 });
StoreWalletSchema.index({ isActive: 1 });

// Métodos de instancia
StoreWalletSchema.methods['canProcessCashPayment'] = function(): boolean {
  return this['isActive'] && this['cashPaymentEnabled'] && this['balance'] > 0;
};

StoreWalletSchema.methods['hasSufficientBalance'] = function(amount: number): boolean {
  return this['balance'] >= amount;
};

StoreWalletSchema.methods['getBalanceStatus'] = function(): 'sufficient' | 'low' | 'insufficient' {
  if (this['balance'] <= 0) return 'insufficient';
  if (this['balance'] <= this['minimumBalance']) return 'low';
  return 'sufficient';
};

// Middleware pre-save para actualizar lastTransactionAt
StoreWalletSchema.pre('save', function(next) {
  if (this.isModified('balance')) {
    this.lastTransactionAt = new Date();
  }
  next();
});

export default mongoose.model<IStoreWallet>('StoreWallet', StoreWalletSchema);
