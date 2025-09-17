import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
  name: string;
  code: string;
  capital: string;
  region: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema = new Schema<IState>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
    maxlength: 2
  },
  capital: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true,
    enum: ['Central', 'Occidental', 'Oriental', 'Guayana', 'Los Llanos', 'Insular', 'Zuliana']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
StateSchema.index({ name: 'text', capital: 'text' });
// code ya tiene índice único automático por unique: true
StateSchema.index({ region: 1 });
StateSchema.index({ isActive: 1 });

export default mongoose.model<IState>('State', StateSchema);
