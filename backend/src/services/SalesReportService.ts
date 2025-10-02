import Order, { IOrder } from '../models/Order';
import Transaction from '../models/Transaction';
import Product from '../models/Product';
import User from '../models/User';
import mongoose from 'mongoose';
export interface SalesReportFilters {
  storeId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  dateFrom?: Date;
  dateTo?: Date;
  categoryId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  paymentMethod?: string;
  orderStatus?: string[];
  customerId?: mongoose.Types.ObjectId;
  search?: string;
}
export interface SalesOverview {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  conversionRate: number;
  refundRate: number;
  averageItemsPerOrder: number;
  totalItemsSold: number;
}
export interface SalesTrends {
  daily: Array<{
    date: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  weekly: Array<{
    week: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
  monthly: Array<{
    month: string;
    sales: number;
    orders: number;
    customers: number;
  }>;
}
export interface TopProducts {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  profitMargin: number;
}
export interface TopCategories {
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
}
export interface CustomerAnalytics {
  topCustomers: Array<{
    customerId: mongoose.Types.ObjectId;
    customerName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderDate: Date;
  }>;
  customerSegments: {
    new: number;
    returning: number;
    loyal: number;
    inactive: number;
  };
  customerRetention: {
    rate: number;
    averageLifetime: number;
    repeatPurchaseRate: number;
  };
}
export interface PaymentAnalytics {
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  paymentTrends: Array<{
    date: string;
    method: string;
    amount: number;
  }>;
}
export interface SalesReport {
  overview: SalesOverview;
  trends: SalesTrends;
  topProducts: TopProducts[];
  topCategories: TopCategories[];
  customerAnalytics: CustomerAnalytics;
  paymentAnalytics: PaymentAnalytics;
  period: {
    from: Date;
    to: Date;
    days: number;
  };
}
export class SalesReportService {
  /**
   * Generar reporte completo de ventas
   */
  static async generateSalesReport(filters: SalesReportFilters): Promise<SalesReport> {
    const query = await this.buildQuery(filters);
    const dateFrom = filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días por defecto
    const dateTo = filters.dateTo || new Date();
    const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    const [
      overview,
      trends,
      topProducts,
      topCategories,
      customerAnalytics,
      paymentAnalytics
    ] = await Promise.all([
      this.getSalesOverview(query, dateFrom, dateTo),
      this.getSalesTrends(query, dateFrom, dateTo),
      this.getTopProducts(query),
      this.getTopCategories(query),
      this.getCustomerAnalytics(query, dateFrom, dateTo),
      this.getPaymentAnalytics(query, dateFrom, dateTo)
    ]);
    return {
      overview,
      trends,
      topProducts,
      topCategories,
      customerAnalytics,
      paymentAnalytics,
      period: { from: dateFrom, to: dateTo, days }
    };
  }
  /**
   * Obtener vista general de ventas
   */
  private static async getSalesOverview(query: any, dateFrom: Date, dateTo: Date): Promise<SalesOverview> {
    const previousPeriodFrom = new Date(dateFrom.getTime() - (dateTo.getTime() - dateFrom.getTime()));
    const previousPeriodTo = new Date(dateFrom.getTime());
    const [
      currentStats,
      previousStats,
      totalCustomers,
      newCustomers,
      repeatCustomers,
      totalItemsSold,
      refundStats
    ] = await Promise.all([
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            totalItems: { $sum: { $sum: '$items.quantity' } }
          }
        }
      ]),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: previousPeriodFrom, $lte: previousPeriodTo } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      Order.distinct('userId', { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } }),
      Order.distinct('userId', {
        ...query,
        createdAt: { $gte: dateFrom, $lte: dateTo },
        userId: { $nin: await Order.distinct('userId', {
          ...query,
          createdAt: { $lt: dateFrom }
        })}
      }),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 }
          }
        },
        { $match: { orderCount: { $gt: 1 } } },
        { $count: 'count' }
      ]),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            totalItems: { $sum: '$items.quantity' }
          }
        }
      ]),
      Order.aggregate([
        { $match: { ...query, orderStatus: 'refunded', createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: null,
            refundAmount: { $sum: '$totalAmount' },
            refundCount: { $sum: 1 }
          }
        }
      ])
    ]);
    // Manejar casos donde no hay datos
    const current = currentStats[0] || { totalSales: 0, totalOrders: 0, totalItems: 0 };
    const previous = previousStats[0] || { totalSales: 0, totalOrders: 0 };
    const totalItems = totalItemsSold[0]?.totalItems || 0;
    const refund = refundStats[0] || { refundAmount: 0, refundCount: 0 };
    const averageOrderValue = current.totalOrders > 0 ? current.totalSales / current.totalOrders : 0;
    const conversionRate = totalCustomers.length > 0 ? (current.totalOrders / totalCustomers.length) * 100 : 0;
    const refundRate = current.totalOrders > 0 ? (refund.refundCount / current.totalOrders) * 100 : 0;
    const averageItemsPerOrder = current.totalOrders > 0 ? totalItems / current.totalOrders : 0;
    return {
      totalSales: current.totalSales,
      totalOrders: current.totalOrders,
      averageOrderValue,
      totalCustomers: totalCustomers.length,
      newCustomers: newCustomers.length,
      repeatCustomers: repeatCustomers[0]?.count || 0,
      conversionRate,
      refundRate,
      averageItemsPerOrder,
      totalItemsSold: totalItems
    };
  }
  /**
   * Obtener tendencias de ventas
   */
  private static async getSalesTrends(query: any, dateFrom: Date, dateTo: Date): Promise<SalesTrends> {
    const [daily, weekly, monthly] = await Promise.all([
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            customers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            date: '$_id',
            sales: 1,
            orders: 1,
            customers: { $size: '$customers' }
          }
        },
        { $sort: { date: 1 } }
      ]),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-W%U', date: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            customers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            week: '$_id',
            sales: 1,
            orders: 1,
            customers: { $size: '$customers' }
          }
        },
        { $sort: { week: 1 } }
      ]),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            customers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            month: '$_id',
            sales: 1,
            orders: 1,
            customers: { $size: '$customers' }
          }
        },
        { $sort: { month: 1 } }
      ])
    ]);
    return { daily, weekly, monthly };
  }
  /**
   * Obtener productos más vendidos
   */
  private static async getTopProducts(query: any): Promise<TopProducts[]> {
    const topProducts = await Order.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          quantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          averagePrice: { $avg: '$items.unitPrice' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 20 }
    ]);
    // Obtener información de categorías y márgenes de ganancia
    const productIds = topProducts.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds } }).select('category costPrice');
    return topProducts.map(product => {
      const productInfo = products.find(p => p._id.toString() === product._id.toString());
      const costPrice = (productInfo as any)?.costPrice || 0;
      const profitMargin = product.averagePrice > 0 ? ((product.averagePrice - costPrice) / product.averagePrice) * 100 : 0;
      return {
        productId: product._id,
        productName: product.productName,
        sku: product.sku,
        category: productInfo?.category || 'Sin categoría',
        quantitySold: product.quantitySold,
        totalRevenue: product.totalRevenue,
        averagePrice: product.averagePrice,
        profitMargin
      };
    });
  }
  /**
   * Obtener categorías más vendidas
   */
  private static async getTopCategories(query: any): Promise<TopCategories[]> {
    const topCategories = await Order.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          quantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$_id',
          quantitySold: 1,
          totalRevenue: 1,
          orderCount: { $size: '$orderCount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    return topCategories.map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      quantitySold: category.quantitySold,
      totalRevenue: category.totalRevenue,
      averageOrderValue: category.orderCount > 0 ? category.totalRevenue / category.orderCount : 0,
      orderCount: category.orderCount
    }));
  }
  /**
   * Obtener análisis de clientes
   */
  private static async getCustomerAnalytics(query: any, dateFrom: Date, dateTo: Date): Promise<CustomerAnalytics> {
    const [topCustomers, customerSegments, retentionData] = await Promise.all([
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: '$userId',
            totalSpent: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            lastOrderDate: { $max: '$createdAt' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]),
      this.getCustomerSegments(query, dateFrom, dateTo),
      this.getCustomerRetention(query, dateFrom, dateTo)
    ]);
    // Obtener información de usuarios
    const userIds = topCustomers.map(c => c._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    const topCustomersWithInfo = topCustomers.map(customer => {
      const user = users.find(u => u._id.toString() === customer._id.toString());
      return {
        customerId: customer._id,
        customerName: user?.name || 'Cliente',
        email: user?.email || '',
        totalSpent: customer.totalSpent,
        orderCount: customer.orderCount,
        averageOrderValue: customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0,
        lastOrderDate: customer.lastOrderDate
      };
    });
    return {
      topCustomers: topCustomersWithInfo,
      customerSegments,
      customerRetention: retentionData
    };
  }
  /**
   * Obtener segmentos de clientes
   */
  private static async getCustomerSegments(query: any, dateFrom: Date, dateTo: Date): Promise<any> {
    const customerStats = await Order.aggregate([
      { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ]);
    const segments = {
      new: 0,
      returning: 0,
      loyal: 0,
      inactive: 0
    };
    customerStats.forEach(customer => {
      if (customer.orderCount === 1) {
        segments.new++;
      } else if (customer.orderCount >= 2 && customer.orderCount <= 5) {
        segments.returning++;
      } else if (customer.orderCount > 5) {
        segments.loyal++;
      }
    });
    return segments;
  }
  /**
   * Obtener métricas de retención de clientes
   */
  private static async getCustomerRetention(query: any, dateFrom: Date, dateTo: Date): Promise<any> {
    // Implementación simplificada - en producción se necesitaría análisis más complejo
    const totalCustomers = await Order.distinct('userId', { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } });
    const repeatCustomers = await Order.aggregate([
      { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 }
        }
      },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'count' }
    ]);
    const retentionRate = totalCustomers.length > 0 ? (repeatCustomers[0]?.count || 0) / totalCustomers.length * 100 : 0;
    return {
      rate: retentionRate,
      averageLifetime: 0, // Requeriría análisis más complejo
      repeatPurchaseRate: retentionRate
    };
  }
  /**
   * Obtener análisis de métodos de pago
   */
  private static async getPaymentAnalytics(query: any, dateFrom: Date, dateTo: Date): Promise<PaymentAnalytics> {
    const [paymentMethods, paymentTrends] = await Promise.all([
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        {
          $project: {
            method: '$_id',
            count: 1,
            totalAmount: 1
          }
        },
        { $sort: { totalAmount: -1 } }
      ]),
      Order.aggregate([
        { $match: { ...query, createdAt: { $gte: dateFrom, $lte: dateTo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              method: '$paymentMethod'
            },
            amount: { $sum: '$totalAmount' }
          }
        },
        {
          $project: {
            date: '$_id.date',
            method: '$_id.method',
            amount: 1
          }
        },
        { $sort: { date: 1 } }
      ])
    ]);
    const totalAmount = paymentMethods.reduce((sum, method) => sum + method.totalAmount, 0);
    const paymentMethodsWithPercentage = paymentMethods.map(method => ({
      ...method,
      percentage: totalAmount > 0 ? (method.totalAmount / totalAmount) * 100 : 0
    }));
    return {
      paymentMethods: paymentMethodsWithPercentage,
      paymentTrends
    };
  }
  /**
   * Construir query base
   */
  private static async buildQuery(filters: SalesReportFilters): Promise<any> {
    const query: any = {};
    if (filters.storeId) {
      query.storeId = filters.storeId;
    }
    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.categoryId) {
      query['items.productId'] = {
        $in: await Product.find({ category: filters.categoryId }).distinct('_id')
      };
    }
    if (filters.productId) {
      query['items.productId'] = filters.productId;
    }
    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }
    if (filters.orderStatus && filters.orderStatus.length > 0) {
      query.orderStatus = { $in: filters.orderStatus };
    }
    if (filters.customerId) {
      query.userId = filters.customerId;
    }
    // Filtro de búsqueda por texto
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { 'items.productName': searchRegex },
        { 'items.sku': searchRegex },
        { 'customerInfo.name': searchRegex },
        { 'customerInfo.email': searchRegex }
      ];
    }
    return query;
  }
  /**
   * Exportar reporte a CSV
   */
  static async exportSalesReport(filters: SalesReportFilters, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const report = await this.generateSalesReport(filters);
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }
    // Generar CSV
    let csv = 'Fecha,Total Ventas,Total Órdenes,Clientes Únicos,Valor Promedio\n';
    report.trends.daily.forEach(day => {
      csv += `${day.date},${day.sales},${day.orders},${day.customers},${day.orders > 0 ? day.sales / day.orders : 0}\n`;
    });
    return csv;
  }
  /**
   * Generar datos de prueba para el reporte
   */
  static async generateTestData(): Promise<void> {
    try {
      // Verificar si ya existen datos de prueba
      const existingOrders = await Order.countDocuments();
      if (existingOrders > 0) {
        console.log('Ya existen datos en la base de datos');
        return;
      }
      console.log('Generando datos de prueba para reportes de ventas...');
      // Obtener algunos usuarios y productos existentes
      const users = await User.find().limit(5);
      const products = await Product.find().limit(10);
      const stores = await mongoose.model('Store').find().limit(3);
      if (users.length === 0 || products.length === 0 || stores.length === 0) {
        console.log('No hay suficientes datos base para generar órdenes de prueba');
        return;
      }
      const testOrders = [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      // Generar 50 órdenes de prueba en los últimos 30 días
      for (let i = 0; i < 50; i++) {
        const randomDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomStore = stores[Math.floor(Math.random() * stores.length)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = Math.random() * 100 + 10;
        const totalPrice = quantity * unitPrice;
        const taxAmount = totalPrice * 0.12;
        const totalAmount = totalPrice + taxAmount;
        const order = {
          orderNumber: `ORD-${Date.now()}-${i}`,
          transactionId: new mongoose.Types.ObjectId(),
          userId: randomUser?._id,
          storeId: randomStore._id,
          customerInfo: {
            name: randomUser?.name || 'Cliente Test',
            email: randomUser?.email || 'test@example.com',
            phone: '+1234567890',
            address: {
              street: 'Calle Test 123',
              city: 'Ciudad Test',
              state: 'Estado Test',
              zipCode: '12345',
              country: 'País Test'
            }
          },
          items: [{
            productId: randomProduct?._id,
            productName: randomProduct?.name || 'Producto Test',
            sku: randomProduct?.sku || 'SKU-TEST',
            quantity,
            unitPrice,
            totalPrice
          }],
          subtotal: totalPrice,
          taxAmount,
          commissionAmount: totalPrice * 0.05,
          warrantyTotal: 0,
          shippingCost: 5,
          discountAmount: 0,
          totalAmount,
          currency: 'USD',
          orderStatus: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
          paymentStatus: ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)],
          fulfillmentStatus: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
          paymentMethod: ['credit_card', 'debit_card', 'cash', 'transfer'][Math.floor(Math.random() * 4)],
          shippingMethod: 'standard',
          shippingAddress: {
            street: 'Calle Test 123',
            city: 'Ciudad Test',
            state: 'Estado Test',
            zipCode: '12345',
            country: 'País Test'
          },
          warrantyEnabled: false,
          warrantyLevel: 'none',
          warrantyCoverage: 0,
          createdAt: randomDate,
          updatedAt: randomDate
        };
        testOrders.push(order);
      }
      await Order.insertMany(testOrders);
      console.log(`Generados ${testOrders.length} órdenes de prueba`);
    } catch (error) {
      console.error('Error generando datos de prueba:', error);
    }
  }
  /**
   * Generar datos de prueba específicos para gestores de tienda
   */
  static async generateStoreManagerTestData(userEmail: string): Promise<void> {
    try {
      // Buscar el usuario gestor de tienda
      const user = await User.findOne({ email: userEmail, role: 'store_manager' });
      if (!user) {
        console.log('Usuario gestor de tienda no encontrado');
        return;
      }
      // Información de email no loggeada por seguridad`);
      // Obtener las tiendas asociadas al usuario
      const userStores = await mongoose.model('Store').find({
        $or: [
          { managers: user._id },
          { _id: { $in: user.stores || [] } }
        ]
      });
      if (userStores.length === 0) {
        console.log('No se encontraron tiendas asociadas al usuario');
        return;
      }
      userStores.forEach(store => {
        console.log(`  - ${store.name} (${store.city})`);
      });
      // Obtener productos existentes
      const products = await Product.find().limit(20);
      if (products.length === 0) {
        console.log('No hay productos disponibles para generar órdenes');
        return;
      }
      // Obtener algunos usuarios clientes
      const customers = await User.find({ role: 'client' }).limit(10);
      if (customers.length === 0) {
        console.log('No hay clientes disponibles, creando clientes de prueba...');
        // Crear algunos clientes de prueba
        const testCustomers = [];
        for (let i = 0; i < 5; i++) {
          const customer = new User({
            name: `Cliente Test ${i + 1}`,
            email: `cliente${i + 1}@test.com`,
            password: 'password123',
            role: 'client',
            isEmailVerified: true,
            isActive: true
          });
          testCustomers.push(customer);
        }
        await User.insertMany(testCustomers);
        customers.push(...testCustomers);
      }
      const testOrders = [];
      const now = new Date();
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 días = 2 meses
      // Generar más órdenes para mejor visualización de gráficos (80 órdenes en 2 meses)
      for (let i = 0; i < 80; i++) {
        const randomDate = new Date(twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime()));
        const randomStore = userStores[Math.floor(Math.random() * userStores.length)];
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        // Generar 1-4 productos por orden
        const numItems = Math.floor(Math.random() * 4) + 1;
        const items = [];
        let subtotal = 0;
        for (let j = 0; j < numItems; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 unidades
          const unitPrice = Math.random() * 300 + 25; // Precios entre $25 y $325
          const totalPrice = quantity * unitPrice;
          subtotal += totalPrice;
          items.push({
            productId: randomProduct?._id,
            productName: randomProduct?.name || 'Producto Test',
            sku: randomProduct?.sku || 'SKU-TEST',
            quantity,
            unitPrice,
            totalPrice
          });
        }
        const taxAmount = subtotal * 0.12;
        const shippingCost = subtotal > 150 ? 0 : 8; // Envío gratis sobre $150
        const discountAmount = Math.random() > 0.75 ? subtotal * 0.15 : 0; // 15% de descuento ocasional
        const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;
        const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const paymentStatuses = ['pending', 'paid', 'failed'];
        const fulfillmentStatuses = ['pending', 'processing', 'shipped', 'delivered'];
        const paymentMethods = ['credit_card', 'debit_card', 'cash', 'transfer'];
        const order = {
          orderNumber: `ORD-${randomStore.name.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
          transactionId: new mongoose.Types.ObjectId(),
          userId: randomCustomer?._id,
          storeId: randomStore._id,
          customerInfo: {
            name: randomCustomer?.name || 'Cliente Test',
            email: randomCustomer?.email || 'test@example.com',
            phone: `+58${Math.floor(Math.random() * 900000000) + 100000000}`,
            address: {
              street: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 50) + 1}`,
              city: randomStore.city || 'Caracas',
              state: randomStore.state || 'Distrito Capital',
              zipCode: '1010',
              country: 'Venezuela'
            }
          },
          items,
          subtotal,
          taxAmount,
          commissionAmount: subtotal * 0.05,
          warrantyTotal: 0,
          shippingCost,
          discountAmount,
          totalAmount,
          currency: 'USD',
          orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
          fulfillmentStatus: fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          shippingMethod: 'standard',
          shippingAddress: {
            street: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 50) + 1}`,
            city: randomStore.city || 'Caracas',
            state: randomStore.state || 'Distrito Capital',
            zipCode: '1010',
            country: 'Venezuela'
          },
          warrantyEnabled: false,
          warrantyLevel: 'none',
          warrantyCoverage: 0,
          createdAt: randomDate,
          updatedAt: randomDate
        };
        testOrders.push(order);
      }
      await Order.insertMany(testOrders);
      console.log(`📊 Resumen:`);
      console.log(`   - Órdenes generadas: ${testOrders.length}`);
      console.log(`   - Período: ${twoMonthsAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`);
      console.log(`   - Duración: 2 meses (60 días)`);
      // Mostrar estadísticas por tienda
      const statsByStore: Record<string, { orders: number; total: number }> = {};
      testOrders.forEach(order => {
        const storeName = userStores.find(s => s._id.toString() === order.storeId.toString())?.name || 'Tienda Desconocida';
        if (!statsByStore[storeName]) {
          statsByStore[storeName] = { orders: 0, total: 0 };
        }
        statsByStore[storeName].orders++;
        statsByStore[storeName].total += order.totalAmount;
      });
      Object.entries(statsByStore).forEach(([storeName, stats]) => {
        console.log(`   - ${storeName}: ${stats.orders} órdenes, $${stats.total.toFixed(2)}`);
      });
      // Mostrar distribución temporal
      const weeklyStats: Record<string, { orders: number; total: number }> = {};
      testOrders.forEach(order => {
        const week = new Date(order.createdAt).toISOString().slice(0, 10).split('-').slice(0, 2).join('-W');
        if (!weeklyStats[week]) {
          weeklyStats[week] = { orders: 0, total: 0 };
        }
        weeklyStats[week].orders++;
        weeklyStats[week].total += order.totalAmount;
      });
      console.log(`📈 Distribución semanal:`);
      Object.entries(weeklyStats).sort().forEach(([week, stats]) => {
        console.log(`   - Semana ${week}: ${stats.orders} órdenes, $${stats.total.toFixed(2)}`);
      });
    } catch (error) {
      console.error('Error generando datos de prueba para gestor de tienda:', error);
      throw error;
    }
  }
}