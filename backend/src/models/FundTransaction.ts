import mongoose, { Document, Schema } from 'mongoose';

export interface IFundTransaction extends Document {
  _id: string;
  fundId: string; // Referencia al fondo logístico
  orderId?: string; // Referencia al pedido (si aplica)
  deliveryId?: string; // Referencia al delivery (si aplica)
  
  // Información de la transacción
  type: 'contribution' | 'payment' | 'bonus' | 'adjustment' | 'emergency' | 'surplus_distribution';
  amount: number; // Positivo para ingresos, negativo para egresos
  description: string;
  
  // Detalles del aporte (para transacciones de tipo 'contribution')
  contributionDetails?: {
    orderValue: number;
    marketplaceCommission: number;
    logisticFee: number;
    solidarityPool: number;
    totalContribution: number;
    distribution: {
      fromMarketplace: number;
      fromLogisticFee: number;
      fromSolidarity: number;
    };
  };
  
  // Detalles del pago (para transacciones de tipo 'payment')
  paymentDetails?: {
    basePayment: number;
    bonusAmount: number;
    totalPayment: number;
    deliveryLevel: 'bronze' | 'silver' | 'gold' | 'elite';
    performanceBonus: number;
    loyaltyBonus: number;
  };
  
  // Detalles del bono (para transacciones de tipo 'bonus')
  bonusDetails?: {
    bonusType: 'weekly' | 'performance' | 'loyalty' | 'speed' | 'volume' | 'special';
    weeklyDeliveries: number;
    rating: number;
    level: 'bronze' | 'silver' | 'gold' | 'elite';
    bonusRules: {
      threshold: number;
      baseBonus: number;
      multiplier: number;
    };
  };
  
  // Detalles del ajuste (para transacciones de tipo 'adjustment')
  adjustmentDetails?: {
    adjustmentType: 'logistic_fee' | 'marketplace_commission' | 'solidarity_pool';
    oldValue: number;
    newValue: number;
    reason: string;
    governanceTrigger: boolean;
  };
  
  // Metadatos adicionales
  metadata: {
    zone?: string;
    peakHours?: boolean;
    weatherCondition?: 'normal' | 'rain' | 'storm' | 'extreme';
    priority?: 'normal' | 'high' | 'urgent';
    distance?: number;
    deliveryTime?: number;
    customerRating?: number;
    [key: string]: any;
  };
  
  // Estado de la transacción
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  failureReason?: string;
  
  // Auditoría
  createdBy?: string; // ID del usuario que creó la transacción
  approvedBy?: string; // ID del usuario que aprobó la transacción
  createdAt: Date;
  updatedAt: Date;
}

const FundTransactionSchema = new Schema<IFundTransaction>({
  fundId: { type: String, required: true },
  orderId: String,
  deliveryId: String,
  
  type: { 
    type: String, 
    enum: ['contribution', 'payment', 'bonus', 'adjustment', 'emergency', 'surplus_distribution'],
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  
  contributionDetails: {
    orderValue: Number,
    marketplaceCommission: Number,
    logisticFee: Number,
    solidarityPool: Number,
    totalContribution: Number,
    distribution: {
      fromMarketplace: Number,
      fromLogisticFee: Number,
      fromSolidarity: Number
    }
  },
  
  paymentDetails: {
    basePayment: Number,
    bonusAmount: Number,
    totalPayment: Number,
    deliveryLevel: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'elite'] 
    },
    performanceBonus: Number,
    loyaltyBonus: Number
  },
  
  bonusDetails: {
    bonusType: { 
      type: String, 
      enum: ['weekly', 'performance', 'loyalty', 'speed', 'volume', 'special'] 
    },
    weeklyDeliveries: Number,
    rating: Number,
    level: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'elite'] 
    },
    bonusRules: {
      threshold: Number,
      baseBonus: Number,
      multiplier: Number
    }
  },
  
  adjustmentDetails: {
    adjustmentType: { 
      type: String, 
      enum: ['logistic_fee', 'marketplace_commission', 'solidarity_pool'] 
    },
    oldValue: Number,
    newValue: Number,
    reason: String,
    governanceTrigger: Boolean
  },
  
  metadata: {
    zone: String,
    peakHours: Boolean,
    weatherCondition: { 
      type: String, 
      enum: ['normal', 'rain', 'storm', 'extreme'] 
    },
    priority: { 
      type: String, 
      enum: ['normal', 'high', 'urgent'] 
    },
    distance: Number,
    deliveryTime: Number,
    customerRating: Number
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  processedAt: Date,
  failureReason: String,
  
  createdBy: String,
  approvedBy: String
}, {
  timestamps: true,
  collection: 'fund_transactions'
});

// Índices para optimizar consultas
FundTransactionSchema.index({ fundId: 1, createdAt: -1 });
FundTransactionSchema.index({ orderId: 1 });
FundTransactionSchema.index({ deliveryId: 1, createdAt: -1 });
FundTransactionSchema.index({ type: 1, status: 1 });
FundTransactionSchema.index({ createdAt: -1 });
FundTransactionSchema.index({ 'metadata.zone': 1 });
FundTransactionSchema.index({ 'paymentDetails.deliveryLevel': 1 });
FundTransactionSchema.index({ 'bonusDetails.level': 1 });

export default mongoose.model<IFundTransaction>('FundTransaction', FundTransactionSchema);
