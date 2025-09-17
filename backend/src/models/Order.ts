import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  transactionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  
  // Información del cliente
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  
  // Información de productos
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    productImage?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    warrantyIncluded?: boolean;
    warrantyType?: string;
    warrantyCost?: number;
    notes?: string;
  }>;
  
  // Información financiera
  subtotal: number;
  taxAmount: number;
  commissionAmount: number;
  warrantyTotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  // Estados de la orden
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Información de pago
  paymentMethod: string;
  paymentDetails?: {
    transactionId?: string;
    paymentProvider?: string;
    lastFourDigits?: string;
    paymentDate?: Date;
  };
  
  // Información de envío
  shippingMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    deliveryInstructions?: string;
  };
  
  // Información de delivery
  deliveryInfo?: {
    assignedDelivery?: mongoose.Types.ObjectId;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    deliveryNotes?: string;
  };
  
  // Información de garantía
  warrantyEnabled: boolean;
  warrantyLevel: 'basic' | 'premium' | 'extended' | 'none';
  warrantyCoverage: number;
  
  // Fechas importantes
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  processingAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  
  // Metadatos
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: 'web' | 'mobile' | 'phone' | 'in_store';
  
  // Información de creación
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  
  // Calificaciones y reseñas
  customerRating?: number;
  customerReview?: string;
  deliveryRating?: number;
  deliveryReview?: string;
  
  // Métodos de instancia
  calculateTotal(): number;
  canBeCancelled(): boolean;
  canBeRefunded(): boolean;
  canBeShipped(): boolean;
  getStatusColor(): string;
  getStatusText(): string;
}

export type OrderStatus = 
  | 'pending'           // Pendiente de confirmación
  | 'confirmed'         // Confirmada por la tienda
  | 'processing'        // En procesamiento/preparación
  | 'ready_for_pickup'  // Lista para recoger
  | 'ready_for_delivery' // Lista para delivery
  | 'shipped'           // Enviada
  | 'in_transit'        // En tránsito
  | 'out_for_delivery'  // En ruta de entrega
  | 'delivered'         // Entregada
  | 'completed'         // Completada
  | 'cancelled'         // Cancelada
  | 'refunded'          // Reembolsada
  | 'returned'          // Devuelta
  | 'on_hold'           // En espera
  | 'backorder'         // Pedido pendiente de stock
  | 'partially_shipped' // Enviada parcialmente
  | 'partially_delivered'; // Entregada parcialmente

export type PaymentStatus = 
  | 'pending'           // Pendiente de pago
  | 'authorized'        // Autorizado
  | 'paid'              // Pagado
  | 'failed'            // Fallido
  | 'refunded'          // Reembolsado
  | 'partially_refunded' // Reembolsado parcialmente
  | 'cancelled';        // Cancelado

export type FulfillmentStatus = 
  | 'unfulfilled'       // No cumplida
  | 'fulfilled'         // Cumplida
  | 'partially_fulfilled' // Parcialmente cumplida
  | 'returned'          // Devuelta
  | 'exchanged';        // Cambiada

const OrderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  transactionId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Transaction', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  storeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  },
  
  // Información del cliente
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    }
  },
  
  // Información de productos
  items: [{
    productId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    productName: { 
      type: String, 
      required: true 
    },
    productImage: { 
      type: String 
    },
    sku: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    unitPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    warrantyIncluded: { 
      type: Boolean, 
      default: false 
    },
    warrantyType: { 
      type: String, 
      enum: ['basic', 'premium', 'extended', 'none'],
      default: 'none'
    },
    warrantyCost: { 
      type: Number, 
      min: 0, 
      default: 0 
    },
    notes: { 
      type: String 
    }
  }],
  
  // Información financiera
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  taxAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  commissionAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  warrantyTotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  shippingCost: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  discountAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  
  // Estados de la orden
  orderStatus: { 
    type: String, 
    required: true, 
    enum: [
      'pending', 'confirmed', 'processing', 'ready_for_pickup', 
      'ready_for_delivery', 'shipped', 'in_transit', 'out_for_delivery',
      'delivered', 'completed', 'cancelled', 'refunded', 'returned',
      'on_hold', 'backorder', 'partially_shipped', 'partially_delivered'
    ],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
    default: 'pending'
  },
  fulfillmentStatus: { 
    type: String, 
    required: true, 
    enum: ['unfulfilled', 'fulfilled', 'partially_fulfilled', 'returned', 'exchanged'],
    default: 'unfulfilled'
  },
  
  // Información de pago
  paymentMethod: { 
    type: String, 
    required: true 
  },
  paymentDetails: {
    transactionId: { type: String },
    paymentProvider: { type: String },
    lastFourDigits: { type: String },
    paymentDate: { type: Date }
  },
  
  // Información de envío
  shippingMethod: { 
    type: String, 
    required: true 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
    deliveryInstructions: { type: String }
  },
  
  // Información de delivery
  deliveryInfo: {
    assignedDelivery: { type: Schema.Types.ObjectId, ref: 'User' },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    trackingNumber: { type: String },
    deliveryNotes: { type: String }
  },
  
  // Información de garantía
  warrantyEnabled: { 
    type: Boolean, 
    default: false 
  },
  warrantyLevel: { 
    type: String, 
    enum: ['basic', 'premium', 'extended', 'none'],
    default: 'none'
  },
  warrantyCoverage: { 
    type: Number, 
    min: 0, 
    default: 0 
  },
  
  // Fechas importantes
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  confirmedAt: { 
    type: Date 
  },
  processingAt: { 
    type: Date 
  },
  shippedAt: { 
    type: Date 
  },
  deliveredAt: { 
    type: Date 
  },
  cancelledAt: { 
    type: Date 
  },
  refundedAt: { 
    type: Date 
  },
  
  // Metadatos
  notes: { 
    type: String 
  },
  internalNotes: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  source: { 
    type: String, 
    enum: ['web', 'mobile', 'phone', 'in_store'],
    default: 'web'
  },
  
  // Información de creación
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Calificaciones y reseñas
  customerRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  customerReview: { 
    type: String 
  },
  deliveryRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  deliveryReview: { 
    type: String 
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
// orderNumber ya tiene índice único automático por unique: true
OrderSchema.index({ transactionId: 1 });
OrderSchema.index({ userId: 1, orderStatus: 1 });
OrderSchema.index({ storeId: 1, orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ assignedTo: 1, orderStatus: 1 });
OrderSchema.index({ priority: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ 'deliveryInfo.assignedDelivery': 1 });

// Métodos de instancia
OrderSchema.methods.calculateTotal = function(): number {
  return this.subtotal + this.taxAmount + this.commissionAmount + this.warrantyTotal + this.shippingCost - this.discountAmount;
};

OrderSchema.methods.canBeCancelled = function(): boolean {
  return ['pending', 'confirmed', 'processing', 'on_hold'].includes(this.orderStatus);
};

OrderSchema.methods.canBeRefunded = function(): boolean {
  return ['completed', 'delivered', 'partially_delivered'].includes(this.orderStatus) && 
         ['paid', 'partially_refunded'].includes(this.paymentStatus);
};

OrderSchema.methods.canBeShipped = function(): boolean {
  return ['confirmed', 'processing', 'ready_for_delivery'].includes(this.orderStatus) && 
         this.paymentStatus === 'paid';
};

OrderSchema.methods.getStatusColor = function(): string {
  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready_for_pickup: 'bg-green-100 text-green-800',
    ready_for_delivery: 'bg-green-100 text-green-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    returned: 'bg-red-100 text-red-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    backorder: 'bg-orange-100 text-orange-800',
    partially_shipped: 'bg-blue-100 text-blue-800',
    partially_delivered: 'bg-blue-100 text-blue-800'
  };
  return statusColors[this.orderStatus] || 'bg-gray-100 text-gray-800';
};

OrderSchema.methods.getStatusText = function(): string {
  const statusTexts: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    processing: 'En Procesamiento',
    ready_for_pickup: 'Lista para Recoger',
    ready_for_delivery: 'Lista para Delivery',
    shipped: 'Enviada',
    in_transit: 'En Tránsito',
    out_for_delivery: 'En Ruta de Entrega',
    delivered: 'Entregada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    refunded: 'Reembolsada',
    returned: 'Devuelta',
    on_hold: 'En Espera',
    backorder: 'Pedido Pendiente',
    partially_shipped: 'Enviada Parcialmente',
    partially_delivered: 'Entregada Parcialmente'
  };
  return statusTexts[this.orderStatus] || 'Desconocido';
};

// Middleware pre-save para actualizar updatedAt
OrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware pre-save para generar número de orden
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Middleware pre-save para actualizar fechas según el estado
OrderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    const now = new Date();
    switch (this.orderStatus) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'processing':
        this.processingAt = now;
        break;
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        this.shippedAt = now;
        break;
      case 'delivered':
      case 'completed':
        this.deliveredAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
      case 'refunded':
        this.refundedAt = now;
        break;
    }
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
