import mongoose, { Document, Schema } from 'mongoose';

export interface ICommission extends Document {
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'tiered';
  baseRate: number;
  minAmount?: number;
  maxAmount?: number;
  tiers?: Array<{
    minSales: number;
    maxSales?: number;
    rate: number;
  }>;
  storeType: 'new' | 'growing' | 'established' | 'premium';
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commissionSchema = new Schema<ICommission>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'tiered'],
    default: 'percentage'
  },
  baseRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  minAmount: {
    type: Number,
    min: 0
  },
  maxAmount: {
    type: Number,
    min: 0
  },
  tiers: [{
    minSales: {
      type: Number,
      required: true,
      min: 0
    },
    maxSales: {
      type: Number,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  storeType: {
    type: String,
    required: true,
    enum: ['new', 'growing', 'established', 'premium'],
    default: 'new'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
commissionSchema.index({ storeType: 1, isActive: 1 });
commissionSchema.index({ effectiveDate: -1 });

export default mongoose.model<ICommission>('Commission', commissionSchema);
