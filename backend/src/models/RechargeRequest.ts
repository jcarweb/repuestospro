import mongoose, { Document, Schema } from 'mongoose';

export interface IRechargeRequest extends Document {
  _id: string;
  storeId: string;
  userId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'VES';
  targetCurrency: 'USD' | 'VES';
  exchangeRate?: number;
  convertedAmount?: number;
  paymentMethod: 'paypal' | 'stripe' | 'zelle' | 'bank_transfer' | 'pago_movil';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentReference?: string;
  paymentProof?: string;
  paymentProofUrl?: string;
  rejectionReason?: string;
  adminNotes?: string;
  validatedBy?: string;
  validatedAt?: Date;
  paymentInstructions?: {
    accountNumber?: string;
    bankName?: string;
    beneficiaryName?: string;
    email?: string;
    phoneNumber?: string;
    reference?: string;
  };
  webhookData?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RechargeRequestSchema = new Schema<IRechargeRequest>({
  storeId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Store',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'VES'],
    required: true
  },
  targetCurrency: {
    type: String,
    enum: ['USD', 'VES'],
    required: true
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  convertedAmount: {
    type: Number,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'zelle', 'bank_transfer', 'pago_movil'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentReference: {
    type: String,
    sparse: true
  },
  paymentProof: {
    type: String
  },
  paymentProofUrl: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  adminNotes: {
    type: String
  },
  validatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  paymentInstructions: {
    accountNumber: String,
    bankName: String,
    beneficiaryName: String,
    email: String,
    phoneNumber: String,
    reference: String
  },
  webhookData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
RechargeRequestSchema.index({ storeId: 1, status: 1 });
RechargeRequestSchema.index({ userId: 1, createdAt: -1 });
RechargeRequestSchema.index({ paymentMethod: 1, status: 1 });
RechargeRequestSchema.index({ createdAt: -1 });

export default mongoose.model<IRechargeRequest>('RechargeRequest', RechargeRequestSchema);
