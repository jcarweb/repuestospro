import mongoose, { Document, Schema } from 'mongoose';

export interface ILogisticLog extends Document {
  _id: string;
  
  // Información del log
  action: string; // Acción realizada
  description: string; // Descripción detallada
  level: 'info' | 'warning' | 'error' | 'critical' | 'debug';
  category: 'fund' | 'governance' | 'payment' | 'bonus' | 'delivery' | 'system' | 'security' | 'performance';
  
  // Contexto de la acción
  context: {
    fundId?: string;
    deliveryId?: string;
    orderId?: string;
    transactionId?: string;
    userId?: string;
    adminId?: string;
  };
  
  // Datos específicos del evento
  eventData: {
    fundBalance?: number;
    fundContribution?: number;
    fundPayment?: number;
    deliveryLevel?: 'bronze' | 'silver' | 'gold' | 'elite';
    bonusAmount?: number;
    governanceAction?: string;
    profitability?: number;
    adjustmentType?: string;
    oldValue?: number;
    newValue?: number;
    [key: string]: any;
  };
  
  // Información del sistema
  systemInfo: {
    version: string;
    environment: 'development' | 'staging' | 'production';
    serverId: string;
    requestId?: string;
    sessionId?: string;
  };
  
  // Información de la solicitud
  requestInfo: {
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    responseTime?: number;
    statusCode?: number;
  };
  
  // Metadatos adicionales
  metadata: {
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    source?: string;
    correlationId?: string;
    [key: string]: any;
  };
  
  // Timestamp
  timestamp: Date;
}

const LogisticLogSchema = new Schema<ILogisticLog>({
  action: { type: String, required: true },
  description: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['info', 'warning', 'error', 'critical', 'debug'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['fund', 'governance', 'payment', 'bonus', 'delivery', 'system', 'security', 'performance'],
    required: true 
  },
  
  context: {
    fundId: String,
    deliveryId: String,
    orderId: String,
    transactionId: String,
    userId: String,
    adminId: String
  },
  
  eventData: {
    fundBalance: Number,
    fundContribution: Number,
    fundPayment: Number,
    deliveryLevel: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'elite'] 
    },
    bonusAmount: Number,
    governanceAction: String,
    profitability: Number,
    adjustmentType: String,
    oldValue: Number,
    newValue: Number
  },
  
  systemInfo: {
    version: { type: String, default: '1.0.0' },
    environment: { 
      type: String, 
      enum: ['development', 'staging', 'production'], 
      default: 'development' 
    },
    serverId: { type: String, required: true },
    requestId: String,
    sessionId: String
  },
  
  requestInfo: {
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String,
    responseTime: Number,
    statusCode: Number
  },
  
  metadata: {
    tags: [{ type: String }],
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'] 
    },
    source: String,
    correlationId: String
  },
  
  timestamp: { type: Date, default: Date.now }
}, {
  collection: 'logistic_logs'
});

// Índices para optimizar consultas y auditoría
LogisticLogSchema.index({ timestamp: -1 });
LogisticLogSchema.index({ level: 1, timestamp: -1 });
LogisticLogSchema.index({ category: 1, timestamp: -1 });
LogisticLogSchema.index({ 'context.fundId': 1, timestamp: -1 });
LogisticLogSchema.index({ 'context.deliveryId': 1, timestamp: -1 });
LogisticLogSchema.index({ 'context.orderId': 1, timestamp: -1 });
LogisticLogSchema.index({ action: 1, timestamp: -1 });
LogisticLogSchema.index({ 'systemInfo.environment': 1, timestamp: -1 });
LogisticLogSchema.index({ 'metadata.priority': 1, timestamp: -1 });

// Índice TTL para limpiar logs antiguos (90 días)
LogisticLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model<ILogisticLog>('LogisticLog', LogisticLogSchema);
