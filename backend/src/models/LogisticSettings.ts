import mongoose, { Document, Schema } from 'mongoose';

export interface ILogisticSettings extends Document {
  _id: string;
  
  // Configuración de tasas y comisiones
  rates: {
    marketplaceCommissionRate: number; // 12% por defecto
    logisticFeeBase: number; // $0.5 por defecto
    logisticFeeMax: number; // $1.0 máximo
    solidarityPoolRate: number; // 15% por defecto
    emergencyReserveRate: number; // 5% del fondo
  };
  
  // Configuración de pagos a deliverys
  deliveryPayments: {
    minimumPayment: number; // $5 mínimo garantizado
    basePayment: number; // $5 base
    distanceRate: number; // $0.5 por km adicional
    timeRate: number; // $0.1 por minuto adicional
    peakHoursMultiplier: number; // 1.2x en horas pico
    weatherMultiplier: number; // 1.3x en mal tiempo
    priorityMultiplier: number; // 1.5x para urgentes
  };
  
  // Configuración de bonos por nivel
  bonusLevels: {
    bronze: {
      threshold: number; // 20 entregas/semana
      baseBonus: number; // $10
      multiplier: number; // 1.0x
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    silver: {
      threshold: number; // 40 entregas/semana
      baseBonus: number; // $30
      multiplier: number; // 1.2x
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    gold: {
      threshold: number; // 60 entregas/semana
      baseBonus: number; // $60
      multiplier: number; // 1.5x
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
    elite: {
      threshold: number; // 80 entregas/semana
      baseBonus: number; // $100
      multiplier: number; // 2.0x
      benefits: {
        priorityOrders: boolean;
        fasterWithdrawals: boolean;
        premiumSupport: boolean;
        exclusiveZones: string[];
      };
    };
  };
  
  // Configuración de gobernanza automática
  governance: {
    enabled: boolean; // Gobernanza automática habilitada
    minProfitability: number; // 15% rentabilidad mínima
    maxLogisticFee: number; // $1.0 fee máximo
    emergencyThreshold: number; // 10% del fondo
    surplusThreshold: number; // 25% del fondo
    adjustmentFrequency: 'daily' | 'weekly' | 'monthly';
    maxAdjustmentPercent: number; // 20% máximo ajuste por período
    autoApprovalThreshold: number; // Umbral para aprobación automática
  };
  
  // Configuración de zonas
  zones: {
    [zoneName: string]: {
      baseRate: number;
      multiplier: number;
      isActive: boolean;
      peakHours: Array<{
        start: string;
        end: string;
        multiplier: number;
      }>;
      demandLevel: 'low' | 'medium' | 'high' | 'critical';
      bonusMultiplier: number;
    };
  };
  
  // Configuración de retiros
  withdrawals: {
    minimumAmount: number; // $20 mínimo
    maximumAmount: number; // $500 máximo
    processingFee: number; // $1 comisión
    processingTime: number; // 24 horas
    allowedMethods: string[]; // ['bank', 'digital']
    levelLimits: {
      bronze: { dailyLimit: number; weeklyLimit: number };
      silver: { dailyLimit: number; weeklyLimit: number };
      gold: { dailyLimit: number; weeklyLimit: number };
      elite: { dailyLimit: number; weeklyLimit: number };
    };
  };
  
  // Configuración de notificaciones
  notifications: {
    paymentNotifications: boolean;
    bonusNotifications: boolean;
    fundAlerts: boolean;
    governanceChanges: boolean;
    systemAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  
  // Configuración del sistema
  system: {
    isActive: boolean;
    maintenanceMode: boolean;
    maxActiveDeliverys: number;
    fundAutoReplenishment: boolean;
    emergencyMode: boolean;
    lastMaintenance: Date;
    version: string;
  };
  
  // Auditoría
  lastUpdated: Date;
  updatedBy: string;
  changeHistory: Array<{
    date: Date;
    field: string;
    oldValue: any;
    newValue: any;
    updatedBy: string;
    reason: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const LogisticSettingsSchema = new Schema<ILogisticSettings>({
  rates: {
    marketplaceCommissionRate: { type: Number, default: 12, min: 0, max: 100 },
    logisticFeeBase: { type: Number, default: 0.5, min: 0 },
    logisticFeeMax: { type: Number, default: 1.0, min: 0 },
    solidarityPoolRate: { type: Number, default: 15, min: 0, max: 100 },
    emergencyReserveRate: { type: Number, default: 5, min: 0, max: 100 }
  },
  
  deliveryPayments: {
    minimumPayment: { type: Number, default: 5, min: 0 },
    basePayment: { type: Number, default: 5, min: 0 },
    distanceRate: { type: Number, default: 0.5, min: 0 },
    timeRate: { type: Number, default: 0.1, min: 0 },
    peakHoursMultiplier: { type: Number, default: 1.2, min: 1 },
    weatherMultiplier: { type: Number, default: 1.3, min: 1 },
    priorityMultiplier: { type: Number, default: 1.5, min: 1 }
  },
  
  bonusLevels: {
    bronze: {
      threshold: { type: Number, default: 20, min: 0 },
      baseBonus: { type: Number, default: 10, min: 0 },
      multiplier: { type: Number, default: 1.0, min: 0 },
      benefits: {
        priorityOrders: { type: Boolean, default: false },
        fasterWithdrawals: { type: Boolean, default: false },
        premiumSupport: { type: Boolean, default: false },
        exclusiveZones: [{ type: String }]
      }
    },
    silver: {
      threshold: { type: Number, default: 40, min: 0 },
      baseBonus: { type: Number, default: 30, min: 0 },
      multiplier: { type: Number, default: 1.2, min: 0 },
      benefits: {
        priorityOrders: { type: Boolean, default: true },
        fasterWithdrawals: { type: Boolean, default: true },
        premiumSupport: { type: Boolean, default: false },
        exclusiveZones: [{ type: String }]
      }
    },
    gold: {
      threshold: { type: Number, default: 60, min: 0 },
      baseBonus: { type: Number, default: 60, min: 0 },
      multiplier: { type: Number, default: 1.5, min: 0 },
      benefits: {
        priorityOrders: { type: Boolean, default: true },
        fasterWithdrawals: { type: Boolean, default: true },
        premiumSupport: { type: Boolean, default: true },
        exclusiveZones: [{ type: String }]
      }
    },
    elite: {
      threshold: { type: Number, default: 80, min: 0 },
      baseBonus: { type: Number, default: 100, min: 0 },
      multiplier: { type: Number, default: 2.0, min: 0 },
      benefits: {
        priorityOrders: { type: Boolean, default: true },
        fasterWithdrawals: { type: Boolean, default: true },
        premiumSupport: { type: Boolean, default: true },
        exclusiveZones: [{ type: String }]
      }
    }
  },
  
  governance: {
    enabled: { type: Boolean, default: true },
    minProfitability: { type: Number, default: 15, min: 0, max: 100 },
    maxLogisticFee: { type: Number, default: 1.0, min: 0 },
    emergencyThreshold: { type: Number, default: 10, min: 0, max: 100 },
    surplusThreshold: { type: Number, default: 25, min: 0, max: 100 },
    adjustmentFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'], 
      default: 'daily' 
    },
    maxAdjustmentPercent: { type: Number, default: 20, min: 0, max: 100 },
    autoApprovalThreshold: { type: Number, default: 1000, min: 0 }
  },
  
  zones: {
    type: Map,
    of: {
      baseRate: Number,
      multiplier: Number,
      isActive: Boolean,
      peakHours: [{
        start: String,
        end: String,
        multiplier: Number
      }],
      demandLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'] 
      },
      bonusMultiplier: Number
    }
  },
  
  withdrawals: {
    minimumAmount: { type: Number, default: 20, min: 0 },
    maximumAmount: { type: Number, default: 500, min: 0 },
    processingFee: { type: Number, default: 1, min: 0 },
    processingTime: { type: Number, default: 24, min: 0 },
    allowedMethods: [{ type: String }],
    levelLimits: {
      bronze: {
        dailyLimit: { type: Number, default: 50, min: 0 },
        weeklyLimit: { type: Number, default: 200, min: 0 }
      },
      silver: {
        dailyLimit: { type: Number, default: 100, min: 0 },
        weeklyLimit: { type: Number, default: 400, min: 0 }
      },
      gold: {
        dailyLimit: { type: Number, default: 200, min: 0 },
        weeklyLimit: { type: Number, default: 800, min: 0 }
      },
      elite: {
        dailyLimit: { type: Number, default: 500, min: 0 },
        weeklyLimit: { type: Number, default: 2000, min: 0 }
      }
    }
  },
  
  notifications: {
    paymentNotifications: { type: Boolean, default: true },
    bonusNotifications: { type: Boolean, default: true },
    fundAlerts: { type: Boolean, default: true },
    governanceChanges: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
  },
  
  system: {
    isActive: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maxActiveDeliverys: { type: Number, default: 1000, min: 0 },
    fundAutoReplenishment: { type: Boolean, default: true },
    emergencyMode: { type: Boolean, default: false },
    lastMaintenance: Date,
    version: { type: String, default: '1.0.0' }
  },
  
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: String,
  changeHistory: [{
    date: { type: Date, required: true },
    field: { type: String, required: true },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    updatedBy: { type: String, required: true },
    reason: { type: String, required: true }
  }]
}, {
  timestamps: true,
  collection: 'logistic_settings'
});

// Índices
LogisticSettingsSchema.index({ 'system.isActive': 1 });
LogisticSettingsSchema.index({ lastUpdated: -1 });
LogisticSettingsSchema.index({ 'system.version': 1 });

export default mongoose.model<ILogisticSettings>('LogisticSettings', LogisticSettingsSchema);
