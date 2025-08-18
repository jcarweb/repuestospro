import mongoose, { Document, Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IAdvertisement extends Document {
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  navigationUrl?: string; // URL para navegar a la promoción o producto
  store: mongoose.Types.ObjectId;
  displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  targetPlatform: 'android' | 'ios' | 'both';
  targetAudience: {
    userRoles: string[];
    loyaltyLevels: string[];
    locations: string[];
    deviceTypes: string[];
    operatingSystems: string[];
    ageRanges: string[];
    interests: string[];
  };
  schedule: {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  displaySettings: {
    maxImpressions: number;
    currentImpressions: number;
    maxClicks: number;
    currentClicks: number;
    frequency: number; // How many times per user
    priority: number; // 1-10, higher = more priority
    isActive: boolean;
  };
  tracking: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number; // Click-through rate
    cpm: number; // Cost per thousand impressions
    cpc: number; // Cost per click
  };
  analytics: {
    deviceBreakdown: {
      android: number;
      ios: number;
    };
    locationBreakdown: {
      [location: string]: number;
    };
    timeBreakdown: {
      [hour: string]: number;
    };
    userSegmentBreakdown: {
      [segment: string]: number;
    };
  };
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementSchema = new Schema<IAdvertisement>({
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
        if (!v) return true; // Campo opcional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La URL de navegación debe ser una URL válida'
    }
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
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
    interests: [String]
  },
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
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
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
  displaySettings: {
    maxImpressions: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    currentImpressions: {
      type: Number,
      default: 0
    },
    maxClicks: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    currentClicks: {
      type: Number,
      default: 0
    },
    frequency: {
      type: Number,
      default: 1,
      min: 1
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  tracking: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpm: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    }
  },
  analytics: {
    deviceBreakdown: {
      android: {
        type: Number,
        default: 0
      },
      ios: {
        type: Number,
        default: 0
      }
    },
    locationBreakdown: {
      type: Map,
      of: Number,
      default: {}
    },
    timeBreakdown: {
      type: Map,
      of: Number,
      default: {}
    },
    userSegmentBreakdown: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
advertisementSchema.index({ store: 1 });
advertisementSchema.index({ status: 1 });
advertisementSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
advertisementSchema.index({ 'displaySettings.isActive': 1 });
advertisementSchema.index({ targetPlatform: 1 });
advertisementSchema.index({ createdBy: 1 });
advertisementSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1, status: 1 });

// Método para verificar si el anuncio está activo y en horario
advertisementSchema.methods.isCurrentlyActive = function(): boolean {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const currentDay = now.getDay();
  
  // Verificar si está activo en configuración
  if (!this.displaySettings.isActive || this.status !== 'active') {
    return false;
  }
  
  // Verificar fechas
  if (now < this.schedule.startDate || now > this.schedule.endDate) {
    return false;
  }
  
  // Verificar días de la semana
  if (this.schedule.daysOfWeek.length > 0 && !this.schedule.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  // Verificar horario general
  if (currentTime < this.schedule.startTime || currentTime > this.schedule.endTime) {
    return false;
  }
  
  // Verificar slots de tiempo específicos
  if (this.schedule.timeSlots.length > 0) {
    const isInTimeSlot = this.schedule.timeSlots.some(slot => 
      currentTime >= slot.start && currentTime <= slot.end
    );
    if (!isInTimeSlot) {
      return false;
    }
  }
  
  return true;
};

// Método para registrar una impresión
advertisementSchema.methods.recordImpression = function(userData: any): void {
  this.tracking.impressions += 1;
  this.displaySettings.currentImpressions += 1;
  
  // Actualizar breakdown por dispositivo
  if (userData.platform === 'android') {
    this.analytics.deviceBreakdown.android += 1;
  } else if (userData.platform === 'ios') {
    this.analytics.deviceBreakdown.ios += 1;
  }
  
  // Actualizar breakdown por ubicación
  if (userData.location) {
    const currentLocationCount = this.analytics.locationBreakdown.get(userData.location) || 0;
    this.analytics.locationBreakdown.set(userData.location, currentLocationCount + 1);
  }
  
  // Actualizar breakdown por hora
  const currentHour = new Date().getHours().toString();
  const currentHourCount = this.analytics.timeBreakdown.get(currentHour) || 0;
  this.analytics.timeBreakdown.set(currentHour, currentHourCount + 1);
  
  // Actualizar breakdown por segmento de usuario
  if (userData.userRole) {
    const currentRoleCount = this.analytics.userSegmentBreakdown.get(userData.userRole) || 0;
    this.analytics.userSegmentBreakdown.set(userData.userRole, currentRoleCount + 1);
  }
  
  // Calcular CTR
  if (this.tracking.impressions > 0) {
    this.tracking.ctr = (this.tracking.clicks / this.tracking.impressions) * 100;
  }
};

// Método para registrar un click
advertisementSchema.methods.recordClick = function(): void {
  this.tracking.clicks += 1;
  this.displaySettings.currentClicks += 1;
  
  // Calcular CTR
  if (this.tracking.impressions > 0) {
    this.tracking.ctr = (this.tracking.clicks / this.tracking.impressions) * 100;
  }
};

// Aplicar plugin de paginación
advertisementSchema.plugin(mongoosePaginate);

const Advertisement = mongoose.model<IAdvertisement>('Advertisement', advertisementSchema);

export default Advertisement;
