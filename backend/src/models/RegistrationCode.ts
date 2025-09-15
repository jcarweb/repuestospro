import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistrationCode extends Document {
  code: string;
  email: string;
  role: 'admin' | 'store_manager' | 'delivery' | 'seller';
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  sentAt: Date;
  clickedAt?: Date;
  registrationStartedAt?: Date;
  registrationCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationCodeSchema = new Schema<IRegistrationCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'store_manager', 'delivery', 'seller']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'used', 'expired', 'revoked'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  clickedAt: {
    type: Date
  },
  registrationStartedAt: {
    type: Date
  },
  registrationCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
registrationCodeSchema.index({ code: 1 });
registrationCodeSchema.index({ email: 1 });
registrationCodeSchema.index({ status: 1 });
registrationCodeSchema.index({ role: 1 });
registrationCodeSchema.index({ expiresAt: 1 });
registrationCodeSchema.index({ createdBy: 1 });
registrationCodeSchema.index({ createdAt: -1 });

// Remover el middleware problemático que interfiere con otras consultas
// registrationCodeSchema.pre('find', function() {
//   this.where({ expiresAt: { $gt: new Date() } });
// });

// registrationCodeSchema.pre('findOne', function() {
//   this.where({ expiresAt: { $gt: new Date() } });
// });

const RegistrationCode = mongoose.model<IRegistrationCode>('RegistrationCode', registrationCodeSchema);

export default RegistrationCode; 