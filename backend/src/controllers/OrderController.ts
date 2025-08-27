import { Request, Response } from 'express';
import { OrderService, OrderCreationData, OrderUpdateData, OrderFilters } from '../services/OrderService';
import mongoose from 'mongoose';

export class OrderController {

  /**
   * Crear una nueva orden desde una transacción
   */
  public createOrder = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const {
        transactionId,
        storeId,
        customerInfo,
        items,
        subtotal,
        taxAmount,
        commissionAmount,
        warrantyTotal,
        shippingCost,
        discountAmount,
        totalAmount,
        currency,
        paymentMethod,
        shippingMethod,
        shippingAddress,
        warrantyEnabled,
        warrantyLevel,
        warrantyCoverage,
        notes,
        priority,
        source
      } = req.body;

      // Validar datos requeridos
      if (!transactionId || !storeId || !customerInfo || !items || !shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Datos requeridos faltantes'
        });
      }

      const orderData: OrderCreationData = {
        transactionId: new mongoose.Types.ObjectId(transactionId),
        userId: new mongoose.Types.ObjectId(userId),
        storeId: new mongoose.Types.ObjectId(storeId),
        customerInfo,
        items: items.map((item: any) => ({
          ...item,
          productId: new mongoose.Types.ObjectId(item.productId)
        })),
        subtotal: subtotal || 0,
        taxAmount: taxAmount || 0,
        commissionAmount: commissionAmount || 0,
        warrantyTotal: warrantyTotal || 0,
        shippingCost: shippingCost || 0,
        discountAmount: discountAmount || 0,
        totalAmount: totalAmount || 0,
        currency: currency || 'USD',
        paymentMethod,
        shippingMethod,
        shippingAddress,
        warrantyEnabled: warrantyEnabled || false,
        warrantyLevel: warrantyLevel || 'none',
        warrantyCoverage: warrantyCoverage || 0,
        notes,
        priority: priority || 'normal',
        source: source || 'web',
        createdBy: new mongoose.Types.ObjectId(userId)
      };

      const order = await OrderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: {
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.orderStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener órdenes del usuario
   */
  public getUserOrders = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.parseFilters(req.query);

      const result = await OrderService.getUserOrders(
        new mongoose.Types.ObjectId(userId), 
        page, 
        limit, 
        filters
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener órdenes del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener órdenes de la tienda (para store managers)
   */
  public getStoreOrders = async (req: Request, res: Response) => {
    try {
      const storeId = (req as any).user.storeId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.parseFilters(req.query);

      const result = await OrderService.getStoreOrders(
        new mongoose.Types.ObjectId(storeId), 
        page, 
        limit, 
        filters
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener órdenes de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener todas las órdenes (admin)
   */
  public getAllOrders = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = this.parseFilters(req.query);

      const result = await OrderService.getAllOrders(page, limit, filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener todas las órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener orden por ID
   */
  public getOrderById = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let order;
      
      if (userRole === 'admin') {
        order = await OrderService.getOrderById(orderId);
      } else if (userRole === 'store_manager') {
        order = await OrderService.getOrderById(orderId, undefined, new mongoose.Types.ObjectId(storeId));
      } else {
        order = await OrderService.getOrderById(orderId, new mongoose.Types.ObjectId(userId));
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        data: { order }
      });

    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar orden
   */
  public updateOrder = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;
      const updateData: OrderUpdateData = req.body;

      let order;
      
      if (userRole === 'admin') {
        order = await OrderService.updateOrder(orderId, updateData);
      } else if (userRole === 'store_manager') {
        order = await OrderService.updateOrder(orderId, updateData, undefined, new mongoose.Types.ObjectId(storeId));
      } else {
        order = await OrderService.updateOrder(orderId, updateData, new mongoose.Types.ObjectId(userId));
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Orden actualizada exitosamente',
        data: { order }
      });

    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  };

  /**
   * Cancelar orden
   */
  public cancelOrder = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let order;
      
      if (userRole === 'admin') {
        order = await OrderService.cancelOrder(orderId, reason);
      } else if (userRole === 'store_manager') {
        order = await OrderService.cancelOrder(orderId, reason, undefined, new mongoose.Types.ObjectId(storeId));
      } else {
        order = await OrderService.cancelOrder(orderId, reason, new mongoose.Types.ObjectId(userId));
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Orden cancelada exitosamente',
        data: { order }
      });

    } catch (error) {
      console.error('Error al cancelar orden:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  };

  /**
   * Asignar orden a un empleado
   */
  public assignOrder = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { assignedTo } = req.body;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      if (userRole !== 'admin' && userRole !== 'store_manager') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para asignar órdenes'
        });
      }

      let order;
      
      if (userRole === 'admin') {
        order = await OrderService.assignOrder(orderId, new mongoose.Types.ObjectId(assignedTo));
      } else {
        order = await OrderService.assignOrder(orderId, new mongoose.Types.ObjectId(assignedTo), new mongoose.Types.ObjectId(storeId));
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Orden asignada exitosamente',
        data: { order }
      });

    } catch (error) {
      console.error('Error al asignar orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Asignar delivery a una orden
   */
  public assignDelivery = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { deliveryId } = req.body;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      if (userRole !== 'admin' && userRole !== 'store_manager') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para asignar delivery'
        });
      }

      let order;
      
      if (userRole === 'admin') {
        order = await OrderService.assignDelivery(orderId, new mongoose.Types.ObjectId(deliveryId));
      } else {
        order = await OrderService.assignDelivery(orderId, new mongoose.Types.ObjectId(deliveryId), new mongoose.Types.ObjectId(storeId));
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Delivery asignado exitosamente',
        data: { order }
      });

    } catch (error) {
      console.error('Error al asignar delivery:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener estadísticas de órdenes
   */
  public getOrderStats = async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

      let stats;
      
      if (userRole === 'admin') {
        stats = await OrderService.getOrderStats(undefined, dateFrom, dateTo);
      } else {
        stats = await OrderService.getOrderStats(new mongoose.Types.ObjectId(storeId), dateFrom, dateTo);
      }

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener órdenes por estado
   */
  public getOrdersByStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let orders;
      
      if (userRole === 'admin') {
        orders = await OrderService.getOrdersByStatus(status as any);
      } else {
        orders = await OrderService.getOrdersByStatus(status as any, new mongoose.Types.ObjectId(storeId), limit);
      }

      res.json({
        success: true,
        data: { orders }
      });

    } catch (error) {
      console.error('Error al obtener órdenes por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener órdenes urgentes
   */
  public getUrgentOrders = async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let orders;
      
      if (userRole === 'admin') {
        orders = await OrderService.getUrgentOrders();
      } else {
        orders = await OrderService.getUrgentOrders(new mongoose.Types.ObjectId(storeId));
      }

      res.json({
        success: true,
        data: { orders }
      });

    } catch (error) {
      console.error('Error al obtener órdenes urgentes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Buscar órdenes
   */
  public searchOrders = async (req: Request, res: Response) => {
    try {
      const { searchTerm } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Término de búsqueda requerido'
        });
      }

      let result;
      
      if (userRole === 'admin') {
        result = await OrderService.searchOrders(searchTerm as string, undefined, page, limit);
      } else {
        result = await OrderService.searchOrders(searchTerm as string, new mongoose.Types.ObjectId(storeId), page, limit);
      }

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al buscar órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Exportar órdenes
   */
  public exportOrders = async (req: Request, res: Response) => {
    try {
      const format = (req.query.format as 'csv' | 'json') || 'csv';
      const filters = this.parseFilters(req.query);
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let data;
      
      if (userRole === 'admin') {
        data = await OrderService.exportOrders(filters, undefined, format);
      } else {
        data = await OrderService.exportOrders(filters, new mongoose.Types.ObjectId(storeId), format);
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(data);
      } else {
        res.json({
          success: true,
          data: { orders: data }
        });
      }

    } catch (error) {
      console.error('Error al exportar órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Parsear filtros de la query
   */
  private parseFilters(query: any): OrderFilters {
    const filters: OrderFilters = {};

    if (query.status) {
      filters.status = Array.isArray(query.status) ? query.status : [query.status];
    }

    if (query.paymentStatus) {
      filters.paymentStatus = Array.isArray(query.paymentStatus) ? query.paymentStatus : [query.paymentStatus];
    }

    if (query.priority) {
      filters.priority = Array.isArray(query.priority) ? query.priority : [query.priority];
    }

    if (query.source) {
      filters.source = Array.isArray(query.source) ? query.source : [query.source];
    }

    if (query.dateFrom) {
      filters.dateFrom = new Date(query.dateFrom);
    }

    if (query.dateTo) {
      filters.dateTo = new Date(query.dateTo);
    }

    if (query.customerEmail) {
      filters.customerEmail = query.customerEmail;
    }

    if (query.assignedTo) {
      filters.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
    }

    if (query.tags) {
      filters.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    }

    return filters;
  }
}
