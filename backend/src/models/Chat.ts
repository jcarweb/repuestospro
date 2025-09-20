import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: {
    client: mongoose.Types.ObjectId;
    store: mongoose.Types.ObjectId;
  };
  product?: mongoose.Types.ObjectId;
  status: 'active' | 'closed' | 'blocked';
  lastMessage?: mongoose.Types.ObjectId;
  lastActivity: Date;
  isClientOnline: boolean;
  isStoreOnline: boolean;
  metadata: {
    clientName: string;
    storeName: string;
    productName?: string;
    productSku?: string;
  };
  settings: {
    allowImageSharing: boolean;
    allowFileSharing: boolean;
    autoCloseAfterHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    }
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isClientOnline: {
    type: Boolean,
    default: false
  },
  isStoreOnline: {
    type: Boolean,
    default: false
  },
  metadata: {
    clientName: {
      type: String,
      required: true
    },
    storeName: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: false
    },
    productSku: {
      type: String,
      required: false
    }
  },
  settings: {
    allowImageSharing: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: false
    },
    autoCloseAfterHours: {
      type: Number,
      default: 72 // 3 días de inactividad
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ChatSchema.index({ 'participants.client': 1 });
ChatSchema.index({ 'participants.store': 1 });
ChatSchema.index({ product: 1 });
ChatSchema.index({ status: 1 });
ChatSchema.index({ lastActivity: -1 });

// Índice compuesto para encontrar chats específicos
ChatSchema.index({ 
  'participants.client': 1, 
  'participants.store': 1, 
  product: 1 
});

export default mongoose.model<IChat>('Chat', ChatSchema);

