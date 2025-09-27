import mongoose, { Schema, Document } from 'mongoose';

export interface IRider extends Document {
  // Información básica
  userId?: mongoose.Types.ObjectId; // Para riders internos
  externalId?: string; // Para riders externos
  type: 'internal' | 'external';
  
  // Datos personales
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string; // Cédula o documento de identidad
  dateOfBirth: Date;
  
  // Información del vehículo
  vehicle: {
    type: 'motorcycle' | 'bicycle' | 'car';
    brand?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
    insurance?: {
      company: string;
      policyNumber: string;
      expiryDate: Date;
    };
  };
  
  // Documentos
  documents: {
    idCard: {
      front: string;
      back: string;
      verified: boolean;
    };
    driverLicense?: {
      front: string;
      back: string;
      verified: boolean;
      expiryDate: Date;
    };
    vehicleRegistration?: {
      front: string;
      back: string;
      verified: boolean;
    };
    insurance?: {
      document: string;
      verified: boolean;
    };
    backgroundCheck?: {
      document: string;
      verified: boolean;
      expiryDate: Date;
    };
  };
  
  // Estado y disponibilidad
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
      timestamp: Date;
    };
    workingHours: {
      start: string; // HH:MM
      end: string; // HH:MM
      days: number[]; // 0-6 (Domingo-Sábado)
    };
    maxDistance: number; // km
    maxOrdersPerDay: number;
  };
  
  // Calificaciones y rendimiento
  rating: {
    average: number;
    totalReviews: number;
    lastUpdated: Date;
  };
  
  // Estadísticas
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    totalEarnings: number;
    totalDistance: number; // km
    averageDeliveryTime: number; // minutos
    onTimeDeliveries: number;
    lateDeliveries: number;
  };
  
  // Configuración de pagos
  payment: {
    method: 'cash' | 'bank_transfer' | 'mobile_payment';
    bankAccount?: {
      bank: string;
      accountNumber: string;
      accountType: string;
    };
    mobilePayment?: {
      provider: string;
      phone: string;
    };
    commissionRate: number; // Porcentaje que recibe el rider
    minimumPayout: number;
  };
  
  // Para riders externos
  externalProvider?: {
    name: string;
    type: 'mototaxista' | 'courier' | 'independent';
    agreementId?: string;
    commissionRate: number;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
  };
  
  // Zonas de trabajo
  serviceAreas: Array<{
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    radius: number; // km
    isActive: boolean;
  }>;
  
  // Configuración de notificaciones
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  
  // Historial de estados
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    reason?: string;
    updatedBy?: string;
  }>;
  
  // Configuración de la app
  appSettings: {
    language: string;
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    autoAcceptOrders: boolean;
    maxConcurrentOrders: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema = new Schema<IRider>({
  // Información básica
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  externalId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    enum: ['internal', 'external'],
    required: true,
    index: true
  },
  
  // Datos personales
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  // Información del vehículo
  vehicle: {
    type: {
      type: String,
      enum: ['motorcycle', 'bicycle', 'car'],
      required: true
    },
    brand: String,
    model: String,
    year: Number,
    plate: String,
    color: String,
    insurance: {
      company: String,
      policyNumber: String,
      expiryDate: Date
    }
  },
  
  // Documentos
  documents: {
    idCard: {
      front: { type: String, required: true },
      back: { type: String, required: true },
      verified: { type: Boolean, default: false }
    },
    driverLicense: {
      front: String,
      back: String,
      verified: { type: Boolean, default: false },
      expiryDate: Date
    },
    vehicleRegistration: {
      front: String,
      back: String,
      verified: { type: Boolean, default: false }
    },
    insurance: {
      document: String,
      verified: { type: Boolean, default: false }
    },
    backgroundCheck: {
      document: String,
      verified: { type: Boolean, default: false },
      expiryDate: Date
    }
  },
  
  // Estado y disponibilidad
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification',
    index: true
  },
  availability: {
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: false },
    currentLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date
    },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5, 6, 0] } // Lunes a Domingo
    },
    maxDistance: { type: Number, default: 10 }, // 10 km
    maxOrdersPerDay: { type: Number, default: 20 }
  },
  
  // Calificaciones y rendimiento
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Estadísticas
  stats: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    lateDeliveries: { type: Number, default: 0 }
  },
  
  // Configuración de pagos
  payment: {
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'mobile_payment'],
      default: 'cash'
    },
    bankAccount: {
      bank: String,
      accountNumber: String,
      accountType: String
    },
    mobilePayment: {
      provider: String,
      phone: String
    },
    commissionRate: { type: Number, default: 80, min: 0, max: 100 }, // 80% por defecto
    minimumPayout: { type: Number, default: 50 }
  },
  
  // Para riders externos
  externalProvider: {
    name: String,
    type: {
      type: String,
      enum: ['mototaxista', 'courier', 'independent']
    },
    agreementId: String,
    commissionRate: { type: Number, min: 0, max: 100 },
    contactPerson: String,
    contactPhone: String,
    contactEmail: String
  },
  
  // Zonas de trabajo
  serviceAreas: [{
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    radius: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  }],
  
  // Configuración de notificaciones
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false }
  },
  
  // Historial de estados
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: String,
    updatedBy: String
  }],
  
  // Configuración de la app
  appSettings: {
    language: { type: String, default: 'es' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    soundEnabled: { type: Boolean, default: true },
    vibrationEnabled: { type: Boolean, default: true },
    autoAcceptOrders: { type: Boolean, default: false },
    maxConcurrentOrders: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Índices compuestos
RiderSchema.index({ status: 1, 'availability.isOnline': 1 });
RiderSchema.index({ status: 1, 'availability.isAvailable': 1 });
RiderSchema.index({ type: 1, status: 1 });
RiderSchema.index({ 'rating.average': -1 });

// Método para calcular distancia desde una ubicación
RiderSchema.methods['calculateDistanceFrom'] = function(lat: number, lng: number): number {
  if (!this['availability'].currentLocation) {
    return Infinity;
  }
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat - this['availability'].currentLocation.lat) * Math.PI / 180;
  const dLng = (lng - this['availability'].currentLocation.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this['availability'].currentLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Método para verificar si está en zona de servicio
RiderSchema.methods['isInServiceArea'] = function(lat: number, lng: number): boolean {
  return (this['serviceAreas'] as any[]).some(area => {
    if (!area.isActive) return false;
    const distance = this['calculateDistanceFrom'](area.coordinates.lat, area.coordinates.lng);
    return distance <= area.radius;
  });
};

// Método para actualizar estado
RiderSchema.methods['updateStatus'] = function(newStatus: string, reason?: string, updatedBy?: string) {
  this['status'] = newStatus;
  this['statusHistory'].push({
    status: newStatus,
    timestamp: new Date(),
    reason,
    updatedBy
  });
  return this['save']();
};

// Método para actualizar ubicación
RiderSchema.methods['updateLocation'] = function(lat: number, lng: number) {
  this['availability'].currentLocation = {
    lat,
    lng,
    timestamp: new Date()
  };
  return this['save']();
};

// Método para calcular comisión
RiderSchema.methods['calculateCommission'] = function(orderAmount: number): number {
  const commissionRate = this['type'] === 'external' && this['externalProvider']
    ? this['externalProvider'].commissionRate
    : this['payment'].commissionRate;
  return (orderAmount * commissionRate) / 100;
};

export default mongoose.model<IRider>('Rider', RiderSchema);
