import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransfer extends Document {
  transferId: string; // ID único de la transferencia
  fromStore: mongoose.Types.ObjectId; // Tienda origen
  toStore: mongoose.Types.ObjectId; // Tienda destino
  transferType: 'distribution' | 'manual' | 'automatic' | 'adjustment';
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'rejected';
  
  // Productos transferidos
  items: Array<{
    product: mongoose.Types.ObjectId;
    productName: string;
    requestedQuantity: number;
    transferredQuantity: number;
    unitPrice: number;
    totalValue: number;
    notes?: string;
  }>;
  
  // Información de la transferencia
  totalItems: number;
  totalValue: number;
  transferDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // Información de trazabilidad
  requestedBy: mongoose.Types.ObjectId; // Usuario que solicitó
  approvedBy?: mongoose.Types.ObjectId; // Usuario que aprobó
  shippedBy?: mongoose.Types.ObjectId; // Usuario que envió
  receivedBy?: mongoose.Types.ObjectId; // Usuario que recibió
  
  // Notas y comentarios
  notes: string;
  rejectionReason?: string;
  
  // Estado de la transferencia
  isUrgent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  createdAt: Date;
  updatedAt: Date;
}

const InventoryTransferSchema = new Schema<IInventoryTransfer>({
  transferId: {
    type: String,
    required: true,
    unique: true
  },
  fromStore: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  toStore: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  transferType: {
    type: String,
    enum: ['distribution', 'manual', 'automatic', 'adjustment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Productos transferidos
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    transferredQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String
    }
  }],
  
  // Información de la transferencia
  totalItems: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  
  // Información de trazabilidad
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  shippedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notas y comentarios
  notes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String
  },
  
  // Estado de la transferencia
  isUrgent: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Índices
// transferId ya tiene índice único automático por unique: true
InventoryTransferSchema.index({ fromStore: 1, status: 1 });
InventoryTransferSchema.index({ toStore: 1, status: 1 });
InventoryTransferSchema.index({ status: 1 });
InventoryTransferSchema.index({ transferDate: 1 });
InventoryTransferSchema.index({ requestedBy: 1 });
InventoryTransferSchema.index({ priority: 1, isUrgent: 1 });

// Middleware para generar ID único de transferencia
InventoryTransferSchema.pre('save', function(next) {
  if (!this.transferId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.transferId = `TRF-${timestamp}-${random}`;
  }
  
  // Calcular totales
  this.totalItems = this.items.length;
  this.totalValue = this.items.reduce((sum, item) => sum + item.totalValue, 0);
  
  next();
});

export default mongoose.model<IInventoryTransfer>('InventoryTransfer', InventoryTransferSchema);
