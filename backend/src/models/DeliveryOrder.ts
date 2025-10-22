import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryOrder extends Document {
  _id: string;
  orderId: string; // Referencia al pedido principal
  deliveryId: string; // Delivery asignado
  customerId: string; // Cliente que hizo el pedido
  storeId: string; // Tienda que vende el producto
  
  // Información de la entrega
  pickupInfo: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeCoordinates: {
      lat: number;
      lng: number;
    };
    contactPerson: string;
    pickupInstructions?: string;
  };
  
  deliveryInfo: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCoordinates: {
      lat: number;
      lng: number;
    };
    deliveryInstructions?: string;
    estimatedDeliveryTime: Date;
    actualDeliveryTime?: Date;
  };
  
  // Información del pedido
  orderDetails: {
    totalValue: number;
    itemCount: number;
    items: Array<{
      name: string;
      quantity: number;
      value: number;
    }>;
    specialRequirements?: string;
  };
  
  // Información de pago
  paymentInfo: {
    deliveryFee: number; // Tarifa cobrada al delivery
    bonusAmount: number; // Bono aplicado
    totalPayment: number; // Pago total al delivery
    commissionDeduction: number; // Deducción de comisión
    paymentMethod: 'cash' | 'card' | 'digital';
    isPaid: boolean;
    paidAt?: Date;
  };
  
  // Estado y seguimiento
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  tracking: {
    assignedAt: Date;
    pickedUpAt?: Date;
    inTransitAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    failureReason?: string;
  };
  
  // Métricas de rendimiento
  performance: {
    distance: number; // Distancia en km
    estimatedTime: number; // Tiempo estimado en minutos
    actualTime: number; // Tiempo real en minutos
    rating?: number; // Rating del cliente (1-5)
    feedback?: string; // Comentarios del cliente
    onTime: boolean; // Si fue entregado a tiempo
  };
  
  // Información adicional
  metadata: {
    weatherCondition: 'normal' | 'rain' | 'storm' | 'extreme';
    peakHours: boolean;
    zone: string;
    priority: 'normal' | 'high' | 'urgent';
    specialHandling?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryOrderSchema = new Schema<IDeliveryOrder>({
  orderId: { type: String, required: true },
  deliveryId: { type: String, required: true },
  customerId: { type: String, required: true },
  storeId: { type: String, required: true },
  
  pickupInfo: {
    storeName: { type: String, required: true },
    storeAddress: { type: String, required: true },
    storePhone: { type: String, required: true },
    storeCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    contactPerson: { type: String, required: true },
    pickupInstructions: String
  },
  
  deliveryInfo: {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    deliveryInstructions: String,
    estimatedDeliveryTime: { type: Date, required: true },
    actualDeliveryTime: Date
  },
  
  orderDetails: {
    totalValue: { type: Number, required: true, min: 0 },
    itemCount: { type: Number, required: true, min: 1 },
    items: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      value: { type: Number, required: true, min: 0 }
    }],
    specialRequirements: String
  },
  
  paymentInfo: {
    deliveryFee: { type: Number, required: true, min: 0 },
    bonusAmount: { type: Number, default: 0, min: 0 },
    totalPayment: { type: Number, required: true, min: 0 },
    commissionDeduction: { type: Number, default: 0, min: 0 },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'digital'], 
      required: true 
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date
  },
  
  status: { 
    type: String, 
    enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'],
    default: 'assigned' 
  },
  
  tracking: {
    assignedAt: { type: Date, default: Date.now },
    pickedUpAt: Date,
    inTransitAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    failureReason: String
  },
  
  performance: {
    distance: { type: Number, min: 0 },
    estimatedTime: { type: Number, min: 0 },
    actualTime: { type: Number, min: 0 },
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    onTime: { type: Boolean, default: false }
  },
  
  metadata: {
    weatherCondition: { 
      type: String, 
      enum: ['normal', 'rain', 'storm', 'extreme'], 
      default: 'normal' 
    },
    peakHours: { type: Boolean, default: false },
    zone: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['normal', 'high', 'urgent'], 
      default: 'normal' 
    },
    specialHandling: String
  }
}, {
  timestamps: true,
  collection: 'delivery_orders'
});

// Índices para optimizar consultas
DeliveryOrderSchema.index({ deliveryId: 1, status: 1 });
DeliveryOrderSchema.index({ orderId: 1 });
DeliveryOrderSchema.index({ customerId: 1 });
DeliveryOrderSchema.index({ storeId: 1 });
DeliveryOrderSchema.index({ status: 1, createdAt: -1 });
DeliveryOrderSchema.index({ 'deliveryInfo.deliveryCoordinates': '2dsphere' });
DeliveryOrderSchema.index({ 'pickupInfo.storeCoordinates': '2dsphere' });

export default mongoose.model<IDeliveryOrder>('DeliveryOrder', DeliveryOrderSchema);
