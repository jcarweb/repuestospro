import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bus';
  isActive: boolean;
  order: number;
  icon?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema = new Schema<ISubcategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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
  icon: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
subcategorySchema.index({ categoryId: 1, vehicleType: 1, isActive: 1 });
subcategorySchema.index({ order: 1 });

export default mongoose.model<ISubcategory>('Subcategory', subcategorySchema); 