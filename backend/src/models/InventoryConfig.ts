import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryConfig extends Document {
  store: mongoose.Types.ObjectId; // Referencia a la tienda
  inventoryType: 'global' | 'separate' | 'hybrid'; // Tipo de inventario
  parentStore?: mongoose.Types.ObjectId; // Tienda padre (para sucursales con inventario global)
  childStores: mongoose.Types.ObjectId[]; // Sucursales hijas (para tienda principal)
  allowLocalStock: boolean; // Permitir stock local en sucursales
  autoDistribute: boolean; // Distribución automática de stock
  distributionRules: {
    minStock: number; // Stock mínimo por sucursal
    maxStock: number; // Stock máximo por sucursal
    distributionMethod: 'equal' | 'proportional' | 'manual'; // Método de distribución
  };
  createdAt: Date;
  updatedAt: Date;
}

const InventoryConfigSchema = new Schema<IInventoryConfig>({
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  inventoryType: {
    type: String,
    enum: ['global', 'separate', 'hybrid'],
    required: true,
    default: 'separate'
  },
  parentStore: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  childStores: [{
    type: Schema.Types.ObjectId,
    ref: 'Store'
  }],
  allowLocalStock: {
    type: Boolean,
    default: false
  },
  autoDistribute: {
    type: Boolean,
    default: false
  },
  distributionRules: {
    minStock: {
      type: Number,
      default: 0
    },
    maxStock: {
      type: Number,
      default: 1000
    },
    distributionMethod: {
      type: String,
      enum: ['equal', 'proportional', 'manual'],
      default: 'equal'
    }
  }
}, {
  timestamps: true
});

// Índices
// store ya tiene índice único automático por unique: true
InventoryConfigSchema.index({ parentStore: 1 });
InventoryConfigSchema.index({ childStores: 1 });
InventoryConfigSchema.index({ inventoryType: 1 });

export default mongoose.model<IInventoryConfig>('InventoryConfig', InventoryConfigSchema);
