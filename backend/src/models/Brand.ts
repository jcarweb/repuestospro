import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  description?: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bus';
  isActive: boolean;
  order: number;
  logo?: string;
  country?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'motorcycle', 'truck', 'bus'],
    default: 'car'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  logo: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
brandSchema.index({ vehicleType: 1, isActive: 1 });
brandSchema.index({ order: 1 });
brandSchema.index({ name: 1 });

export default mongoose.model<IBrand>('Brand', brandSchema); 