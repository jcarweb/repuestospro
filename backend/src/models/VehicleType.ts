import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicleType extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  deliveryType: 'delivery_motorizado' | 'pickup';
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const VehicleTypeSchema = new Schema<IVehicleType>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryType: {
    type: String,
    enum: ['delivery_motorizado', 'pickup'],
    required: true
  },
  icon: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model<IVehicleType>('VehicleType', VehicleTypeSchema);
