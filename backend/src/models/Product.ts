import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[]; // Múltiples imágenes
  category: string; // Cambiado de mongoose.Types.ObjectId a string
  vehicleType?: string; // Tipo de vehículo: automovil, motocicleta, camion, maquinaria_industrial, maquinaria_agricola
  deliveryType?: string; // Tipo de despacho: delivery_motorizado, pickup
  brand?: string;
  subcategory?: string;
  sku: string; // SKU interno del gestor de tienda
  originalPartCode?: string; // Código original de la pieza del manual del vehículo
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, any>;
  popularity?: number;
  store: mongoose.Types.ObjectId; // Tienda a la que pertenece el producto
  createdBy?: mongoose.Types.ObjectId; // Gestor que creó el producto
  updatedBy?: mongoose.Types.ObjectId; // Gestor que actualizó el producto
  deleted?: boolean; // Indica si el producto está en la papelera
  deletedAt?: Date; // Fecha cuando fue movido a la papelera
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    required: true,
    default: []
  },
  category: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    trim: true,
    enum: ['automovil', 'motocicleta', 'camion', 'maquinaria_industrial', 'maquinaria_agricola'],
    default: 'automovil'
  },
  deliveryType: {
    type: String,
    trim: true,
    enum: ['delivery_motorizado', 'pickup'],
    default: 'delivery_motorizado'
  },
  brand: {
    type: String,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  originalPartCode: {
    type: String,
    trim: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ subcategory: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ originalPartCode: 1 });
ProductSchema.index({ popularity: -1 });
ProductSchema.index({ store: 1 }); // Índice para consultas por tienda
ProductSchema.index({ createdBy: 1 });
ProductSchema.index({ updatedBy: 1 });
ProductSchema.index({ deleted: 1 });
ProductSchema.index({ deletedAt: 1 });

// Índice compuesto para SKU único por tienda (solo productos no eliminados)
ProductSchema.index({ sku: 1, store: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: { $ne: true } } });

export default mongoose.model<IProduct>('Product', ProductSchema); 