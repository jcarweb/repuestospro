import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  transactionNumber: string;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  
  // Información de productos
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    warrantyIncluded?: boolean;
    warrantyType?: string;
    warrantyCost?: number;
  }>;
  
  // Información financiera
  subtotal: number;
  taxAmount: number;
  commissionAmount: number;
  warrantyTotal: number;
  totalAmount: number;
  currency: string;
  
  // Estado de la transacción
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Información de envío
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  
  // Información de garantía
  warrantyEnabled: boolean;
  warrantyLevel: 'basic' | 'premium' | 'extended' | 'none';
  warrantyCoverage: number;
  
  // Fechas importantes
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Metadatos
  notes?: string;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  storeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  },
  
  // Información de productos
  items: [{
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    productName: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    unitPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    warrantyIncluded: { 
      type: Boolean, 
      default: false 
    },
    warrantyType: { 
      type: String, 
      enum: ['basic', 'premium', 'extended', 'none'],
      default: 'none'
    },
    warrantyCost: { 
      type: Number, 
      min: 0, 
      default: 0 
    }
  }],
  
  // Información financiera
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  taxAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  commissionAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  warrantyTotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  
  // Estado de la transacción
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Información de envío
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  
  // Información de garantía
  warrantyEnabled: { 
    type: Boolean, 
    default: false 
  },
  warrantyLevel: { 
    type: String, 
    enum: ['basic', 'premium', 'extended', 'none'],
    default: 'none'
  },
  warrantyCoverage: { 
    type: Number, 
    min: 0, 
    default: 0 
  },
  
  // Fechas importantes
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  cancelledAt: { 
    type: Date 
  },
  
  // Metadatos
  notes: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
TransactionSchema.index({ transactionNumber: 1 }, { unique: true });
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ storeId: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ status: 1, paymentStatus: 1 });
TransactionSchema.index({ warrantyEnabled: 1 });

// Métodos de instancia
TransactionSchema.methods.calculateTotal = function(): number {
  return this.subtotal + this.taxAmount + this.commissionAmount + this.warrantyTotal;
};

TransactionSchema.methods.isWarrantyEligible = function(): boolean {
  return this.warrantyEnabled && this.warrantyLevel !== 'none' && this.warrantyCoverage > 0;
};

TransactionSchema.methods.canBeCancelled = function(): boolean {
  return ['pending', 'processing'].includes(this.status);
};

TransactionSchema.methods.canBeRefunded = function(): boolean {
  return this.status === 'completed' && this.paymentStatus === 'completed';
};

// Middleware pre-save para actualizar updatedAt
TransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware pre-save para generar número de transacción
TransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionNumber) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.transactionNumber = `TXN-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
