import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  isActive: boolean;
  owner: mongoose.Types.ObjectId; // Usuario propietario de la tienda
  managers: mongoose.Types.ObjectId[]; // Gestores de la tienda
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Venezuela'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  banner: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  businessHours: {
    monday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '14:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    taxRate: {
      type: Number,
      default: 16.0, // 16% IVA en Venezuela
      min: 0,
      max: 100
    },
    deliveryRadius: {
      type: Number,
      default: 10, // 10 km
      min: 1,
      max: 50
    },
    minimumOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    autoAcceptOrders: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
StoreSchema.index({ name: 'text', description: 'text' });
StoreSchema.index({ city: 1, state: 1 });
StoreSchema.index({ owner: 1 });
StoreSchema.index({ managers: 1 });
StoreSchema.index({ isActive: 1 });
StoreSchema.index({ coordinates: '2dsphere' }); // Para consultas geográficas

export default mongoose.model<IStore>('Store', StoreSchema);
