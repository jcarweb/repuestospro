import mongoose, { Document, Schema } from 'mongoose';

export interface IWarranty extends Document {
  type: 'purchase_protection' | 'return_guarantee' | 'claim_protection';
  status: 'active' | 'pending' | 'resolved' | 'expired' | 'cancelled';
  userId: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  
  // Cobertura y términos
  coverageAmount: number;
  coveragePercentage: number;
  maxCoverageAmount: number;
  
  // Fechas
  activationDate: Date;
  expirationDate: Date;
  lastRenewalDate?: Date;
  
  // Términos específicos
  terms: {
    coversDefectiveProducts: boolean;
    coversNonDelivery: boolean;
    coversNotAsDescribed: boolean;
    coversLateDelivery: boolean;
    returnWindowDays: number;
    claimWindowDays: number;
  };
  
  // Costo y facturación
  cost: number;
  isIncluded: boolean; // Si viene incluida en el precio
  billingCycle?: 'one_time' | 'monthly' | 'yearly';
  
  // Metadatos
  description: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantySchema = new Schema<IWarranty>({
  type: { 
    type: String, 
    required: true, 
    enum: ['purchase_protection', 'return_guarantee', 'claim_protection'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'pending', 'resolved', 'expired', 'cancelled'],
    default: 'pending'
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  
  // Cobertura y términos
  coverageAmount: { type: Number, required: true, min: 0 },
  coveragePercentage: { type: Number, required: true, min: 0, max: 100 },
  maxCoverageAmount: { type: Number, required: true, min: 0 },
  
  // Fechas
  activationDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  lastRenewalDate: { type: Date },
  
  // Términos específicos
  terms: {
    coversDefectiveProducts: { type: Boolean, default: true },
    coversNonDelivery: { type: Boolean, default: true },
    coversNotAsDescribed: { type: Boolean, default: true },
    coversLateDelivery: { type: Boolean, default: false },
    returnWindowDays: { type: Number, default: 30 },
    claimWindowDays: { type: Number, default: 90 }
  },
  
  // Costo y facturación
  cost: { type: Number, required: true, min: 0 },
  isIncluded: { type: Boolean, default: false },
  billingCycle: { 
    type: String, 
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  
  // Metadatos
  description: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Índices para optimizar consultas
WarrantySchema.index({ userId: 1, status: 1 });
WarrantySchema.index({ transactionId: 1 });
WarrantySchema.index({ storeId: 1, status: 1 });
WarrantySchema.index({ expirationDate: 1, status: 1 });
WarrantySchema.index({ type: 1, status: 1 });

// Método para verificar si la garantía está activa
WarrantySchema.methods.isActive = function(): boolean {
  return this.status === 'active' && new Date() <= this.expirationDate;
};

// Método para calcular días restantes
WarrantySchema.methods.getDaysRemaining = function(): number {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const diffTime = this.expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para calcular cobertura disponible
WarrantySchema.methods.getAvailableCoverage = function(): number {
  if (!this.isActive()) return 0;
  return Math.min(this.coverageAmount, this.maxCoverageAmount);
};

export default mongoose.model<IWarranty>('Warranty', WarrantySchema);
