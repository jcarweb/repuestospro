import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Store from '../models/Store';
import Subscription from '../models/Subscription';

export class AnalyticsController {
  
  /**
   * Verificar acceso a analytics basado en suscripción
   */
  static async checkAnalyticsAccess(req: Request, res: Response) {
    try {
      const { storeId } = req.query;
      
      console.log('🔍 AnalyticsController - storeId recibido:', storeId);
      console.log('🔍 AnalyticsController - storeId type:', typeof storeId);
      
      if (!storeId) {
        return res.status(400).json({ 
          success: false, 
          message: 'storeId es requerido' 
        });
      }

      // Buscar suscripción de la tienda
      console.log('🔍 AnalyticsController - Buscando suscripción con storeId:', storeId);
      
      const subscription = await Subscription.findOne({ 
        storeId, 
        status: 'active' 
      }).sort({ createdAt: -1 });

      console.log('🔍 AnalyticsController - Suscripción encontrada:', subscription ? 'Sí' : 'No');
      if (subscription) {
        console.log('🔍 AnalyticsController - Plan:', subscription.planName, 'Tipo:', subscription.planType);
      }

      if (!subscription) {
        return res.json({
          success: true,
          hasAccess: false,
          reason: 'No tienes una suscripción activa. Actualiza a un plan Pro o Elite.',
          subscription: {
            name: 'Sin Suscripción',
            type: 'none',
            price: 0
          },
          requiresUpgrade: true
        });
      }

      // Verificar si el plan incluye analytics
      const hasAnalyticsAccess = ['pro', 'elite'].includes(subscription.planType);

      if (!hasAnalyticsAccess) {
        return res.json({
          success: true,
          hasAccess: false,
          reason: `Plan ${subscription.planName} no incluye analytics avanzado. Actualiza a Pro o Elite.`,
          subscription: {
            name: subscription.planName,
            type: subscription.planType,
            price: subscription.price
          },
          requiresUpgrade: true
        });
      }

      res.json({
        success: true,
        hasAccess: true,
        subscription: {
          name: subscription.planName,
          type: subscription.planType,
          price: subscription.price,
          expiresAt: subscription.expiresAt
        }
      });

    } catch (error) {
      console.error('Error verificando acceso a analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener datos de analytics para una tienda
   */
  static async getStoreAnalytics(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const { dateFrom, dateTo } = req.query;

      // Verificar acceso primero
      const subscription = await Subscription.findOne({ 
        storeId, 
        status: 'active' 
      }).sort({ createdAt: -1 });

      if (!subscription || !['pro', 'elite'].includes(subscription.planType)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a analytics avanzado'
        });
      }

      // Fechas para el análisis
      const startDate = dateFrom ? new Date(dateFrom as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const endDate = dateTo ? new Date(dateTo as string) : new Date();

      // Obtener órdenes de la tienda
      const orders = await Order.find({
        storeId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('customerId');

      // Obtener productos de la tienda
      const products = await Product.find({ storeId });

      // Calcular métricas de ventas
      const salesData = await AnalyticsController.calculateSalesMetrics(orders, startDate, endDate);
      
      // Calcular métricas de productos
      const productsData = await AnalyticsController.calculateProductsMetrics(products, orders);
      
      // Calcular métricas de clientes
      const customersData = await AnalyticsController.calculateCustomersMetrics(orders);
      
      // Calcular métricas de pedidos
      const ordersData = await AnalyticsController.calculateOrdersMetrics(orders);
      
      // Calcular métricas de ingresos
      const revenueData = await AnalyticsController.calculateRevenueMetrics(orders);

      res.json({
        success: true,
        data: {
          sales: salesData,
          products: productsData,
          customers: customersData,
          orders: ordersData,
          revenue: revenueData
        }
      });

    } catch (error) {
      console.error('Error obteniendo analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Calcular métricas de ventas
   */
  private static async calculateSalesMetrics(orders: any[], startDate: Date, endDate: Date) {
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Ventas del mes actual
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthOrders = orders.filter(order => order.createdAt >= currentMonthStart);
    const thisMonthSales = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Ventas del mes anterior
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    const lastMonthOrders = orders.filter(order => 
      order.createdAt >= lastMonthStart && order.createdAt <= lastMonthEnd
    );
    const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Cálculo de crecimiento
    const growth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

    // Datos diarios (últimos 30 días)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const dayOrders = orders.filter(order => 
        order.createdAt >= dayStart && order.createdAt < dayEnd
      );
      const daySales = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      dailyData.push({
        date: date.toLocaleDateString('es-VE', { month: 'short', day: 'numeric' }),
        sales: daySales
      });
    }

    // Datos mensuales (últimos 12 meses)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );
      const monthSales = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      monthlyData.push({
        month: date.toLocaleDateString('es-VE', { month: 'short', year: 'numeric' }),
        sales: monthSales
      });
    }

    return {
      total: totalSales,
      thisMonth: thisMonthSales,
      lastMonth: lastMonthSales,
      growth,
      dailyData,
      monthlyData
    };
  }

  /**
   * Calcular métricas de productos
   */
  private static async calculateProductsMetrics(products: any[], orders: any[]) {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    // Productos más vendidos
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        if (productSales[item.productId]) {
          productSales[item.productId] += item.quantity;
        } else {
          productSales[item.productId] = item.quantity;
        }
      });
    });

