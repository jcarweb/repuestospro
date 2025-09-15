import mongoose, { Schema, Document } from 'mongoose';

export interface IParish extends Document {
  name: string;
  code: string;
  municipality: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParishSchema = new Schema<IParish>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  municipality: {
    type: Schema.Types.ObjectId,
    ref: 'Municipality',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ParishSchema.index({ name: 'text' });
ParishSchema.index({ code: 1 });
ParishSchema.index({ municipality: 1 });
ParishSchema.index({ isActive: 1 });
ParishSchema.index({ municipality: 1, name: 1 }); // Para búsquedas por municipio y parroquia

// Índice compuesto único para evitar duplicados
ParishSchema.index({ municipality: 1, code: 1 }, { unique: true });

export default mongoose.model<IParish>('Parish', ParishSchema);
