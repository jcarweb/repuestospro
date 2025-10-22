import mongoose, { Document, Schema } from 'mongoose';

export interface ILogisticFund extends Document {
  _id: string;
  fundId: string; // ID único del fondo
  currentBalance: number; // Saldo actual del fondo
  totalContributions: number; // Total de aportes recibidos
  totalPayments: number; // Total de pagos realizados
  emergencyReserve: number; // Reserva de emergencia (5% del fondo)
  
  // Fuentes de ingresos
  revenueSources: {
    marketplaceCommission: {
      total: number;
      percentage: number; // 60% del total
      lastUpdated: Date;
    };
    logisticFee: {
      total: number;
      percentage: number; // 25% del total
      lastUpdated: Date;
    };
    solidarityPool: {
      total: number;
      percentage: number; // 15% del total
      lastUpdated: Date;
    };
  };
  
  // Métricas de rendimiento
  performance: {
    dailyROI: number; // Retorno diario
    weeklyROI: number; // Retorno semanal
    monthlyROI: number; // Retorno mensual
    breakEvenPoint: number; // Punto de equilibrio
    lastCalculated: Date;
  };
  
  // Configuración de gobernanza
  governance: {
    minProfitability: number; // Rentabilidad mínima (15%)
    maxLogisticFee: number; // Fee máximo ($1)
    emergencyThreshold: number; // Umbral de emergencia (10%)
    surplusThreshold: number; // Umbral de superávit (25%)
    autoAdjustmentEnabled: boolean;
    lastAdjustment: Date;
    adjustmentHistory: Array<{
      date: Date;
      type: 'increase_fee' | 'decrease_fee' | 'distribute_bonus' | 'emergency_fund';
      reason: string;
      oldValue: number;
      newValue: number;
    }>;
  };
  
  // Estado del fondo
  status: 'active' | 'suspended' | 'emergency' | 'maintenance';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LogisticFundSchema = new Schema<ILogisticFund>({
  fundId: { type: String, required: true, unique: true, default: () => `fund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
  currentBalance: { type: Number, default: 0, min: 0 },
  totalContributions: { type: Number, default: 0, min: 0 },
  totalPayments: { type: Number, default: 0, min: 0 },
  emergencyReserve: { type: Number, default: 0, min: 0 },
  
  revenueSources: {
    marketplaceCommission: {
      total: { type: Number, default: 0, min: 0 },
      percentage: { type: Number, default: 60, min: 0, max: 100 },
      lastUpdated: { type: Date, default: Date.now }
    },
    logisticFee: {
      total: { type: Number, default: 0, min: 0 },
      percentage: { type: Number, default: 25, min: 0, max: 100 },
      lastUpdated: { type: Date, default: Date.now }
    },
    solidarityPool: {
      total: { type: Number, default: 0, min: 0 },
      percentage: { type: Number, default: 15, min: 0, max: 100 },
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  
  performance: {
    dailyROI: { type: Number, default: 0 },
    weeklyROI: { type: Number, default: 0 },
    monthlyROI: { type: Number, default: 0 },
    breakEvenPoint: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now }
  },
  
  governance: {
    minProfitability: { type: Number, default: 15, min: 0, max: 100 },
    maxLogisticFee: { type: Number, default: 1, min: 0 },
    emergencyThreshold: { type: Number, default: 10, min: 0, max: 100 },
    surplusThreshold: { type: Number, default: 25, min: 0, max: 100 },
    autoAdjustmentEnabled: { type: Boolean, default: true },
    lastAdjustment: { type: Date, default: Date.now },
    adjustmentHistory: [{
      date: { type: Date, required: true },
      type: { 
        type: String, 
        enum: ['increase_fee', 'decrease_fee', 'distribute_bonus', 'emergency_fund'],
        required: true 
      },
      reason: { type: String, required: true },
      oldValue: { type: Number, required: true },
      newValue: { type: Number, required: true }
    }]
  },
  
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'emergency', 'maintenance'], 
    default: 'active' 
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'logistic_funds'
});

// Índices para optimizar consultas
LogisticFundSchema.index({ fundId: 1 });
LogisticFundSchema.index({ status: 1, isActive: 1 });
LogisticFundSchema.index({ 'performance.lastCalculated': -1 });
LogisticFundSchema.index({ 'governance.lastAdjustment': -1 });

export default mongoose.model<ILogisticFund>('LogisticFund', LogisticFundSchema);
