import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvertisementRequest extends Document {
  // Información del solicitante
  storeManager: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  
  // Información de la campaña
  campaignName: string;
  campaignObjective: 'awareness' | 'traffic' | 'conversions' | 'sales';
  budget: {
    total: number;
    daily: number;
    currency: 'USD' | 'VES';
  };
  
  // Contenido de la publicidad
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  navigationUrl?: string;
  
  // Configuración de targeting
  targetAudience: {
    userRoles: string[];
    loyaltyLevels: string[];
    locations: string[];
    deviceTypes: string[];
    operatingSystems: string[];
    ageRanges: string[];
    interests: string[];
    customAudience?: string; // Audiencia personalizada
  };
  
  // Programación
  schedule: {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  
  // Configuración de display
  displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  targetPlatform: 'android' | 'ios' | 'both';
  
  // Configuración de reportes
  reportingPreferences: {
    emailFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
    emailAddress: string;
    includeMetrics: {
      impressions: boolean;
      clicks: boolean;
      conversions: boolean;
      spend: boolean;
      ctr: boolean;
      cpm: boolean;
      cpc: boolean;
    };
  };
  
  // Estado y aprobación
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  adminNotes?: string;
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  
  // Estimaciones y precios
  estimatedReach: number;
  estimatedClicks: number;
  estimatedCost: number;
  actualCost: number;
  
  // Publicidad creada (si es aprobada)
  createdAdvertisement?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const advertisementRequestSchema = new Schema<IAdvertisementRequest>({
  // Información del solicitante
  storeManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  
  // Información de la campaña
  campaignName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  campaignObjective: {
    type: String,
    enum: ['awareness', 'traffic', 'conversions', 'sales'],
    required: true
  },
  budget: {
    total: {
      type: Number,
      required: true,
      min: 1
    },
    daily: {
      type: Number,
      required: true,
      min: 0.1
    },
    currency: {
      type: String,
      enum: ['USD', 'VES'],
      default: 'USD'
    }
  },
  
  // Contenido de la publicidad
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  navigationUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La URL de navegación debe ser una URL válida'
    }
  },
  
  // Configuración de targeting
  targetAudience: {
    userRoles: [{
      type: String,
      enum: ['client', 'store_manager', 'delivery', 'admin']
    }],
    loyaltyLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }],
    locations: [String],
    deviceTypes: [{
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    }],
    operatingSystems: [{
      type: String,
      enum: ['android', 'ios', 'web']
    }],
    ageRanges: [{
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55+']
    }],
    interests: [String],
    customAudience: {
      type: String,
      trim: true
    }
  },
  
  // Programación
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timeSlots: [{
      start: {
        type: String,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }]
  },
  
  // Configuración de display
  displayType: {
    type: String,
    enum: ['fullscreen', 'footer', 'mid_screen', 'search_card'],
    required: true
  },
  targetPlatform: {
    type: String,
    enum: ['android', 'ios', 'both'],
    default: 'both'
  },
  
  // Configuración de reportes
  reportingPreferences: {
    emailFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true
    },
    includeMetrics: {
      impressions: {
        type: Boolean,
        default: true
      },
      clicks: {
        type: Boolean,
        default: true
      },
      conversions: {
        type: Boolean,
        default: true
      },
      spend: {
        type: Boolean,
        default: true
      },
      ctr: {
        type: Boolean,
        default: true
      },
      cpm: {
        type: Boolean,
        default: true
      },
      cpc: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Estado y aprobación
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Estimaciones y precios
  estimatedReach: {
    type: Number,
    default: 0
  },
  estimatedClicks: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  
  // Publicidad creada
  createdAdvertisement: {
    type: Schema.Types.ObjectId,
    ref: 'Advertisement'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
advertisementRequestSchema.index({ storeManager: 1 });
advertisementRequestSchema.index({ store: 1 });
advertisementRequestSchema.index({ status: 1 });
advertisementRequestSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
advertisementRequestSchema.index({ createdAt: 1 });

// Método para calcular estimaciones
advertisementRequestSchema.methods.calculateEstimates = function(): {
  estimatedReach: number;
  estimatedClicks: number;
  estimatedCost: number;
} {
  // Lógica de cálculo basada en el presupuesto y targeting
  const baseCPM = 5; // $5 por 1000 impresiones
  const baseCTR = 0.02; // 2% click-through rate
  
  const estimatedImpressions = (this.budget.total * 1000) / baseCPM;
  const estimatedClicks = estimatedImpressions * baseCTR;
  const estimatedCost = this.budget.total;
  
  return {
    estimatedReach: Math.round(estimatedImpressions),
    estimatedClicks: Math.round(estimatedClicks),
    estimatedCost: estimatedCost
  };
};

// Método para validar fechas
advertisementRequestSchema.methods.validateSchedule = function(): boolean {
  const now = new Date();
  return this.schedule.startDate > now && this.schedule.endDate > this.schedule.startDate;
};

const AdvertisementRequest = mongoose.model<IAdvertisementRequest>('AdvertisementRequest', advertisementRequestSchema);

export default AdvertisementRequest;
