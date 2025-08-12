import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  image?: string;
  parentCategory?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ order: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema); 