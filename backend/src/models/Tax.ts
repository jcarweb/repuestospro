import mongoose, { Document, Schema } from 'mongoose';

export interface ITax extends Document {
  name: string;
  description: string;
  type: 'IVA' | 'ISLR' | 'custom';
  rate: number;
  isPercentage: boolean;
  appliesTo: 'products' | 'services' | 'all';
  country: string;
  state?: string;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taxSchema = new Schema<ITax>({
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
    enum: ['IVA', 'ISLR', 'custom'],
    default: 'IVA'
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  isPercentage: {
    type: Boolean,
    default: true
  },
  appliesTo: {
    type: String,
    required: true,
    enum: ['products', 'services', 'all'],
    default: 'products'
  },
  country: {
    type: String,
    required: true,
    default: 'Venezuela'
  },
  state: {
    type: String,
    trim: true
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
taxSchema.index({ type: 1, isActive: 1 });
taxSchema.index({ country: 1, state: 1 });
taxSchema.index({ effectiveDate: -1 });

export default mongoose.model<ITax>('Tax', taxSchema);
