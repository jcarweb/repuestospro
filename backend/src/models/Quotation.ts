import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  productOriginalCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  title: string;
  description?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  items: IQuotationItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  currency: string;
  validityDays: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  terms?: string;
  conditions?: string;
  createdBy: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productSku: {
    type: String,
    required: true
  },
  productOriginalCode: {
    type: String
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
  specifications: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  notes: {
    type: String,
    trim: true
  }
});

const QuotationSchema = new Schema<IQuotation>({
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  customer: {
    name: {
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
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  items: [QuotationItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  validityDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  conditions: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  sentAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
QuotationSchema.index({ quotationNumber: 1 });
QuotationSchema.index({ createdBy: 1 });
QuotationSchema.index({ store: 1 });
QuotationSchema.index({ status: 1 });
QuotationSchema.index({ validUntil: 1 });
QuotationSchema.index({ 'customer.email': 1 });
QuotationSchema.index({ createdAt: -1 });

// Middleware para generar número de cotización
QuotationSchema.pre('save', async function(next) {
  if (this.isNew && !this.quotationNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.quotationNumber = `COT-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Middleware para calcular fechas de expiración
QuotationSchema.pre('save', function(next) {
  if (this.isModified('validityDays') || this.isNew) {
    this.validUntil = new Date();
    this.validUntil.setDate(this.validUntil.getDate() + this.validityDays);
    this.expiresAt = this.validUntil;
  }
  next();
});

// Middleware para calcular totales
QuotationSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('taxRate') || this.isModified('discountRate')) {
    // Calcular subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calcular impuestos
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    
    // Calcular descuentos
    this.discountAmount = (this.subtotal * this.discountRate) / 100;
    
    // Calcular total
    this.total = this.subtotal + this.taxAmount - this.discountAmount;
  }
  next();
});

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);
