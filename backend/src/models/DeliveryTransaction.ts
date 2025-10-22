import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryTransaction extends Document {
  _id: string;
  deliveryId: string; // Referencia al delivery
  walletId: string; // Referencia a la wallet del delivery
  orderId?: string; // Referencia al pedido (si aplica)
  type: 'delivery_payment' | 'bonus' | 'withdrawal' | 'refund' | 'penalty' | 'adjustment';
  amount: number; // Positivo para créditos, negativo para débitos
  description: string;
  metadata: {
    deliveryFee?: number; // Tarifa base de la entrega
    bonusAmount?: number; // Monto del bono aplicado
    bonusType?: 'performance' | 'loyalty' | 'speed' | 'volume' | 'special';
    distance?: number; // Distancia en km
    deliveryTime?: number; // Tiempo en minutos
    rating?: number; // Rating recibido
    zone?: string; // Zona de entrega
    peakHours?: boolean; // Si fue en horas pico
    weatherCondition?: 'normal' | 'rain' | 'storm' | 'extreme';
    orderValue?: number; // Valor del pedido
    commissionDeduction?: number; // Deducción de comisión del marketplace
  };
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryTransactionSchema = new Schema<IDeliveryTransaction>({
  deliveryId: { type: String, required: true },
  walletId: { type: String, required: true },
  orderId: String,
  type: { 
    type: String, 
    enum: ['delivery_payment', 'bonus', 'withdrawal', 'refund', 'penalty', 'adjustment'],
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  metadata: {
    deliveryFee: Number,
    bonusAmount: Number,
    bonusType: { 
      type: String, 
      enum: ['performance', 'loyalty', 'speed', 'volume', 'special'] 
    },
    distance: Number,
    deliveryTime: Number,
    rating: { type: Number, min: 1, max: 5 },
    zone: String,
    peakHours: Boolean,
    weatherCondition: { 
      type: String, 
      enum: ['normal', 'rain', 'storm', 'extreme'] 
    },
    orderValue: Number,
    commissionDeduction: Number
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  processedAt: Date,
  failureReason: String
}, {
  timestamps: true,
  collection: 'delivery_transactions'
});

// Índices para optimizar consultas
DeliveryTransactionSchema.index({ deliveryId: 1, createdAt: -1 });
DeliveryTransactionSchema.index({ walletId: 1, createdAt: -1 });
DeliveryTransactionSchema.index({ orderId: 1 });
DeliveryTransactionSchema.index({ type: 1, status: 1 });
DeliveryTransactionSchema.index({ createdAt: -1 });
DeliveryTransactionSchema.index({ 'metadata.bonusType': 1 });

export default mongoose.model<IDeliveryTransaction>('DeliveryTransaction', DeliveryTransactionSchema);
