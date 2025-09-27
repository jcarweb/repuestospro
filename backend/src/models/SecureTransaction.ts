import mongoose, { Document, Schema } from 'mongoose';

export interface ISecureTransaction extends Document {
  transactionId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  storeId: mongoose.Schema.Types.ObjectId;
  productId: mongoose.Schema.Types.ObjectId;
  
  // Estado de protección
  protectionStatus: 'protected' | 'at_risk' | 'claimed' | 'expired' | 'resolved';
  protectionLevel: 'basic' | 'premium' | 'extended';
  
  // Información de pago
  transactionAmount: number;
  protectionCost: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Garantías asociadas
  warranties: mongoose.Schema.Types.ObjectId[]; // Referencias a Warranty
  activeWarrantyCount: number;
  
  // Fechas importantes
  purchaseDate: Date;
  protectionStartDate: Date;
  protectionEndDate: Date;
  lastActivityDate: Date;
  
  // Eventos y historial
  events: Array<{
    type: 'protection_activated' | 'warranty_added' | 'claim_filed' | 'protection_expired' | 'refund_processed';
    description: string;
    amount?: number;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  
  // Riesgo y monitoreo
  riskScore: number; // 0-100, donde 0 es sin riesgo
  riskFactors: string[];
  monitoringEnabled: boolean;
  
  // Metadatos
  notes?: string;
  tags?: string[];
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SecureTransactionSchema = new Schema<ISecureTransaction>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Estado de protección
  protectionStatus: { 
    type: String, 
    required: true, 
    enum: ['protected', 'at_risk', 'claimed', 'expired', 'resolved'],
    default: 'protected'
  },
  protectionLevel: { 
    type: String, 
    required: true, 
    enum: ['basic', 'premium', 'extended'],
    default: 'basic'
  },
  
  // Información de pago
  transactionAmount: { type: Number, required: true, min: 0 },
  protectionCost: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Garantías asociadas
  warranties: [{ type: Schema.Types.ObjectId, ref: 'Warranty' }],
  activeWarrantyCount: { type: Number, default: 0, min: 0 },
  
  // Fechas importantes
  purchaseDate: { type: Date, required: true },
  protectionStartDate: { type: Date, required: true },
  protectionEndDate: { type: Date, required: true },
  lastActivityDate: { type: Date, default: Date.now },
  
  // Eventos y historial
  events: [{
    type: { 
      type: String, 
      required: true,
      enum: ['protection_activated', 'warranty_added', 'claim_filed', 'protection_expired', 'refund_processed']
    },
    description: { type: String, required: true },
    amount: { type: Number, min: 0 },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
  }],
  
  // Riesgo y monitoreo
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  riskFactors: [{ type: String }],
  monitoringEnabled: { type: Boolean, default: true },
  
  // Metadatos
  notes: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Índices para optimizar consultas
SecureTransactionSchema.index({ transactionId: 1 }, { unique: true });
SecureTransactionSchema.index({ userId: 1, protectionStatus: 1 });
SecureTransactionSchema.index({ storeId: 1, protectionStatus: 1 });
SecureTransactionSchema.index({ protectionEndDate: 1, protectionStatus: 1 });
SecureTransactionSchema.index({ purchaseDate: 1 });
SecureTransactionSchema.index({ riskScore: -1 });

// Método para verificar si la protección está activa
SecureTransactionSchema.methods['isProtected'] = function(): boolean {
  return this['protectionStatus'] === 'protected' && new Date() <= this['protectionEndDate'];
};

// Método para calcular días restantes de protección
SecureTransactionSchema.methods['getProtectionDaysRemaining'] = function(): number {
  if (this['protectionStatus'] !== 'protected') return 0;
  const now = new Date();
  const diffTime = this['protectionEndDate'].getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para agregar evento al historial
SecureTransactionSchema.methods['addEvent'] = function(type: string, description: string, amount?: number, metadata?: any) {
  this['events'].push({
    type,
    description,
    amount,
    timestamp: new Date(),
    metadata
  });
  this['lastActivityDate'] = new Date();
  return this['save']();
};

// Método para calcular valor total protegido
SecureTransactionSchema.methods['getProtectedValue'] = function(): number {
  if (!this['isProtected']()) return 0;
  return this['transactionAmount'];
};

// Método para verificar si puede hacer reclamo
SecureTransactionSchema.methods['canFileClaim'] = function(): boolean {
  return this['isProtected']() && this['activeWarrantyCount'] > 0;
};

// Pre-save middleware para actualizar activeWarrantyCount
SecureTransactionSchema.pre('save', function(next) {
  if (this.isModified('warranties')) {
    this.activeWarrantyCount = this.warranties.length;
  }
  next();
});

export default mongoose.model<ISecureTransaction>('SecureTransaction', SecureTransactionSchema);
