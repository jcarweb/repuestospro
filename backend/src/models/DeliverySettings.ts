import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliverySettings extends Document {
  _id: string;
  deliveryId: string;
  maxDistance: number;
  maxConcurrentDeliveries: number;
  preferredZones: string[];
  workSchedule: {
    monday: { start: string; end: string; active: boolean };
    tuesday: { start: string; end: string; active: boolean };
    wednesday: { start: string; end: string; active: boolean };
    thursday: { start: string; end: string; active: boolean };
    friday: { start: string; end: string; active: boolean };
    saturday: { start: string; end: string; active: boolean };
    sunday: { start: string; end: string; active: boolean };
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  paymentSettings: {
    preferredPaymentMethod: 'cash' | 'digital' | 'both';
    minimumPayment: number;
    autoWithdraw: boolean;
    withdrawThreshold: number;
  };
  baseRates: {
    baseDeliveryFee: number;
    minimumDeliveryFee: number;
    distanceRate: number;
    timeRate: number;
    peakHoursMultiplier: number;
    weatherMultiplier: number;
  };
  system: {
    commissionDeductionRate: number;
  };
  withdrawals: {
    minimumAmount: number;
    maximumAmount: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySettingsSchema = new Schema<IDeliverySettings>({
  deliveryId: { type: String, required: true, unique: true },
  maxDistance: { type: Number, default: 10 },
  maxConcurrentDeliveries: { type: Number, default: 3 },
  preferredZones: [{ type: String }],
  workSchedule: {
    monday: { start: String, end: String, active: Boolean },
    tuesday: { start: String, end: String, active: Boolean },
    wednesday: { start: String, end: String, active: Boolean },
    thursday: { start: String, end: String, active: Boolean },
    friday: { start: String, end: String, active: Boolean },
    saturday: { start: String, end: String, active: Boolean },
    sunday: { start: String, end: String, active: Boolean }
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true }
  },
  paymentSettings: {
    preferredPaymentMethod: { type: String, enum: ['cash', 'digital', 'both'], default: 'both' },
    minimumPayment: { type: Number, default: 5 },
    autoWithdraw: { type: Boolean, default: false },
    withdrawThreshold: { type: Number, default: 50 }
  },
  baseRates: {
    baseDeliveryFee: { type: Number, default: 2.0 },
    minimumDeliveryFee: { type: Number, default: 1.0 },
    distanceRate: { type: Number, default: 0.5 },
    timeRate: { type: Number, default: 0.1 },
    peakHoursMultiplier: { type: Number, default: 1.5 },
    weatherMultiplier: { type: Number, default: 1.2 }
  },
  system: {
    commissionDeductionRate: { type: Number, default: 0.1 }
  },
  withdrawals: {
    minimumAmount: { type: Number, default: 20 },
    maximumAmount: { type: Number, default: 500 }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

DeliverySettingsSchema.index({ deliveryId: 1 });
DeliverySettingsSchema.index({ isActive: 1 });

export default mongoose.model<IDeliverySettings>('DeliverySettings', DeliverySettingsSchema);