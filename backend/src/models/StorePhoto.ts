import mongoose, { Document, Schema } from 'mongoose';

export interface IStorePhoto extends Document {
  name: string;
  phone?: string;
  imageUrl: string;
  lat: number;
  lng: number;
  ocrText?: string;
  metrics: {
    mercadoLibre?: {
      found: boolean;
      results?: any[];
      searchTerm?: string;
      lastUpdated?: Date;
    };
    duckduckgo?: {
      found: boolean;
      results?: any[];
      searchTerm?: string;
      lastUpdated?: Date;
    };
    instagram?: {
      found: boolean;
      followers?: number;
      username?: string;
      lastUpdated?: Date;
    };
    whatsapp?: {
      found: boolean;
      businessInfo?: any;
      lastUpdated?: Date;
    };
  };
  status: 'pending' | 'processing' | 'enriched' | 'error';
  errorMessage?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const storePhotoSchema = new Schema<IStorePhoto>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  ocrText: {
    type: String,
    default: ''
  },
  metrics: {
    mercadoLibre: {
      found: {
        type: Boolean,
        default: false
      },
      results: [Schema.Types.Mixed],
      searchTerm: String,
      lastUpdated: Date
    },
    duckduckgo: {
      found: {
        type: Boolean,
        default: false
      },
      results: [Schema.Types.Mixed],
      searchTerm: String,
      lastUpdated: Date
    },
    instagram: {
      found: {
        type: Boolean,
        default: false
      },
      followers: Number,
      username: String,
      lastUpdated: Date
    },
    whatsapp: {
      found: {
        type: Boolean,
        default: false
      },
      businessInfo: Schema.Types.Mixed,
      lastUpdated: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'enriched', 'error'],
    default: 'pending'
  },
  errorMessage: {
    type: String
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
storePhotoSchema.index({ status: 1 });
storePhotoSchema.index({ uploadedBy: 1 });
storePhotoSchema.index({ lat: 1, lng: 1 });
storePhotoSchema.index({ createdAt: -1 });

export default mongoose.model<IStorePhoto>('StorePhoto', storePhotoSchema);
