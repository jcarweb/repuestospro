import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  customText?: string;
  products: mongoose.Types.ObjectId[];
  categories?: mongoose.Types.ObjectId[];
  startDate: Date;
  startTime: String; // HH:mm format
  endDate: Date;
  endTime: String; // HH:mm format
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  ribbonText: string;
  ribbonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOriginalPrice: boolean;
  showDiscountAmount: boolean;
  maxUses?: number;
  currentUses: number;
  createdAt: Date;
  updatedAt: Date;
}



const PromotionSchema = new Schema<IPromotion>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'buy_x_get_y', 'custom'],
    required: true
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    validate: {
      validator: function(this: IPromotion, value: number) {
        if (this.type === 'percentage' && (value < 0 || value > 100)) {
          return false;
        }
        return true;
      },
      message: 'El porcentaje de descuento debe estar entre 0 y 100'
    }
  },
  discountAmount: {
    type: Number,
    min: 0,
    validate: {
      validator: function(this: IPromotion, value: number) {
        if (this.type === 'fixed' && value < 0) {
          return false;
        }
        return true;
      },
      message: 'El monto de descuento debe ser mayor a 0'
    }
  },
  buyQuantity: {
    type: Number,
    min: 1,
    validate: {
      validator: function(this: IPromotion, value: number) {
        if (this.type === 'buy_x_get_y' && value < 1) {
          return false;
        }
        return true;
      },
      message: 'La cantidad a comprar debe ser mayor a 0'
    }
  },
  getQuantity: {
    type: Number,
    min: 1,
    validate: {
      validator: function(this: IPromotion, value: number) {
        if (this.type === 'buy_x_get_y' && value < 1) {
          return false;
        }
        return true;
      },
      message: 'La cantidad a obtener debe ser mayor a 0'
    }
  },
  customText: {
    type: String,
    trim: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  startDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    default: '00:00',
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
      },
      message: 'El formato de hora debe ser HH:mm (ej: 09:30)'
    }
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IPromotion, value: Date) {
        return value > this.startDate;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  endTime: {
    type: String,
    default: '23:59',
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
      },
      message: 'El formato de hora debe ser HH:mm (ej: 18:30)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ribbonText: {
    type: String,
    default: 'PROMO',
    trim: true
  },
  ribbonPosition: {
    type: String,
    enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    default: 'top-left'
  },
  showOriginalPrice: {
    type: Boolean,
    default: true
  },
  showDiscountAmount: {
    type: Boolean,
    default: true
  },
  maxUses: {
    type: Number,
    min: 1
  },
  currentUses: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ products: 1 });
PromotionSchema.index({ categories: 1 });
PromotionSchema.index({ createdBy: 1 });

// Método para verificar si la promoción está vigente
PromotionSchema.methods.isValid = function(): boolean {
  const now = new Date();
  const startDateTime = new Date(this.startDate);
  const endDateTime = new Date(this.endDate);
  
  // Configurar las horas si están definidas
  if (this.startTime) {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);
  }
  
  if (this.endTime) {
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 59, 999);
  }
  
  return this.isActive && 
         now >= startDateTime && 
         now <= endDateTime &&
         (!this.maxUses || this.currentUses < this.maxUses);
};

// Método para calcular el precio con descuento
PromotionSchema.methods.calculateDiscountedPrice = function(originalPrice: number): number {
  if (this.type === 'percentage' && this.discountPercentage) {
    return originalPrice * (1 - this.discountPercentage / 100);
  } else if (this.type === 'fixed' && this.discountAmount) {
    return Math.max(0, originalPrice - this.discountAmount);
  }
  return originalPrice;
};

// Método para obtener el texto de descuento
PromotionSchema.methods.getDiscountText = function(originalPrice: number): string {
  if (this.type === 'percentage' && this.discountPercentage) {
    return `-${this.discountPercentage}%`;
  } else if (this.type === 'fixed' && this.discountAmount) {
    return `-$${this.discountAmount.toFixed(2)}`;
  } else if (this.type === 'buy_x_get_y' && this.buyQuantity && this.getQuantity) {
    return `${this.buyQuantity}x${this.getQuantity}`;
  } else if (this.type === 'custom' && this.customText) {
    return this.customText;
  }
  return this.ribbonText;
};

export default mongoose.model<IPromotion>('Promotion', PromotionSchema); 