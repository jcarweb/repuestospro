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
  phoneLocal?: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  isActive: boolean;
  owner: mongoose.Types.ObjectId; // Usuario propietario de la tienda
  managers: mongoose.Types.ObjectId[]; // Gestores de la tienda
  coordinates: {
    latitude: number;
    longitude: number;
  };
  // Referencias a las divisiones administrativas
  stateRef: mongoose.Types.ObjectId; // Referencia al Estado
  municipalityRef: mongoose.Types.ObjectId; // Referencia al Municipio
  parishRef: mongoose.Types.ObjectId; // Referencia a la Parroquia
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
  phoneLocal: {
    type: String,
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
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    tiktok: {
      type: String,
      trim: true
    }
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
  // Referencias a las divisiones administrativas
  stateRef: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  municipalityRef: {
    type: Schema.Types.ObjectId,
    ref: 'Municipality',
    required: true
  },
  parishRef: {
    type: Schema.Types.ObjectId,
    ref: 'Parish',
    required: true
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

// Índices para búsquedas por división administrativa
StoreSchema.index({ stateRef: 1 });
StoreSchema.index({ municipalityRef: 1 });
StoreSchema.index({ parishRef: 1 });
StoreSchema.index({ stateRef: 1, municipalityRef: 1 });
StoreSchema.index({ stateRef: 1, municipalityRef: 1, parishRef: 1 });

export default mongoose.model<IStore>('Store', StoreSchema);
