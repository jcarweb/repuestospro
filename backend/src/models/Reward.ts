import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  name: string;
  description: string;
  image?: string;
  pointsRequired: number;
  cashRequired: number;
  category: 'tools' | 'electronics' | 'accessories' | 'gift_cards' | 'discounts';
  stock: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rewardSchema = new Schema<IReward>({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 0
  },
  cashRequired: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['tools', 'electronics', 'accessories', 'gift_cards', 'discounts']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
rewardSchema.index({ isActive: 1, category: 1 });
rewardSchema.index({ pointsRequired: 1 });
rewardSchema.index({ startDate: 1, endDate: 1 });

const Reward = mongoose.model<IReward>('Reward', rewardSchema);

export default Reward; 