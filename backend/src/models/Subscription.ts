import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  description: string;
  type: 'basic' | 'pro' | 'elite';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxProducts?: number;
  maxStores?: number;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  advertisingAccess: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
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
    enum: ['basic', 'pro', 'elite'],
    default: 'basic'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'VES', 'EUR'],
    default: 'USD'
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: [{
    type: String,
    trim: true
  }],
  maxProducts: {
    type: Number,
    min: 0
  },
  maxStores: {
    type: Number,
    min: 0
  },
  prioritySupport: {
    type: Boolean,
    default: false
  },
  advancedAnalytics: {
    type: Boolean,
    default: false
  },
  advertisingAccess: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
subscriptionSchema.index({ type: 1, isActive: 1 });
subscriptionSchema.index({ price: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
