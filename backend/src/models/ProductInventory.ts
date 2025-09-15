import mongoose, { Schema, Document } from 'mongoose';

export interface IProductInventory extends Document {
  product: mongoose.Types.ObjectId; // Referencia al producto
  store: mongoose.Types.ObjectId; // Referencia a la tienda
  inventoryType: 'global' | 'separate' | 'hybrid'; // Tipo de inventario
  parentStore?: mongoose.Types.ObjectId; // Tienda padre (para inventario global)
  
  // Stock principal (tienda principal o sucursal individual)
  mainStock: {
    quantity: number;
    reserved: number; // Cantidad reservada en pedidos
    available: number; // Cantidad disponible (quantity - reserved)
    minStock: number; // Stock mínimo
    maxStock: number; // Stock máximo
  };
  
  // Stock local (solo para sucursales con inventario híbrido)
  localStock?: {
    quantity: number;
    reserved: number;
    available: number;
    minStock: number;
    maxStock: number;
  };
  
  // Stock asignado (para sucursales con inventario global)
  assignedStock?: {
    quantity: number;
    reserved: number;
    available: number;
  };
  
  // Información de trazabilidad
  lastUpdated: Date;
  lastUpdatedBy: mongoose.Types.ObjectId; // Usuario que actualizó
  updateHistory: Array<{
    date: Date;
    user: mongoose.Types.ObjectId;
    type: 'stock_in' | 'stock_out' | 'reservation' | 'adjustment' | 'distribution';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    reference?: string; // Referencia a pedido, transferencia, etc.
  }>;
  
  // Configuración de alertas
  alerts: {
    lowStock: boolean;
    outOfStock: boolean;
    overStock: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ProductInventorySchema = new Schema<IProductInventory>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  inventoryType: {
    type: String,
    enum: ['global', 'separate', 'hybrid'],
    required: true
  },
  parentStore: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  
  // Stock principal
  mainStock: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0
    },
    maxStock: {
      type: Number,
      default: 1000,
      min: 0
    }
  },
  
  // Stock local (opcional)
  localStock: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0,
      min: 0
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0
    },
    maxStock: {
      type: Number,
      default: 1000,
      min: 0
    }
  },
  
  // Stock asignado (opcional)
  assignedStock: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Información de trazabilidad
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updateHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'reservation', 'adjustment', 'distribution'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: {
      type: Number,
      required: true
    },
    newQuantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    reference: {
      type: String
    }
  }],
  
  // Alertas
  alerts: {
    lowStock: {
      type: Boolean,
      default: false
    },
    outOfStock: {
      type: Boolean,
      default: false
    },
    overStock: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
ProductInventorySchema.index({ product: 1, store: 1 }, { unique: true });
ProductInventorySchema.index({ store: 1, inventoryType: 1 });
ProductInventorySchema.index({ parentStore: 1 });
ProductInventorySchema.index({ 'mainStock.available': 1 });
ProductInventorySchema.index({ 'alerts.lowStock': 1 });
ProductInventorySchema.index({ 'alerts.outOfStock': 1 });

// Middleware para calcular stock disponible automáticamente
ProductInventorySchema.pre('save', function(next) {
  // Calcular stock disponible principal
  this.mainStock.available = Math.max(0, this.mainStock.quantity - this.mainStock.reserved);
  
  // Calcular stock disponible local si existe
  if (this.localStock) {
    this.localStock.available = Math.max(0, this.localStock.quantity - this.localStock.reserved);
  }
  
  // Calcular stock disponible asignado si existe
  if (this.assignedStock) {
    this.assignedStock.available = Math.max(0, this.assignedStock.quantity - this.assignedStock.reserved);
  }
  
  // Actualizar alertas
  this.alerts.lowStock = this.mainStock.available <= this.mainStock.minStock;
  this.alerts.outOfStock = this.mainStock.available === 0;
  this.alerts.overStock = this.mainStock.available > this.mainStock.maxStock;
  
  next();
});

export default mongoose.model<IProductInventory>('ProductInventory', ProductInventorySchema);
