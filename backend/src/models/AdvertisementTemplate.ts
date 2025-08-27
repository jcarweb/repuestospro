import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvertisementTemplate extends Document {
  name: string;
  description: string;
  type: 'basic_banner' | 'product_highlight' | 'promotion_card' | 'featured_item';
  category: 'self_managed' | 'premium_managed';
  previewImage: string;
  template: {
    html: string;
    css: string;
    js?: string;
  };
  defaultColors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  customizableFields: string[]; // campos que el usuario puede personalizar
  zones: string[]; // zonas donde se puede mostrar
  maxDuration: number; // duración máxima en días
  minDuration: number; // duración mínima en días
  pricing: {
    basePrice: number;
    pricePerDay: number;
    currency: string;
  };
  requirements: {
    minImageWidth: number;
    minImageHeight: number;
    maxFileSize: number; // en MB
    supportedFormats: string[];
  };
  isActive: boolean;
  isDefault: boolean; // si es una plantilla por defecto del sistema
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const advertisementTemplateSchema = new Schema<IAdvertisementTemplate>({
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
    enum: ['basic_banner', 'product_highlight', 'promotion_card', 'featured_item'],
    required: true
  },
  category: {
    type: String,
    enum: ['self_managed', 'premium_managed'],
    required: true,
    default: 'self_managed'
  },
  previewImage: {
    type: String,
    required: true
  },
  template: {
    html: {
      type: String,
      required: true
    },
    css: {
      type: String,
      required: true
    },
    js: {
      type: String
    }
  },
  defaultColors: {
    primary: {
      type: String,
      default: '#3B82F6'
    },
    secondary: {
      type: String,
      default: '#1E40AF'
    },
    text: {
      type: String,
      default: '#FFFFFF'
    },
    background: {
      type: String,
      default: '#F3F4F6'
    }
  },
  customizableFields: [{
    type: String,
    enum: ['title', 'description', 'image', 'colors', 'duration', 'zones', 'product']
  }],
  zones: [{
    type: String,
    enum: ['home', 'search', 'category', 'product', 'checkout']
  }],
  maxDuration: {
    type: Number,
    min: 1,
    max: 365,
    default: 30
  },
  minDuration: {
    type: Number,
    min: 1,
    max: 365,
    default: 1
  },
  pricing: {
    basePrice: {
      type: Number,
      min: 0,
      default: 0
    },
    pricePerDay: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: {
    minImageWidth: {
      type: Number,
      default: 300
    },
    minImageHeight: {
      type: Number,
      default: 200
    },
    maxFileSize: {
      type: Number,
      default: 5 // 5MB
    },
    supportedFormats: [{
      type: String,
      enum: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
advertisementTemplateSchema.index({ type: 1, category: 1, isActive: 1 });
advertisementTemplateSchema.index({ isDefault: 1, isActive: 1 });

export default mongoose.model<IAdvertisementTemplate>('AdvertisementTemplate', advertisementTemplateSchema);
