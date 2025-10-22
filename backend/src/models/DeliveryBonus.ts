import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryBonus extends Document {
  _id: string;
  deliveryId: string; // Referencia al delivery
  fundId: string; // Referencia al fondo logístico
  
  // Información del bono
  bonusType: 'weekly' | 'performance' | 'loyalty' | 'speed' | 'volume' | 'special' | 'surplus';
  amount: number; // Monto del bono
  description: string;
  
  // Período del bono
  period: {
    startDate: Date;
    endDate: Date;
    weekNumber: number;
    year: number;
  };
  
  // Criterios de elegibilidad
  eligibilityCriteria: {
    weeklyDeliveries: number;
    totalDeliveries: number;
    averageRating: number;
    onTimeDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    level: 'bronze' | 'silver' | 'gold' | 'elite';
  };
  
  // Reglas aplicadas
  bonusRules: {
    level: 'bronze' | 'silver' | 'gold' | 'elite';
    threshold: number; // Entregas mínimas requeridas
    baseBonus: number; // Bono base del nivel
    multiplier: number; // Multiplicador por rendimiento
    ratingBonus: number; // Bono adicional por rating
    speedBonus: number; // Bono por velocidad
    loyaltyBonus: number; // Bono por fidelidad
    totalCalculated: number; // Total calculado
  };
  
  // Estado del bono
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paidAt?: Date;
  paymentTransactionId?: string; // Referencia a la transacción de pago
  
  // Auditoría
  calculatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryBonusSchema = new Schema<IDeliveryBonus>({
  deliveryId: { type: String, required: true },
  fundId: { type: String, required: true },
  
  bonusType: { 
    type: String, 
    enum: ['weekly', 'performance', 'loyalty', 'speed', 'volume', 'special', 'surplus'],
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    weekNumber: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  
  eligibilityCriteria: {
    weeklyDeliveries: { type: Number, required: true, min: 0 },
    totalDeliveries: { type: Number, required: true, min: 0 },
    averageRating: { type: Number, required: true, min: 0, max: 5 },
    onTimeDeliveries: { type: Number, required: true, min: 0 },
    completedDeliveries: { type: Number, required: true, min: 0 },
    cancelledDeliveries: { type: Number, required: true, min: 0 },
    level: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'elite'], 
      required: true 
    }
  },
  
  bonusRules: {
    level: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'elite'], 
      required: true 
    },
    threshold: { type: Number, required: true, min: 0 },
    baseBonus: { type: Number, required: true, min: 0 },
    multiplier: { type: Number, required: true, min: 0 },
    ratingBonus: { type: Number, default: 0, min: 0 },
    speedBonus: { type: Number, default: 0, min: 0 },
    loyaltyBonus: { type: Number, default: 0, min: 0 },
    totalCalculated: { type: Number, required: true, min: 0 }
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  paidAt: Date,
  paymentTransactionId: String,
  
  calculatedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  approvedBy: String
}, {
  timestamps: true,
  collection: 'delivery_bonuses'
});

// Índices para optimizar consultas
DeliveryBonusSchema.index({ deliveryId: 1, createdAt: -1 });
DeliveryBonusSchema.index({ fundId: 1, createdAt: -1 });
DeliveryBonusSchema.index({ bonusType: 1, status: 1 });
DeliveryBonusSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
DeliveryBonusSchema.index({ 'eligibilityCriteria.level': 1 });
DeliveryBonusSchema.index({ status: 1, createdAt: -1 });
DeliveryBonusSchema.index({ 'period.weekNumber': 1, 'period.year': 1 });

export default mongoose.model<IDeliveryBonus>('DeliveryBonus', DeliveryBonusSchema);
