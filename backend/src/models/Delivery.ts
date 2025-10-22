import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
  _id: string;
  userId: string; // Referencia al usuario del sistema principal
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: 'cedula' | 'pasaporte' | 'licencia';
    documentNumber: string;
    birthDate: Date;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
  vehicleInfo: {
    type: 'moto' | 'bicicleta' | 'carro' | 'camion';
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
    insurance: {
      company: string;
      policyNumber: string;
      expiryDate: Date;
    };
  };
  workInfo: {
    zones: string[]; // Zonas donde puede trabajar
    maxDistance: number; // Distancia máxima en km
    workSchedule: {
      monday: { start: string; end: string; active: boolean };
      tuesday: { start: string; end: string; active: boolean };
      wednesday: { start: string; end: string; active: boolean };
      thursday: { start: string; end: string; active: boolean };
      friday: { start: string; end: string; active: boolean };
      saturday: { start: string; end: string; active: boolean };
      sunday: { start: string; end: string; active: boolean };
    };
    availabilityStatus: 'available' | 'busy' | 'offline' | 'break';
    currentLocation?: {
      lat: number;
      lng: number;
      lastUpdate: Date;
    };
  };
  performance: {
    rating: number; // 1-5 estrellas
    totalDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    averageDeliveryTime: number; // en minutos
    onTimeDeliveries: number;
    totalEarnings: number;
    totalBonuses: number;
    joinDate: Date;
    lastActiveDate: Date;
  };
  wallet: {
    walletId: string; // Referencia a la wallet del delivery
    currentBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    pendingWithdrawal: number;
  };
  documents: {
    idFront: string; // URL de la imagen
    idBack: string;
    driverLicense: string;
    vehicleRegistration: string;
    insuranceDocument: string;
    backgroundCheck: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
  status: 'pending' | 'approved' | 'suspended' | 'rejected' | 'inactive' | 'assigned' | 'delivered' | 'cancelled';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Properties for delivery orders
  pickupLocation?: {
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryLocation?: {
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryFee?: number;
  riderId?: string;
  riderType?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: {
    type: string;
    brand: string;
    model: string;
    plate: string;
  };
  trackingCode?: string;
  trackingUrl?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  actualPickupTime?: Date;
  riderPayment?: number;
}

const DeliverySchema = new Schema<IDelivery>({
  userId: { type: String, required: true, unique: true },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    documentType: { type: String, enum: ['cedula', 'pasaporte', 'licencia'], required: true },
    documentNumber: { type: String, required: true },
    birthDate: { type: Date, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    }
  },
  vehicleInfo: {
    type: { type: String, enum: ['moto', 'bicicleta', 'carro', 'camion'], required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    plate: { type: String, required: true },
    color: { type: String, required: true },
    insurance: {
      company: { type: String, required: true },
      policyNumber: { type: String, required: true },
      expiryDate: { type: Date, required: true }
    }
  },
  workInfo: {
    zones: [{ type: String, required: true }],
    maxDistance: { type: Number, default: 10 },
    workSchedule: {
      monday: { start: String, end: String, active: { type: Boolean, default: false } },
      tuesday: { start: String, end: String, active: { type: Boolean, default: false } },
      wednesday: { start: String, end: String, active: { type: Boolean, default: false } },
      thursday: { start: String, end: String, active: { type: Boolean, default: false } },
      friday: { start: String, end: String, active: { type: Boolean, default: false } },
      saturday: { start: String, end: String, active: { type: Boolean, default: false } },
      sunday: { start: String, end: String, active: { type: Boolean, default: false } }
    },
    availabilityStatus: { 
      type: String, 
      enum: ['available', 'busy', 'offline', 'break'], 
      default: 'offline' 
    },
    currentLocation: {
      lat: Number,
      lng: Number,
      lastUpdate: Date
    }
  },
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalBonuses: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
    lastActiveDate: { type: Date, default: Date.now }
  },
  wallet: {
    walletId: { type: String, required: true },
    currentBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    pendingWithdrawal: { type: Number, default: 0 }
  },
  documents: {
    idFront: String,
    idBack: String,
    driverLicense: String,
    vehicleRegistration: String,
    insuranceDocument: String,
    backgroundCheck: String,
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    rejectionReason: String
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'suspended', 'rejected', 'inactive'], 
    default: 'pending' 
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'deliverys'
});

// Índices para optimizar consultas
DeliverySchema.index({ userId: 1 });
DeliverySchema.index({ 'workInfo.zones': 1 });
DeliverySchema.index({ 'workInfo.availabilityStatus': 1 });
DeliverySchema.index({ 'workInfo.currentLocation': '2dsphere' });
DeliverySchema.index({ status: 1, isActive: 1 });
DeliverySchema.index({ 'performance.rating': -1 });

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);