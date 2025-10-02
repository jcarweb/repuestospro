import Order, { IOrder, OrderStatus, PaymentStatus, FulfillmentStatus } from '../models/Order';
import Transaction from '../models/Transaction';
import User from '../models/User';
import Product from '../models/Product';
import Store from '../models/Store';
import mongoose from 'mongoose';

export interface OrderCreationData {
  transactionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
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
  subtotal: number;
  taxAmount: number;
  commissionAmount: number;
  warrantyTotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
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
  warrantyEnabled: boolean;
  warrantyLevel: 'basic' | 'premium' | 'extended' | 'none';
  warrantyCoverage: number;
  notes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  source?: 'web' | 'mobile' | 'phone' | 'in_store';
  createdBy: mongoose.Types.ObjectId;
}

export interface OrderUpdateData {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  assignedTo?: mongoose.Types.ObjectId;
  internalNotes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  deliveryInfo?: {
    assignedDelivery?: mongoose.Types.ObjectId;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    deliveryNotes?: string;
  };
  paymentDetails?: {
    transactionId?: string;
    paymentProvider?: string;
    lastFourDigits?: string;
    paymentDate?: Date;
  };
}

export interface OrderFilters {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  priority?: string[];
  source?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  customerEmail?: string;
  assignedTo?: mongoose.Types.ObjectId;
  tags?: string[];
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalAmount: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    totalAmount: number;
  }>;
  statusDistribution: Array<{
    status: OrderStatus;
    count: number;
    percentage: number;
  }>;
}

export class OrderService {
  /**
   * Crear una nueva orden
   */
  static async createOrder(data: OrderCreationData): Promise<IOrder> {
    const order = new Order({
      ...data,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled'
    });

    return await order.save();
  }

  /**
   * Obtener orden por ID
   */
  static async getOrderById(orderId: string, userId?: mongoose.Types.ObjectId, storeId?: mongoose.Types.ObjectId): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    
    if (userId) {
      query.userId = userId;
    }
    
    if (storeId) {
      query.storeId = storeId;
    }

