import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryAlert extends Document {
  store: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  alertType: 'low_stock' | 'out_of_stock' | 'custom';
  threshold: number; // Cantidad mínima para activar la alerta
  isActive: boolean;
  lastTriggered?: Date;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    sms?: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryAlertSchema = new Schema<IInventoryAlert>({
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
  alertType: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'custom'],
    required: true
  },
  threshold: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: {
    type: Date
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar alertas duplicadas
inventoryAlertSchema.index({ store: 1, product: 1, alertType: 1 }, { unique: true });

// Índice para consultas eficientes
inventoryAlertSchema.index({ store: 1, isActive: 1 });
inventoryAlertSchema.index({ lastTriggered: 1 });

export default mongoose.model<IInventoryAlert>('InventoryAlert', inventoryAlertSchema);
