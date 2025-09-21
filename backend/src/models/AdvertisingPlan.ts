import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvertisingPlan extends Document {
  name: string;
  description: string;
  type: 'basic' | 'premium' | 'enterprise' | 'custom';
  category: 'banner' | 'popup' | 'video' | 'native' | 'search' | 'social';
  
  // Precios y costos
  pricing: {
    basePrice: number;
    currency: string;
    billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    setupFee?: number;
    minimumSpend: number;
    maximumSpend?: number;
  };
  
  // Características del plan
  features: {
    maxImpressions: number;
    maxClicks: number;
    maxConversions: number;
    targetingOptions: string[];
    analyticsLevel: 'basic' | 'advanced' | 'premium';
    supportLevel: 'email' | 'phone' | 'dedicated';
    customDesign: boolean;
    priority: number;
    geoTargeting: boolean;
    deviceTargeting: boolean;
    timeTargeting: boolean;
    audienceTargeting: boolean;
  };
  
  // Configuración de display
  displaySettings: {
    allowedTypes: string[];
    allowedPositions: string[];
    allowedSizes: string[];
    maxDuration: number; // en días
    minDuration: number; // en días
  };
  
  // Restricciones
  restrictions: {
    minStoreRating: number;
    minStoreAge: number; // en días
    requiredApproval: boolean;
    maxActiveCampaigns: number;
    blacklistedCategories: string[];
  };
  
  // Estado y metadatos
  isActive: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const AdvertisingPlanSchema = new Schema<IAdvertisingPlan>({
  name: {
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
  type: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise', 'custom'],
    default: 'basic'
  },
  category: {
    type: String,
    required: true,
    enum: ['banner', 'popup', 'video', 'native', 'search', 'social'],
    default: 'banner'
  },
  
  // Precios y costos
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'EUR', 'VES'],
      default: 'USD'
    },
    billingCycle: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    setupFee: {
      type: Number,
      min: 0,
      default: 0
    },
    minimumSpend: {
      type: Number,
      required: true,
      min: 0
    },
    maximumSpend: {
      type: Number,
      min: 0
    }
  },
  
  // Características del plan
  features: {
    maxImpressions: {
      type: Number,
      required: true,
      min: 0
    },
    maxClicks: {
      type: Number,
      required: true,
      min: 0
    },
    maxConversions: {
      type: Number,
      required: true,
      min: 0
    },
    targetingOptions: [{
      type: String,
      enum: ['geo', 'device', 'time', 'audience', 'interest', 'behavior', 'demographic']
    }],
    analyticsLevel: {
      type: String,
      required: true,
      enum: ['basic', 'advanced', 'premium'],
      default: 'basic'
    },
    supportLevel: {
      type: String,
      required: true,
      enum: ['email', 'phone', 'dedicated'],
      default: 'email'
    },
    customDesign: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5
    },
    geoTargeting: {
      type: Boolean,
      default: false
    },
    deviceTargeting: {
      type: Boolean,
      default: false
    },
    timeTargeting: {
      type: Boolean,
      default: false
    },
    audienceTargeting: {
      type: Boolean,
      default: false
    }
  },
  
  // Configuración de display
  displaySettings: {
    allowedTypes: [{
      type: String,
      enum: ['fullscreen', 'footer', 'mid_screen', 'search_card', 'banner', 'popup', 'video']
    }],
    allowedPositions: [{
      type: String,
      enum: ['top', 'middle', 'bottom', 'sidebar', 'header', 'footer', 'floating']
    }],
    allowedSizes: [{
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge', 'fullscreen', 'custom']
    }],
    maxDuration: {
      type: Number,
      required: true,
      min: 1,
      default: 30 // 30 días por defecto
    },
    minDuration: {
      type: Number,
      required: true,
      min: 1,
      default: 1 // 1 día por defecto
    }
  },
  
  // Restricciones
  restrictions: {
    minStoreRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0
    },
    minStoreAge: {
      type: Number,
      required: true,
      min: 0,
      default: 0 // 0 días por defecto
    },
    requiredApproval: {
      type: Boolean,
      default: false
    },
    maxActiveCampaigns: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    blacklistedCategories: [{
      type: String,
      enum: ['adult', 'gambling', 'tobacco', 'alcohol', 'weapons', 'drugs', 'hate_speech', 'violence']
    }]
  },
  
  // Estado y metadatos
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
AdvertisingPlanSchema.index({ type: 1, category: 1 });
AdvertisingPlanSchema.index({ isActive: 1, sortOrder: 1 });
AdvertisingPlanSchema.index({ 'pricing.basePrice': 1 });
AdvertisingPlanSchema.index({ name: 'text', description: 'text' });

// Middleware pre-save para validaciones
AdvertisingPlanSchema.pre('save', function(next) {
  // Validar que el precio máximo sea mayor al mínimo
  if (this.pricing.maximumSpend && this.pricing.maximumSpend <= this.pricing.minimumSpend) {
    return next(new Error('El gasto máximo debe ser mayor al gasto mínimo'));
  }
  
  // Validar que la duración máxima sea mayor a la mínima
  if (this.displaySettings.maxDuration <= this.displaySettings.minDuration) {
    return next(new Error('La duración máxima debe ser mayor a la duración mínima'));
  }
  
  // Validar que las impresiones, clicks y conversiones sean consistentes
  if (this.features.maxClicks > this.features.maxImpressions) {
    return next(new Error('Los clicks máximos no pueden ser mayores a las impresiones máximas'));
  }
  
  if (this.features.maxConversions > this.features.maxClicks) {
    return next(new Error('Las conversiones máximas no pueden ser mayores a los clicks máximos'));
  }
  
  next();
});

// Método para obtener planes activos ordenados por prioridad
AdvertisingPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, priority: -1 });
};

// Método para obtener planes por tipo y categoría
AdvertisingPlanSchema.statics.getPlansByTypeAndCategory = function(type: string, category: string) {
  return this.find({ 
    type, 
    category, 
    isActive: true 
  }).sort({ sortOrder: 1, priority: -1 });
};

// Método para obtener planes recomendados
AdvertisingPlanSchema.statics.getRecommendedPlans = function() {
  return this.find({ 
    isActive: true, 
    isRecommended: true 
  }).sort({ sortOrder: 1, priority: -1 });
};

// Método para obtener planes populares
AdvertisingPlanSchema.statics.getPopularPlans = function() {
  return this.find({ 
    isActive: true, 
    isPopular: true 
  }).sort({ sortOrder: 1, priority: -1 });
};

// Método de instancia para verificar si un plan es adecuado para una tienda
AdvertisingPlanSchema.methods.isSuitableForStore = function(store: any) {
  // Verificar rating mínimo
  if (store.rating < this.restrictions.minStoreRating) {
    return { suitable: false, reason: 'Rating de tienda insuficiente' };
  }
  
  // Verificar antigüedad mínima
  const storeAge = Math.floor((Date.now() - new Date(store.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (storeAge < this.restrictions.minStoreAge) {
    return { suitable: false, reason: 'Tienda muy nueva' };
  }
  
  // Verificar categorías bloqueadas
  if (store.category && this.restrictions.blacklistedCategories.includes(store.category)) {
    return { suitable: false, reason: 'Categoría no permitida' };
  }
  
  return { suitable: true };
};

export default mongoose.model<IAdvertisingPlan>('AdvertisingPlan', AdvertisingPlanSchema);