    return await Order.findById(query)
      .populate('userId', 'name email phone')
      .populate('storeId', 'name address')
      .populate('assignedTo', 'name email')
      .populate('deliveryInfo.assignedDelivery', 'name email phone')
      .populate('items.productId', 'name image sku')
      .populate('createdBy', 'name email');
  }

  /**
   * Obtener órdenes del usuario
   */
  static async getUserOrders(
    userId: mongoose.Types.ObjectId, 
    page: number = 1, 
    limit: number = 10,
    filters?: OrderFilters
  ) {
    const skip = (page - 1) * limit;
    const query: any = { userId };

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query.orderStatus = { $in: filters.status };
      }
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        query.paymentStatus = { $in: filters.paymentStatus };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('storeId', 'name')
        .populate('items.productId', 'name image'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener órdenes de la tienda
   */
  static async getStoreOrders(
    storeId: mongoose.Types.ObjectId, 
    page: number = 1, 
    limit: number = 10,
    filters?: OrderFilters
  ) {
    const skip = (page - 1) * limit;
    const query: any = { storeId };

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query.orderStatus = { $in: filters.status };
      }
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        query.paymentStatus = { $in: filters.paymentStatus };
      }
      if (filters.priority && filters.priority.length > 0) {
        query.priority = { $in: filters.priority };
      }
      if (filters.source && filters.source.length > 0) {
        query.source = { $in: filters.source };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
      if (filters.customerEmail) {
        query['customerInfo.email'] = { $regex: filters.customerEmail, $options: 'i' };
      }
      if (filters.assignedTo) {
        query.assignedTo = filters.assignedTo;
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .populate('assignedTo', 'name email')
        .populate('deliveryInfo.assignedDelivery', 'name email phone')
        .populate('items.productId', 'name image sku'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener todas las órdenes (admin)
   */
  static async getAllOrders(
    page: number = 1, 
    limit: number = 10,
    filters?: OrderFilters
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query.orderStatus = { $in: filters.status };
      }
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        query.paymentStatus = { $in: filters.paymentStatus };
      }
      if (filters.priority && filters.priority.length > 0) {
        query.priority = { $in: filters.priority };
      }
      if (filters.source && filters.source.length > 0) {
        query.source = { $in: filters.source };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
      if (filters.customerEmail) {
        query['customerInfo.email'] = { $regex: filters.customerEmail, $options: 'i' };
      }
      if (filters.assignedTo) {
        query.assignedTo = filters.assignedTo;
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .populate('storeId', 'name')
        .populate('assignedTo', 'name email')
        .populate('deliveryInfo.assignedDelivery', 'name email phone')
        .populate('items.productId', 'name image sku'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Actualizar orden
   */
  static async updateOrder(orderId: string, data: OrderUpdateData, userId?: mongoose.Types.ObjectId, storeId?: mongoose.Types.ObjectId): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    
    if (userId) {
      query.userId = userId;
    }
    
    if (storeId) {
      query.storeId = storeId;
    }

    const order = await Order.findOneAndUpdate(
      query,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone')
     .populate('storeId', 'name')
     .populate('assignedTo', 'name email')
     .populate('deliveryInfo.assignedDelivery', 'name email phone')
     .populate('items.productId', 'name image sku');

    return order;
  }

  /**
   * Cancelar orden
   */
  static async cancelOrder(orderId: string, reason?: string, userId?: mongoose.Types.ObjectId, storeId?: mongoose.Types.ObjectId): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    
    if (userId) {
      query.userId = userId;
    }
    
    if (storeId) {
      query.storeId = storeId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (!order.canBeCancelled()) {
      throw new Error('La orden no puede ser cancelada en su estado actual');
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'cancelled';
    order.fulfillmentStatus = 'unfulfilled';
    order.internalNotes = reason ? `${order.internalNotes || ''}\nCancelada: ${reason}`.trim() : (order.internalNotes || '');
    order.cancelledAt = new Date();

    return await order.save();
  }

  /**
   * Asignar orden a un empleado
   */
  static async assignOrder(orderId: string, assignedTo: mongoose.Types.ObjectId, storeId?: mongoose.Types.ObjectId): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    
    if (storeId) {
      query.storeId = storeId;
    }

    return await Order.findOneAndUpdate(
      query,
      { 
        assignedTo,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone')
     .populate('storeId', 'name')
     .populate('assignedTo', 'name email')
     .populate('deliveryInfo.assignedDelivery', 'name email phone')
     .populate('items.productId', 'name image sku');
  }

  /**
   * Asignar delivery a una orden
   */
  static async assignDelivery(orderId: string, deliveryId: mongoose.Types.ObjectId, storeId?: mongoose.Types.ObjectId): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    
    if (storeId) {
      query.storeId = storeId;
    }

    return await Order.findOneAndUpdate(
      query,
      { 
        'deliveryInfo.assignedDelivery': deliveryId,
        'deliveryInfo.estimatedDelivery': new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone')
     .populate('storeId', 'name')
     .populate('assignedTo', 'name email')
     .populate('deliveryInfo.assignedDelivery', 'name email phone')
     .populate('items.productId', 'name image sku');
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async getOrderStats(storeId?: mongoose.Types.ObjectId, dateFrom?: Date, dateTo?: Date): Promise<OrderStats> {
    const query: any = {};
    
    if (storeId) {
      query.storeId = storeId;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) query.createdAt.$lte = dateTo;
    }

    const [
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalAmount,
      statusDistribution,
      topProducts
    ] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, orderStatus: 'pending' }),
      Order.countDocuments({ ...query, orderStatus: 'confirmed' }),
      Order.countDocuments({ ...query, orderStatus: 'processing' }),
      Order.countDocuments({ ...query, orderStatus: { $in: ['shipped', 'in_transit', 'out_for_delivery'] } }),
      Order.countDocuments({ ...query, orderStatus: { $in: ['delivered', 'completed'] } }),
      Order.countDocuments({ ...query, orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Order.aggregate([
        { $match: query },
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.productId', 
          productName: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.totalPrice' }
        }},
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totalAmountValue = totalAmount[0]?.total || 0;
    const averageOrderValue = total > 0 ? totalAmountValue / total : 0;

    const statusDistributionWithPercentage = statusDistribution.map((status: any) => ({
      status: status._id,
      count: status.count,
      percentage: total > 0 ? (status.count / total) * 100 : 0
    }));

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalAmount: totalAmountValue,
      averageOrderValue,
      topProducts: topProducts.map((product: any) => ({
        productId: product._id,
        productName: product.productName,
        quantity: product.quantity,
        totalAmount: product.totalAmount
      })),
      statusDistribution: statusDistributionWithPercentage
    };
  }

  /**
   * Obtener órdenes por estado
   */
  static async getOrdersByStatus(status: OrderStatus, storeId?: mongoose.Types.ObjectId, limit: number = 10): Promise<IOrder[]> {
    const query: any = { orderStatus: status };
    
    if (storeId) {
      query.storeId = storeId;
    }

    return await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('deliveryInfo.assignedDelivery', 'name email phone')
      .populate('items.productId', 'name image sku');
  }

  /**
   * Obtener órdenes urgentes
   */
  static async getUrgentOrders(storeId?: mongoose.Types.ObjectId): Promise<IOrder[]> {
    const query: any = { 
      priority: { $in: ['high', 'urgent'] },
      orderStatus: { $nin: ['cancelled', 'completed', 'delivered'] }
    };
    
    if (storeId) {
      query.storeId = storeId;
    }

    return await Order.find(query)
      .sort({ priority: -1, createdAt: 1 })
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('deliveryInfo.assignedDelivery', 'name email phone')
      .populate('items.productId', 'name image sku');
  }

  /**
   * Buscar órdenes
   */
  static async searchOrders(
    searchTerm: string, 
    storeId?: mongoose.Types.ObjectId, 
    page: number = 1, 
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const query: any = {
      $or: [
        { orderNumber: { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.name': { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.email': { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.phone': { $regex: searchTerm, $options: 'i' } },
        { 'items.productName': { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    if (storeId) {
      query.storeId = storeId;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .populate('assignedTo', 'name email')
        .populate('deliveryInfo.assignedDelivery', 'name email phone')
        .populate('items.productId', 'name image sku'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener órdenes asignadas a un delivery
   */
  static async getDeliveryOrders(
    deliveryId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const query = {
      'deliveryInfo.assignedDelivery': deliveryId
    };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .populate('storeId', 'name address')
        .populate('items.productId', 'name image sku'),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Exportar órdenes
   */
  static async exportOrders(
    filters?: OrderFilters,
    storeId?: mongoose.Types.ObjectId,
    format: 'csv' | 'json' = 'csv'
  ) {
    const query: any = {};
    
    if (storeId) {
      query.storeId = storeId;
    }

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query.orderStatus = { $in: filters.status };
      }
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        query.paymentStatus = { $in: filters.paymentStatus };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('storeId', 'name')
      .populate('assignedTo', 'name email')
      .populate('items.productId', 'name sku');

    if (format === 'csv') {
      return this.convertToCSV(orders);
    } else {
      return orders;
    }
  }

  /**
   * Convertir órdenes a CSV
   */
  private static convertToCSV(orders: IOrder[]): string {
    const headers = [
      'Número de Orden',
      'Cliente',
      'Email',
      'Teléfono',
      'Estado',
      'Estado de Pago',
      'Total',
      'Fecha de Creación',
      'Productos',
      'Dirección de Envío'
    ];

    const rows = orders.map(order => [
      order.orderNumber,
      order.customerInfo.name,
      order.customerInfo.email,
      order.customerInfo.phone,
      order.getStatusText(),
      order.paymentStatus,
      order.totalAmount,
      order.createdAt.toLocaleDateString(),
      order.items.map(item => `${item.productName} (${item.quantity})`).join('; '),
      `${order.shippingAddress.street}, ${order.shippingAddress.city}`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
