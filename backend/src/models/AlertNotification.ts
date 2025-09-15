import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertNotification extends Document {
  user: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  alert: mongoose.Types.ObjectId;
  type: 'low_stock' | 'out_of_stock' | 'custom';
  title: string;
  message: string;
  currentStock: number;
  threshold: number;
  isRead: boolean;
  isSent: boolean;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

const alertNotificationSchema = new Schema<IAlertNotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  alert: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryAlert',
    required: true
  },
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
alertNotificationSchema.index({ user: 1, isRead: 1 });
alertNotificationSchema.index({ store: 1, type: 1 });
alertNotificationSchema.index({ createdAt: -1 });

export default mongoose.model<IAlertNotification>('AlertNotification', alertNotificationSchema);
