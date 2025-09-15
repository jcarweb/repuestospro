import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: {
    userId: mongoose.Types.ObjectId;
    userType: 'client' | 'store_manager' | 'admin';
    userName: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system' | 'auto_response';
  content: string;
  originalContent?: string; // Contenido antes del filtrado
  attachments?: {
    type: 'image' | 'file';
    url: string;
    filename: string;
    size: number;
  }[];
  validation: {
    isBlocked: boolean;
    violations: string[];
    blockedContent: string[];
    autoModerated: boolean;
  };
  status: 'sent' | 'delivered' | 'read' | 'blocked';
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  isEdited: boolean;
  editHistory?: {
    content: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['client', 'store_manager', 'admin'],
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'auto_response'],
    default: 'text'
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  originalContent: {
    type: String,
    required: false
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  validation: {
    isBlocked: {
      type: Boolean,
      default: false
    },
    violations: [{
      type: String
    }],
    blockedContent: [{
      type: String
    }],
    autoModerated: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'blocked'],
    default: 'sent'
  },
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    ipAddress: {
      type: String,
      required: false
    },
    userAgent: {
      type: String,
      required: false
    },
    location: {
      latitude: {
        type: Number,
        required: false
      },
      longitude: {
        type: Number,
        required: false
      }
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices para optimizar consultas
ChatMessageSchema.index({ chatId: 1, createdAt: -1 });
ChatMessageSchema.index({ 'sender.userId': 1 });
ChatMessageSchema.index({ status: 1 });
ChatMessageSchema.index({ 'validation.isBlocked': 1 });
ChatMessageSchema.index({ messageType: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