    const totalSales = Object.values(productSales).reduce((sum: any, sales: any) => sum + sales, 0);
    const topSelling = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p._id.toString() === productId);
        return {
          name: product?.name || 'Producto Desconocido',
          sales: sales as number,
          percentage: totalSales > 0 ? ((sales as number) / totalSales) * 100 : 0
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return {
      total,
      active,
      lowStock,
      outOfStock,
      topSelling
    };
  }

  /**
   * Calcular métricas de clientes
   */
  private static async calculateCustomersMetrics(orders: any[]) {
    const uniqueCustomers = new Set(orders.map(order => order.customerId?.toString()).filter(Boolean));
    const total = uniqueCustomers.size;

    // Clientes nuevos este mes
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newCustomersThisMonth = new Set();
    orders
      .filter(order => order.createdAt >= currentMonthStart)
      .forEach(order => {
        if (order.customerId) {
          newCustomersThisMonth.add(order.customerId.toString());
        }
      });

    // Clientes recurrentes
    const customerOrderCounts = {};
    orders.forEach(order => {
      if (order.customerId) {
        const customerId = order.customerId.toString();
        customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
      }
    });

    const returning = Object.values(customerOrderCounts).filter((count: any) => count > 1).length;

    // Valor promedio por pedido
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Segmentación de clientes
    const segments = {
      'Nuevos': newCustomersThisMonth.size,
      'Recurrentes': returning,
      'Ocasionales': total - newCustomersThisMonth.size - returning
    };

    const customerSegments = Object.entries(segments).map(([segment, count]) => ({
      segment,
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0
    }));

    return {
      total,
      newThisMonth: newCustomersThisMonth.size,
      returning,
      averageOrderValue,
      customerSegments
    };
  }

  /**
   * Calcular métricas de pedidos
   */
  private static async calculateOrdersMetrics(orders: any[]) {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    // Tiempo promedio de procesamiento
    const completedOrders = orders.filter(order => order.status === 'completed' && order.completedAt);
    const totalProcessingTime = completedOrders.reduce((sum, order) => {
      const processingTime = new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime();
      return sum + processingTime;
    }, 0);
    const averageProcessingTime = completedOrders.length > 0 ? 
      (totalProcessingTime / completedOrders.length) / (1000 * 60 * 60) : 0; // en horas

    // Distribución de estados
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const orderStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0
    }));

    return {
      total,
      pending,
      completed,
      cancelled,
      averageProcessingTime,
      orderStatusDistribution
    };
  }

  /**
   * Calcular métricas de ingresos
   */
  private static async calculateRevenueMetrics(orders: any[]) {
    const total = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Ingresos del mes actual
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthOrders = orders.filter(order => order.createdAt >= currentMonthStart);
    const thisMonth = currentMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Ingresos del mes anterior
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    const lastMonthOrders = orders.filter(order => 
      order.createdAt >= lastMonthStart && order.createdAt <= lastMonthEnd
    );
    const lastMonth = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Cálculo de crecimiento
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Ingresos por categoría (simulado)
    const revenueByCategory = [
      { category: 'Repuestos', revenue: total * 0.6, percentage: 60 },
      { category: 'Herramientas', revenue: total * 0.25, percentage: 25 },
      { category: 'Accesorios', revenue: total * 0.15, percentage: 15 }
    ];

    return {
      total,
      thisMonth,
      lastMonth,
      growth,
      revenueByCategory
    };
  }
}

export default AnalyticsController;
