import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryWallet extends Document {
  _id: string;
  deliveryId: string; // Referencia al delivery
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryWalletSchema = new Schema<IDeliveryWallet>({
  deliveryId: { type: String, required: true, unique: true },
  currentBalance: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0, min: 0 },
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  pendingWithdrawal: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'delivery_wallets'
});

// Índices
DeliveryWalletSchema.index({ deliveryId: 1 });
DeliveryWalletSchema.index({ isActive: 1 });

export default mongoose.model<IDeliveryWallet>('DeliveryWallet', DeliveryWalletSchema);
