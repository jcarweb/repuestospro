import mongoose, { Document, Schema } from 'mongoose';

export interface IClaim extends Document {
  claimNumber: string; // Número único de reclamo
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  warrantyId: mongoose.Types.ObjectId;
  
  // Tipo y estado del reclamo
  claimType: 'defective_product' | 'non_delivery' | 'not_as_described' | 'late_delivery' | 'damaged_package';
  status: 'pending' | 'under_review' | 'evidence_required' | 'approved' | 'rejected' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Detalles del problema
  title: string;
  description: string;
  problemDetails: {
    issueType: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    impact: string;
    expectedResolution: string;
  };
  
  // Información financiera
  claimedAmount: number;
  approvedAmount?: number;
  refundAmount?: number;
  currency: string;
  
  // Evidencia y documentación
  evidence: Array<{
    type: 'photo' | 'document' | 'video' | 'audio' | 'other';
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: Date;
    description?: string;
  }>;
  
  // Proceso de resolución
  resolution: {
    status: 'pending' | 'in_progress' | 'completed';
    method: 'refund' | 'replacement' | 'repair' | 'partial_refund' | 'store_credit';
    description?: string;
    completedAt?: Date;
    agentNotes?: string;
  };
  
  // Comunicación y seguimiento
  communications: Array<{
    from: 'user' | 'store' | 'support' | 'system';
    message: string;
    timestamp: Date;
    attachments?: string[];
    isInternal?: boolean;
  }>;
  
  // Asignación y soporte
  assignedAgent?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  estimatedResolutionDate?: Date;
  actualResolutionDate?: Date;
  
  // Fechas importantes
  filedDate: Date;
  lastUpdated: Date;
  deadlineDate?: Date;
  
  // Metadatos
  tags?: string[];
  notes?: string;
  internalNotes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>({
  claimNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  warrantyId: { type: Schema.Types.ObjectId, ref: 'Warranty', required: true },
  
  // Tipo y estado del reclamo
  claimType: { 
    type: String, 
    required: true, 
    enum: ['defective_product', 'non_delivery', 'not_as_described', 'late_delivery', 'damaged_package'] 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'under_review', 'evidence_required', 'approved', 'rejected', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Detalles del problema
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  problemDetails: {
    issueType: { type: String, required: true },
    severity: { 
      type: String, 
      required: true, 
      enum: ['minor', 'moderate', 'major', 'critical'],
      default: 'moderate'
    },
    impact: { type: String, required: true },
    expectedResolution: { type: String, required: true }
  },
  
  // Información financiera
  claimedAmount: { type: Number, required: true, min: 0 },
  approvedAmount: { type: Number, min: 0 },
  refundAmount: { type: Number, min: 0 },
  currency: { type: String, default: 'USD' },
  
  // Evidencia y documentación
  evidence: [{
    type: { 
      type: String, 
      required: true,
      enum: ['photo', 'document', 'video', 'audio', 'other']
    },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String, trim: true }
  }],
  
  // Proceso de resolución
  resolution: {
    status: { 
      type: String, 
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    method: { 
      type: String, 
      enum: ['refund', 'replacement', 'repair', 'partial_refund', 'store_credit']
    },
    description: { type: String, trim: true },
    completedAt: { type: Date },
    agentNotes: { type: String, trim: true }
  },
  
  // Comunicación y seguimiento
  communications: [{
    from: { 
      type: String, 
      required: true,
      enum: ['user', 'store', 'support', 'system']
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: [{ type: String }],
    isInternal: { type: Boolean, default: false }
  }],
  
  // Asignación y soporte
  assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  estimatedResolutionDate: { type: Date },
  actualResolutionDate: { type: Date },
  
  // Fechas importantes
  filedDate: { type: Date, required: true, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  deadlineDate: { type: Date },
  
  // Metadatos
  tags: [{ type: String, trim: true }],
  notes: { type: String, trim: true },
  internalNotes: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Índices para optimizar consultas
ClaimSchema.index({ claimNumber: 1 }, { unique: true });
ClaimSchema.index({ userId: 1, status: 1 });
ClaimSchema.index({ storeId: 1, status: 1 });
ClaimSchema.index({ transactionId: 1 });
ClaimSchema.index({ warrantyId: 1 });
ClaimSchema.index({ status: 1, priority: 1 });
ClaimSchema.index({ assignedAgent: 1, status: 1 });
ClaimSchema.index({ filedDate: -1 });
ClaimSchema.index({ deadlineDate: 1, status: 1 });

// Pre-save middleware para generar claimNumber
ClaimSchema.pre('save', function(next) {
  if (this.isNew && !this.claimNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.claimNumber = `CLM-${timestamp}-${random}`;
  }
  this.lastUpdated = new Date();
  next();
});

// Método para agregar comunicación
ClaimSchema.methods['addCommunication'] = function(from: string, message: string, attachments?: string[], isInternal?: boolean) {
  this['communications'].push({
    from,
    message,
    timestamp: new Date(),
    attachments: attachments || [],
    isInternal: isInternal || false
  });
  this['lastUpdated'] = new Date();
  return this['save']();
};

// Método para agregar evidencia
ClaimSchema.methods['addEvidence'] = function(evidenceData: any) {
  this['evidence'].push({
    ...evidenceData,
    uploadedAt: new Date()
  });
  return this['save']();
};

// Método para actualizar estado
ClaimSchema.methods['updateStatus'] = function(newStatus: string, notes?: string) {
  this['status'] = newStatus;
  this['lastUpdated'] = new Date();
  
  if (notes) {
    this['addCommunication']('system', `Estado actualizado a: ${newStatus}. ${notes}`);
  }
  
  return this['save']();
};

// Método para calcular tiempo transcurrido
ClaimSchema.methods['getTimeElapsed'] = function(): number {
  const now = new Date();
  const diffTime = now.getTime() - this['filedDate'].getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Método para verificar si está en tiempo límite
ClaimSchema.methods['isWithinDeadline'] = function(): boolean {
  if (!this['deadlineDate']) return true;
  return new Date() <= this['deadlineDate'];
};

export default mongoose.model<IClaim>('Claim', ClaimSchema);
