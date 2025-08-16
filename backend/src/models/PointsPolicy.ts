import mongoose, { Document, Schema } from 'mongoose';

export interface IPointsPolicy extends Document {
  action: string;
  points: number;
  description: string;
  isActive: boolean;
  conditions?: {
    minAmount?: number;
    maxAmount?: number;
    category?: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pointsPolicySchema = new Schema<IPointsPolicy>({
  action: {
    type: String,
    required: true,
    enum: ['purchase', 'review', 'referral', 'share', 'redemption', 'login', 'birthday', 'anniversary']
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: {
    minAmount: {
      type: Number,
      min: 0
    },
    maxAmount: {
      type: Number,
      min: 0
    },
    category: {
      type: String
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once'
    }
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
pointsPolicySchema.index({ action: 1, isActive: 1 });
pointsPolicySchema.index({ isActive: 1 });

const PointsPolicy = mongoose.model<IPointsPolicy>('PointsPolicy', pointsPolicySchema);

export default PointsPolicy;
