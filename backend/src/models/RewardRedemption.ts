import mongoose, { Document, Schema } from 'mongoose';

export interface IRewardRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  pointsSpent: number;
  cashSpent: number;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rewardRedemptionSchema = new Schema<IRewardRedemption>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardId: {
    type: Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  pointsSpent: {
    type: Number,
    required: true,
    min: 0
  },
  cashSpent: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
rewardRedemptionSchema.index({ userId: 1, createdAt: -1 });
rewardRedemptionSchema.index({ status: 1 });
rewardRedemptionSchema.index({ rewardId: 1 });

const RewardRedemption = mongoose.model<IRewardRedemption>('RewardRedemption', rewardRedemptionSchema);

export default RewardRedemption; 