import mongoose, { Document, Schema } from 'mongoose';

export interface IExchangeRate extends Document {
  currency: string;
  rate: number;
  source: string;
  sourceUrl: string;
  lastUpdated: Date;
  isActive: boolean;
  manualOverride: boolean;
  overrideReason?: string;
  overrideBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const exchangeRateSchema = new Schema<IExchangeRate>({
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'COP', 'PEN', 'CLP', 'ARS', 'BRL'],
    default: 'USD'
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true,
    default: 'BCV'
  },
  sourceUrl: {
    type: String,
    required: true,
    default: 'https://www.bcv.org.ve/'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  manualOverride: {
    type: Boolean,
    default: false
  },
  overrideReason: {
    type: String,
    trim: true
  },
  overrideBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
exchangeRateSchema.index({ currency: 1, isActive: 1 });
exchangeRateSchema.index({ lastUpdated: -1 });

export default mongoose.model<IExchangeRate>('ExchangeRate', exchangeRateSchema);
