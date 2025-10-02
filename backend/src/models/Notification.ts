import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'order' | 'delivery' | 'system';
  category: 'order' | 'delivery' | 'promotion' | 'security' | 'system' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  readAt?: Date;
  archivedAt?: Date;
  
  // Datos específicos de la notificación
  data?: {
    orderId?: string;
    deliveryId?: string;
    productId?: string;
    promotionId?: string;
    url?: string;
    actionUrl?: string;
    actionText?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  
  // Configuración de entrega
  delivery: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
    pushSent?: boolean;
    emailSent?: boolean;
    smsSent?: boolean;
  };
  
  // Metadatos
  metadata: {
    source: string; // 'system', 'admin', 'order_system', 'delivery_system', etc.
    trigger: string; // 'order_created', 'delivery_status_changed', etc.
    ipAddress?: string;
    userAgent?: string;
  };
  
  // Fechas
  scheduledFor?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'promotion', 'order', 'delivery', 'system'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['order', 'delivery', 'promotion', 'security', 'system', 'marketing'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  archivedAt: {
    type: Date
  },
  
  // Datos específicos
  data: {
    orderId: String,
    deliveryId: String,
    productId: String,
    promotionId: String,
    url: String,
    actionUrl: String,
    actionText: String,
    imageUrl: String
  },
  
  // Configuración de entrega
  delivery: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    pushSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false }
  },
  
  // Metadatos
  metadata: {
    source: { type: String, required: true },
    trigger: { type: String, required: true },
    ipAddress: String,
    userAgent: String
  },
  
  // Fechas
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isArchived: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });
notificationSchema.index({ expiresAt: 1 }, { sparse: true });

// Métodos estáticos
notificationSchema.statics = {
  // Crear notificación para un usuario
  async createForUser(userId: string, notificationData: {
    title: string;
    message: string;
    type?: INotification['type'];
    category: INotification['category'];
    priority?: INotification['priority'];
    data?: INotification['data'];
    delivery?: Partial<INotification['delivery']>;
    metadata: INotification['metadata'];
    scheduledFor?: Date;
    expiresAt?: Date;
  }) {
    const notification = new this({
      userId,
      ...notificationData,
      delivery: {
        push: true,
        email: false,
        sms: false,
        inApp: true,
        ...notificationData.delivery
      }
    });
    
    return await notification.save();
  },
  
  // Crear notificación para múltiples usuarios
  async createForUsers(userIds: string[], notificationData: {
    title: string;
    message: string;
    type?: INotification['type'];
    category: INotification['category'];
    priority?: INotification['priority'];
    data?: INotification['data'];
    delivery?: Partial<INotification['delivery']>;
    metadata: INotification['metadata'];
    scheduledFor?: Date;
    expiresAt?: Date;
  }) {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData,
      delivery: {
        push: true,
        email: false,
        sms: false,
        inApp: true,
        ...notificationData.delivery
      }
    }));
    
    return await this.insertMany(notifications);
  },
  
  // Marcar notificación como leída
  async markAsRead(notificationId: string, userId: string) {
    return await this.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );
  },
  
  // Marcar múltiples notificaciones como leídas
  async markMultipleAsRead(notificationIds: string[], userId: string) {
    return await this.updateMany(
      { _id: { $in: notificationIds }, userId },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  },
  
  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string) {
    return await this.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  },
  
  // Archivar notificación
  async archive(notificationId: string, userId: string) {
    return await this.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        isArchived: true, 
        archivedAt: new Date() 
      },
      { new: true }
    );
  },
  
  // Obtener notificaciones no leídas
  async getUnread(userId: string, limit: number = 20) {
    return await this.find({
      userId,
      isRead: false,
      isArchived: false
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  },
  
  // Obtener notificaciones recientes
  async getRecent(userId: string, limit: number = 50) {
    return await this.find({
      userId,
      isArchived: false
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  },
  
  // Contar notificaciones no leídas
  async countUnread(userId: string) {
    return await this.countDocuments({
      userId,
      isRead: false,
      isArchived: false
    });
  },
  
  // Limpiar notificaciones expiradas
  async cleanExpired() {
    return await this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
};

// Métodos de instancia
notificationSchema.methods = {
  // Marcar como leída
  async markAsRead() {
    this['isRead'] = true;
    this['readAt'] = new Date();
    return await this['save']();
  },
  
  // Archivar
  async archive() {
    this['isArchived'] = true;
    this['archivedAt'] = new Date();
    return await this['save']();
  }
};

export default mongoose.model<INotification>('Notification', notificationSchema);
