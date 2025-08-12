import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralTracking extends Document {
  referralCode: string;
  referrerId: mongoose.Types.ObjectId;
  referrerName: string;
  referrerEmail: string;
  platform: 'whatsapp' | 'facebook' | 'twitter' | 'email' | 'sms' | 'link' | 'manual';
  shareUrl: string;
  shareText: string;
  clicks: number;
  registrations: number;
  successfulRegistrations: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const referralTrackingSchema = new Schema<IReferralTracking>({
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  referrerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referrerName: {
    type: String,
    required: true
  },
  referrerEmail: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['whatsapp', 'facebook', 'twitter', 'email', 'sms', 'link', 'manual']
  },
  shareUrl: {
    type: String,
    required: true
  },
  shareText: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  registrations: {
    type: Number,
    default: 0
  },
  successfulRegistrations: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsSpent: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
referralTrackingSchema.index({ referralCode: 1 });
referralTrackingSchema.index({ referrerId: 1 });
referralTrackingSchema.index({ platform: 1 });
referralTrackingSchema.index({ createdAt: -1 });
referralTrackingSchema.index({ isActive: 1 });

const ReferralTracking = mongoose.model<IReferralTracking>('ReferralTracking', referralTrackingSchema);

export default ReferralTracking; 