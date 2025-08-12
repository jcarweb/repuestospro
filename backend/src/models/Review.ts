import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  category: 'product' | 'service' | 'delivery' | 'app';
  pointsEarned: number;
  isVerified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: function(this: IReview) {
      return this.category === 'product';
    }
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: function(this: IReview) {
      return this.category === 'service' || this.category === 'delivery';
    }
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['product', 'service', 'delivery', 'app']
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, rating: -1 });
reviewSchema.index({ category: 1, rating: -1 });
reviewSchema.index({ isVerified: 1 });

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review; 