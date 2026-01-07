import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  _id: string;
  storeId: string;
  balance: number;
  currency: 'USD' | 'VES';
  isActive: boolean;
  cashPaymentEnabled: boolean;
  lastTransactionAt?: Date;
  settings: {
    commissionRate: number;
    minimumRechargeAmount: number;
    maximumRechargeAmount: number;
    lowBalanceThreshold: number;
    criticalBalanceThreshold: number;
    autoRechargeEnabled: boolean;
    autoRechargeAmount: number;
    autoRechargeThreshold: number;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  storeId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Store',
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'VES'],
    default: 'USD',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cashPaymentEnabled: {
    type: Boolean,
    default: true
  },
  lastTransactionAt: {
    type: Date
  },
  settings: {
    commissionRate: {
      type: Number,
      default: 0.05,
      min: 0,
      max: 1
    },
    minimumRechargeAmount: {
      type: Number,
      default: 10,
      min: 0
    },
    maximumRechargeAmount: {
      type: Number,
      default: 10000,
      min: 0
    },
    lowBalanceThreshold: {
      type: Number,
      default: 50,
      min: 0
    },
    criticalBalanceThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    autoRechargeEnabled: {
      type: Boolean,
      default: false
    },
    autoRechargeAmount: {
      type: Number,
      default: 100,
      min: 0
    },
    autoRechargeThreshold: {
      type: Number,
      default: 25,
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
  }
}, {
  timestamps: true
});

// Índices
WalletSchema.index({ storeId: 1 });
WalletSchema.index({ isActive: 1 });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
