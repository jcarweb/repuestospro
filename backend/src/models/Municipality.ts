import mongoose, { Schema, Document } from 'mongoose';

export interface IMunicipality extends Document {
  name: string;
  code: string;
  state: mongoose.Types.ObjectId;
  capital: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MunicipalitySchema = new Schema<IMunicipality>({
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
  state: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  capital: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
MunicipalitySchema.index({ name: 'text', capital: 'text' });
// code ya está incluido en el índice compuesto único
MunicipalitySchema.index({ state: 1 });
MunicipalitySchema.index({ isActive: 1 });
MunicipalitySchema.index({ state: 1, name: 1 }); // Para búsquedas por estado y municipio

// Índice compuesto único para evitar duplicados
MunicipalitySchema.index({ state: 1, code: 1 }, { unique: true });

export default mongoose.model<IMunicipality>('Municipality', MunicipalitySchema);
