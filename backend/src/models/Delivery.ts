import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  storeId: mongoose.Schema.Types.ObjectId;
  customerId: mongoose.Schema.Types.ObjectId;
  
  // Información del rider
  riderId?: mongoose.Schema.Types.ObjectId; // Para riders internos
  externalRiderId?: string; // Para riders externos
  riderType: 'internal' | 'external';
  riderName: string;
  riderPhone: string;
  riderVehicle?: {
    type: 'motorcycle' | 'bicycle' | 'car';
    plate?: string;
    model?: string;
  };
  
  // Estado del delivery
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  
  // Ubicaciones
  pickupLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    storeName: string;
  };
  
  deliveryLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    customerName: string;
    customerPhone: string;
    instructions?: string;
  };
  
  // Tiempos
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  
  // Costos
  deliveryFee: number;
  riderPayment: number;
  platformFee: number;
  
  // Calificaciones
  customerRating?: number;
  customerReview?: string;
  riderRating?: number;
  riderReview?: string;
  
  // Tracking
  trackingCode: string;
  trackingUrl?: string;
  
  // Notificaciones
  notifications: {
    customerSmsSent: boolean;
    customerEmailSent: boolean;
    riderSmsSent: boolean;
    riderWhatsappSent: boolean;
  };
  
  // Configuración de asignación
  assignmentConfig: {
    priority: 'internal_first' | 'external_first' | 'mixed';
    internalPercentage: number; // 0-100
    maxWaitTime: number; // minutos
    maxDistance: number; // km
  };
  
  // Historial de estados
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    notes?: string;
    updatedBy?: string;
  }>;
  
  // Para riders externos
  externalProvider?: {
    name: string;
    type: 'mototaxista' | 'courier' | 'independent';
    agreementId?: string;
    commissionRate: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Información del rider
  riderId: {
    type: Schema.Types.ObjectId,
    ref: 'Rider',
    index: true
  },
  externalRiderId: {
    type: String,
    index: true
  },
  riderType: {
    type: String,
    enum: ['internal', 'external'],
    required: true,
    index: true
  },
  riderName: {
    type: String,
    required: true
  },
  riderPhone: {
    type: String,
    required: true
  },
  riderVehicle: {
    type: {
      type: String,
      enum: ['motorcycle', 'bicycle', 'car']
    },
    plate: String,
    model: String
  },
  
  // Estado del delivery
  status: {
    type: String,
    enum: ['pending', 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'],
    default: 'pending',
    index: true
  },
  
  // Ubicaciones
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    storeName: { type: String, required: true }
  },
  
  deliveryLocation: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    instructions: String
  },
  
  // Tiempos
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  
  // Costos
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },
  riderPayment: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Calificaciones
  customerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  customerReview: String,
  riderRating: {
    type: Number,
    min: 1,
    max: 5
  },
  riderReview: String,
  
  // Tracking
  trackingCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  trackingUrl: String,
  
  // Notificaciones
  notifications: {
    customerSmsSent: { type: Boolean, default: false },
    customerEmailSent: { type: Boolean, default: false },
    riderSmsSent: { type: Boolean, default: false },
    riderWhatsappSent: { type: Boolean, default: false }
  },
  
  // Configuración de asignación
  assignmentConfig: {
    priority: {
      type: String,
      enum: ['internal_first', 'external_first', 'mixed'],
      default: 'internal_first'
    },
    internalPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    maxWaitTime: {
      type: Number,
      min: 1,
      default: 15 // 15 minutos
    },
    maxDistance: {
      type: Number,
      min: 1,
      default: 10 // 10 km
    }
  },
  
  // Historial de estados
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: String,
    updatedBy: String
  }],
  
  // Para riders externos
  externalProvider: {
    name: String,
    type: {
      type: String,
      enum: ['mototaxista', 'courier', 'independent']
    },
    agreementId: String,
    commissionRate: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
DeliverySchema.index({ status: 1, createdAt: -1 });
DeliverySchema.index({ storeId: 1, status: 1 });
DeliverySchema.index({ riderId: 1, status: 1 });
DeliverySchema.index({ trackingCode: 1 });

// Método para generar código de tracking único
DeliverySchema.methods['generateTrackingCode'] = function(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `DEL-${timestamp}-${random}`.toUpperCase();
};

// Método para calcular distancia entre dos puntos
DeliverySchema.methods['calculateDistance'] = function(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Método para actualizar estado
DeliverySchema.methods['updateStatus'] = function(newStatus: string, notes?: string, updatedBy?: string) {
  this['status'] = newStatus;
  this['statusHistory'].push({
    status: newStatus,
    timestamp: new Date(),
    notes,
    updatedBy
  });
  return this['save']();
};

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);
