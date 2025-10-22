import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryLog extends Document {
  _id: string;
  deliveryId?: string; // Opcional, puede ser un log del sistema
  orderId?: string; // Opcional, puede ser un log de pedido
  action: string; // Acción realizada
  description: string; // Descripción detallada
  level: 'info' | 'warning' | 'error' | 'critical'; // Nivel de log
  category: 'authentication' | 'payment' | 'delivery' | 'system' | 'security' | 'performance';
  metadata: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    responseTime?: number;
    errorCode?: string;
    stackTrace?: string;
    [key: string]: any; // Para datos adicionales específicos
  };
  timestamp: Date;
}

const DeliveryLogSchema = new Schema<IDeliveryLog>({
  deliveryId: String,
  orderId: String,
  action: { type: String, required: true },
  description: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'critical'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['authentication', 'payment', 'delivery', 'system', 'security', 'performance'],
    required: true 
  },
  metadata: {
    userId: String,
    ipAddress: String,
    userAgent: String,
    requestId: String,
    responseTime: Number,
    errorCode: String,
    stackTrace: String
  },
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'delivery_logs'
});

// Índices para optimizar consultas y auditoría
DeliveryLogSchema.index({ deliveryId: 1, timestamp: -1 });
DeliveryLogSchema.index({ orderId: 1, timestamp: -1 });
DeliveryLogSchema.index({ level: 1, timestamp: -1 });
DeliveryLogSchema.index({ category: 1, timestamp: -1 });
DeliveryLogSchema.index({ timestamp: -1 });
DeliveryLogSchema.index({ 'metadata.userId': 1, timestamp: -1 });
DeliveryLogSchema.index({ action: 1, timestamp: -1 });

// Índice TTL para limpiar logs antiguos (90 días)
DeliveryLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<IDeliveryLog>('DeliveryLog', DeliveryLogSchema);
