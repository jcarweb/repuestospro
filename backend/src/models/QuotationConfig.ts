import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotationConfig extends Document {
  store: mongoose.Types.ObjectId;
  defaultValidityDays: number;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  defaultCurrency: string;
  defaultTerms: string;
  defaultConditions: string;
  emailTemplate: {
    subject: string;
    body: string;
  };
  whatsappTemplate: string;
  pdfTemplate: {
    header: string;
    footer: string;
    logo?: string;
    companyInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
      website?: string;
    };
  };
  autoExpireDays: number;
  allowCustomerAcceptance: boolean;
  requireCustomerSignature: boolean;
  notificationSettings: {
    emailOnSent: boolean;
    emailOnViewed: boolean;
    emailOnAccepted: boolean;
    emailOnRejected: boolean;
    emailOnExpired: boolean;
    whatsappOnSent: boolean;
    whatsappOnViewed: boolean;
    whatsappOnAccepted: boolean;
    whatsappOnRejected: boolean;
    whatsappOnExpired: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationConfigSchema = new Schema<IQuotationConfig>({
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    unique: true
  },
  defaultValidityDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365
  },
  defaultTaxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  defaultDiscountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  defaultCurrency: {
    type: String,
    default: 'USD',
    trim: true
  },
  defaultTerms: {
    type: String,
    default: 'Este presupuesto posee una validez de {validityDays} días y los precios están sujetos a cambios sin previo aviso.',
    trim: true
  },
  defaultConditions: {
    type: String,
    default: 'Los precios incluyen IVA. El pago debe realizarse según las condiciones acordadas. Los productos están sujetos a disponibilidad.',
    trim: true
  },
  emailTemplate: {
    subject: {
      type: String,
      default: 'Presupuesto #{quotationNumber} - {companyName}',
      trim: true
    },
    body: {
      type: String,
      default: 'Estimado/a {customerName},\n\nAdjunto encontrará el presupuesto solicitado.\n\nDetalles:\n- Número: {quotationNumber}\n- Total: {total}\n- Válido hasta: {validUntil}\n\nSaludos cordiales,\n{companyName}',
      trim: true
    }
  },
  whatsappTemplate: {
    type: String,
    default: 'Hola {customerName}, le enviamos su presupuesto #{quotationNumber} por un total de {total}. Válido hasta {validUntil}. Para más información, contáctenos.',
    trim: true
  },
  pdfTemplate: {
    header: {
      type: String,
      default: 'PRESUPUESTO',
      trim: true
    },
    footer: {
      type: String,
      default: 'Gracias por su confianza',
      trim: true
    },
    logo: {
      type: String,
      trim: true
    },
    companyInfo: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true
      },
      website: {
        type: String,
        trim: true
      }
    }
  },
  autoExpireDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 30
  },
  allowCustomerAcceptance: {
    type: Boolean,
    default: true
  },
  requireCustomerSignature: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    emailOnSent: {
      type: Boolean,
      default: true
    },
    emailOnViewed: {
      type: Boolean,
      default: false
    },
    emailOnAccepted: {
      type: Boolean,
      default: true
    },
    emailOnRejected: {
      type: Boolean,
      default: true
    },
    emailOnExpired: {
      type: Boolean,
      default: true
    },
    whatsappOnSent: {
      type: Boolean,
      default: false
    },
    whatsappOnViewed: {
      type: Boolean,
      default: false
    },
    whatsappOnAccepted: {
      type: Boolean,
      default: false
    },
    whatsappOnRejected: {
      type: Boolean,
      default: false
    },
    whatsappOnExpired: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices
QuotationConfigSchema.index({ store: 1 });

export const QuotationConfig = mongoose.model<IQuotationConfig>('QuotationConfig', QuotationConfigSchema);
