import mongoose, { Document, Schema } from 'mongoose';

export interface ISubcategory extends Document {
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const SubcategorySchema = new Schema<ISubcategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar subcategorías duplicadas por categoría
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);