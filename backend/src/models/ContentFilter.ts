import mongoose, { Document, Schema } from 'mongoose';

export interface IContentFilter extends Document {
  name: string;
  description: string;
  phonePatterns: string[];
  emailPatterns: string[];
  externalLinks: string[];
  forbiddenKeywords: string[];
  fraudPatterns: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentFilterSchema = new Schema<IContentFilter>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  phonePatterns: [{
    type: String,
    required: true
  }],
  emailPatterns: [{
    type: String,
    required: true
  }],
  externalLinks: [{
    type: String,
    required: true
  }],
  forbiddenKeywords: [{
    type: String,
    required: true,
    lowercase: true
  }],
  fraudPatterns: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ContentFilterSchema.index({ isActive: 1 });
ContentFilterSchema.index({ createdBy: 1 });

export default mongoose.model<IContentFilter>('ContentFilter', ContentFilterSchema);
