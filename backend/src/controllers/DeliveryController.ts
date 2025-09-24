import { Request, Response } from 'express';
import Delivery, { IDelivery } from '../models/Delivery';
import Rider, { IRider } from '../models/Rider';
import Order from '../models/Order';
import Store from '../models/Store';
import User from '../models/User';
import DeliveryAssignmentService, { AssignmentConfig } from '../services/DeliveryAssignmentService';

export class DeliveryController {
  
  /**
   * Crear un nuevo delivery
   */
  static async createDelivery(req: Request, res: Response) {
    try {
      const {
        orderId,
        storeId,
        customerId,
        pickupLocation,
        deliveryLocation,
        deliveryFee,
        assignmentConfig
      } = req.body;

      // Verificar que la orden existe
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada' });
      }

      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Tienda no encontrada' });
      }

      // Crear el delivery
      const delivery = new Delivery({
        orderId,
        storeId,
        customerId,
        pickupLocation: {
          address: pickupLocation.address,
          coordinates: pickupLocation.coordinates,
          storeName: store.name
        },
        deliveryLocation: {
          address: deliveryLocation.address,
          coordinates: deliveryLocation.coordinates,
          customerName: deliveryLocation.customerName,
          customerPhone: deliveryLocation.customerPhone,
          instructions: deliveryLocation.instructions
        },
        deliveryFee,
        riderPayment: deliveryFee * 0.8, // 80% para el rider
        platformFee: deliveryFee * 0.2, // 20% para la plataforma
        assignmentConfig: assignmentConfig || {
          priority: 'internal_first',
          internalPercentage: 80,
          maxWaitTime: 15,
          maxDistance: 10
        }
      });

      // Generar código de tracking
      delivery.trackingCode = delivery.generateTrackingCode();

      await delivery.save();

      res.status(201).json({
        success: true,
        data: delivery,
        message: 'Delivery creado exitosamente'
      });

    } catch (error) {
      console.error('Error creando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener deliveries
   */
  static async getDeliveries(req: Request, res: Response) {
    try {
      const { status, riderType, dateFrom, dateTo, limit = 50, page = 1 } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (riderType) filter.riderType = riderType;
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [deliveries, total] = await Promise.all([
        Delivery.find(filter)
          .populate('orderId')
          .populate('storeId')
          .populate('customerId')
          .populate('riderId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit as string)),
        Delivery.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: deliveries,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Error obteniendo deliveries:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener delivery específico
   */
  static async getDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const delivery = await Delivery.findById(id)
        .populate('orderId')
        .populate('storeId')
        .populate('customerId')
        .populate('riderId');

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      res.json({
        success: true,
        data: delivery
      });

    } catch (error) {
      console.error('Error obteniendo delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar estado de delivery
   */
  static async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      delivery.status = status;
      delivery.statusHistory.push({
        status,
        timestamp: new Date(),
        notes,
        updatedBy: (req as any).user.id
      });

      await delivery.save();

      res.json({
        success: true,
        data: delivery,
        message: 'Estado actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener estadísticas de delivery
   */
  static async getDeliveryStats(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, storeId } = req.query;

      const filter: any = {};
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
      }
      if (storeId) filter.storeId = storeId;

      const [
        totalDeliveries,
        pendingDeliveries,
        assignedDeliveries,
        inTransitDeliveries,
        deliveredDeliveries,
        cancelledDeliveries,
        internalDeliveries,
        externalDeliveries
      ] = await Promise.all([
        Delivery.countDocuments(filter),
        Delivery.countDocuments({ ...filter, status: 'pending' }),
        Delivery.countDocuments({ ...filter, status: 'assigned' }),
        Delivery.countDocuments({ ...filter, status: { $in: ['picked_up', 'in_transit'] } }),
        Delivery.countDocuments({ ...filter, status: 'delivered' }),
        Delivery.countDocuments({ ...filter, status: 'cancelled' }),
        Delivery.countDocuments({ ...filter, riderType: 'internal' }),
        Delivery.countDocuments({ ...filter, riderType: 'external' })
      ]);

      // Calcular métricas adicionales
      const deliveredDeliveriesData = await Delivery.find({ ...filter, status: 'delivered' });
      
      const totalRevenue = deliveredDeliveriesData.reduce((sum, d) => sum + d.deliveryFee, 0);
      const totalRiderPayments = deliveredDeliveriesData.reduce((sum, d) => sum + d.riderPayment, 0);
      const totalPlatformFees = deliveredDeliveriesData.reduce((sum, d) => sum + d.platformFee, 0);

      // Calcular tiempo promedio de entrega
      let averageDeliveryTime = 0;
      let onTimeDeliveries = 0;
      let lateDeliveries = 0;

      for (const delivery of deliveredDeliveriesData) {
        if (delivery.estimatedDeliveryTime && delivery.actualDeliveryTime) {
          const estimated = new Date(delivery.estimatedDeliveryTime);
          const actual = new Date(delivery.actualDeliveryTime);
          
          if (actual <= estimated) {
            onTimeDeliveries++;
          } else {
            lateDeliveries++;
          }
        }
      }

      const totalCompleted = onTimeDeliveries + lateDeliveries;
      averageDeliveryTime = totalCompleted > 0 ? 
        deliveredDeliveriesData.reduce((sum, d) => {
          if (d.estimatedDeliveryTime && d.actualDeliveryTime) {
            const estimated = new Date(d.estimatedDeliveryTime);
            const actual = new Date(d.actualDeliveryTime);
            return sum + (actual.getTime() - estimated.getTime()) / (1000 * 60); // minutos
          }
          return sum;
        }, 0) / totalCompleted : 0;

      const onTimeRate = totalCompleted > 0 ? (onTimeDeliveries / totalCompleted) * 100 : 0;

      res.json({
        success: true,
        data: {
          totalDeliveries,
          pendingDeliveries,
          assignedDeliveries,
          inTransitDeliveries,
          deliveredDeliveries,
          cancelledDeliveries,
          internalDeliveries,
          externalDeliveries,
          totalRevenue,
          totalRiderPayments,
          totalPlatformFees,
          averageDeliveryTime: Math.round(averageDeliveryTime),
          onTimeDeliveries,
          lateDeliveries,
          onTimeRate: Math.round(onTimeRate * 100) / 100
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener estadísticas personales del delivery
   */
  static async getPersonalDeliveryStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      // Obtener deliveries asignados al usuario
      const deliveries = await Delivery.find({ riderId: userId });

      // Calcular estadísticas básicas
      const totalDeliveries = deliveries.length;
      const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      const cancelledDeliveries = deliveries.filter(d => d.status === 'cancelled').length;

      // Calcular ganancias
      const totalEarnings = deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + d.riderPayment, 0);

      // Calcular distancia total
      const totalDistance = deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => {
          // Calcular distancia entre pickup y delivery
          const distance = this.calculateDistance(
            d.pickupLocation.coordinates.lat,
            d.pickupLocation.coordinates.lng,
            d.deliveryLocation.coordinates.lat,
            d.deliveryLocation.coordinates.lng
          );
          return sum + distance;
        }, 0);

      // Calcular tiempo promedio y entregas a tiempo
      let averageDeliveryTime = 0;
      let onTimeDeliveries = 0;
      let lateDeliveries = 0;

      const completedDeliveriesData = deliveries.filter(d => d.status === 'delivered');
      for (const delivery of completedDeliveriesData) {
        if (delivery.estimatedDeliveryTime && delivery.actualDeliveryTime) {
          const estimated = new Date(delivery.estimatedDeliveryTime);
          const actual = new Date(delivery.actualDeliveryTime);
          
          if (actual <= estimated) {
            onTimeDeliveries++;
          } else {
            lateDeliveries++;
          }
        }
      }

      const totalCompleted = onTimeDeliveries + lateDeliveries;
      averageDeliveryTime = totalCompleted > 0 ? 
        completedDeliveriesData.reduce((sum, d) => {
          if (d.estimatedDeliveryTime && d.actualDeliveryTime) {
            const estimated = new Date(d.estimatedDeliveryTime);
            const actual = new Date(d.actualDeliveryTime);
            return sum + (actual.getTime() - estimated.getTime()) / (1000 * 60); // minutos
          }
          return sum;
        }, 0) / totalCompleted : 0;

      const onTimeRate = totalCompleted > 0 ? (onTimeDeliveries / totalCompleted) * 100 : 0;

      // Calcular estadísticas del mes actual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentMonthDeliveries = deliveries.filter(d => {
        const deliveryDate = new Date(d.createdAt);
        return deliveryDate >= startOfMonth && deliveryDate <= endOfMonth;
      }).length;

      const currentMonthEarnings = deliveries
        .filter(d => {
          const deliveryDate = new Date(d.createdAt);
          return deliveryDate >= startOfMonth && deliveryDate <= endOfMonth && d.status === 'delivered';
        })
        .reduce((sum, d) => sum + d.riderPayment, 0);

      // Obtener calificación promedio del usuario
      const user = await User.findById(userId);
      const averageRating = user?.rating?.average || 0;
      const totalReviews = user?.rating?.totalReviews || 0;

      res.json({
        success: true,
        data: {
          totalDeliveries,
          completedDeliveries,
          cancelledDeliveries,
          totalEarnings,
          totalDistance: Math.round(totalDistance * 100) / 100,
          averageDeliveryTime: Math.round(averageDeliveryTime),
          onTimeDeliveries,
          lateDeliveries,
          onTimeRate: Math.round(onTimeRate * 100) / 100,
          currentMonthDeliveries,
          currentMonthEarnings,
          averageRating,
          totalReviews
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas personales:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar estado de disponibilidad del delivery
   */
  static async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { deliveryStatus, currentLocation } = req.body;

      // Actualizar estado del usuario
      await User.findByIdAndUpdate(userId, {
        deliveryStatus,
        ...(currentLocation && { location: currentLocation })
      });

      // Si hay ubicación actual, actualizar también en el perfil de rider
      if (currentLocation) {
        await Rider.findOneAndUpdate(
          { userId },
          {
            'availability.currentLocation': {
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              timestamp: new Date()
            }
          }
        );
      }

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener perfil del delivery
   */
  static async getDeliveryProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Obtener información del rider si existe
      const rider = await Rider.findOne({ userId });

      const profile = {
        _id: user._id,
        firstName: user.name.split(' ')[0] || user.name,
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone,
        deliveryStatus: user.deliveryStatus || 'unavailable',
        autoStatusMode: user.autoStatusMode || false,
        currentOrder: user.currentOrder,
        deliveryZone: user.deliveryZone || { center: [0, 0], radius: 10 },
        vehicleInfo: user.vehicleInfo || { type: '', model: '', plate: '' },
        workSchedule: user.workSchedule || { startTime: '08:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5, 6, 0] },
        rating: user.rating || { average: 0, totalReviews: 0 },
        stats: rider?.stats || {
          totalDeliveries: 0,
          completedDeliveries: 0,
          totalEarnings: 0,
          averageDeliveryTime: 0
        }
      };

      res.json({
        success: true,
        data: profile
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Tracking público
   */
  static async getDeliveryTracking(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;

      const delivery = await Delivery.findOne({ trackingCode })
        .populate('orderId')
        .populate('storeId')
        .populate('customerId')
        .populate('riderId');

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      res.json({
        success: true,
        data: delivery
      });

    } catch (error) {
      console.error('Error obteniendo tracking:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener riders disponibles
   */
  static async getAvailableRiders(req: Request, res: Response) {
    try {
      const { lat, lng, maxDistance = 10 } = req.query;

      const riders = await DeliveryAssignmentService.findAvailableRiders(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(maxDistance as string)
      );

      res.json({
        success: true,
        data: riders
      });

    } catch (error) {
      console.error('Error obteniendo riders disponibles:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Calificar delivery
   */
  static async rateDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, review, type } = req.body; // type: 'customer' | 'rider'

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      if (type === 'customer') {
        delivery.customerRating = rating;
        delivery.customerReview = review;
      } else if (type === 'rider') {
        delivery.riderRating = rating;
        delivery.riderReview = review;
      }

      await delivery.save();

      // Si es calificación del cliente, actualizar estadísticas del rider
      if (type === 'customer' && delivery.riderId) {
        await DeliveryAssignmentService.updateRiderStats(delivery.riderId.toString());
      }

      res.json({
        success: true,
        data: delivery,
        message: 'Calificación guardada exitosamente'
      });

    } catch (error) {
      console.error('Error calificando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Cancelar delivery
   */
  static async cancelDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      // Solo permitir cancelar si está en estado pendiente o asignado
      if (!['pending', 'assigned'].includes(delivery.status)) {
        return res.status(400).json({ 
          message: 'No se puede cancelar un delivery que ya está en proceso' 
        });
      }

      await delivery.updateStatus('cancelled', reason, req.user?.email);

      res.json({
        success: true,
        data: delivery,
        message: 'Delivery cancelado exitosamente'
      });

    } catch (error) {
      console.error('Error cancelando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener órdenes asignadas al delivery
   */
  static async getDeliveryOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { status, limit = 50, page = 1 } = req.query;

      const filter: any = { riderId: userId };
      if (status) filter.status = status;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [orders, total] = await Promise.all([
        Delivery.find(filter)
          .populate('orderId')
          .populate('storeId')
          .populate('customerId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit as string)),
        Delivery.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Error obteniendo órdenes del delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar estado de una orden específica
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status, notes, location } = req.body;
      const userId = (req as any).user._id;

      const delivery = await Delivery.findOne({ 
        orderId, 
        riderId: userId 
      });

      if (!delivery) {
        return res.status(404).json({ message: 'Orden no encontrada o no asignada' });
      }

      delivery.status = status;
      delivery.statusHistory.push({
        status,
        timestamp: new Date(),
        notes,
        updatedBy: userId,
        location
      });

      // Actualizar ubicación actual del rider si se proporciona
      if (location) {
        await Rider.findOneAndUpdate(
          { userId },
          {
            'availability.currentLocation': {
              lat: location.lat,
              lng: location.lng,
              timestamp: new Date()
            }
          }
        );
      }

      await delivery.save();

      res.json({
        success: true,
        data: delivery,
        message: 'Estado actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener ubicaciones de entrega para el mapa
   */
  static async getDeliveryLocations(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { status } = req.query;

      const filter: any = { riderId: userId };
      if (status) filter.status = status;

      const deliveries = await Delivery.find(filter)
        .populate('orderId')
        .populate('customerId')
        .select('orderId customerId deliveryLocation status estimatedDeliveryTime priority');

      const locations = deliveries.map(delivery => ({
        id: delivery._id,
        orderNumber: delivery.orderId?.orderNumber || 'N/A',
        customerName: delivery.customerId?.name || 'Cliente',
        address: delivery.deliveryLocation.address,
        coordinates: delivery.deliveryLocation.coordinates,
        status: delivery.status,
        estimatedTime: delivery.estimatedDeliveryTime,
        priority: delivery.priority || 'medium'
      }));

      res.json({
        success: true,
        data: locations
      });

    } catch (error) {
      console.error('Error obteniendo ubicaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener reportes de delivery
   */
  static async getDeliveryReports(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { period = 'week', dateFrom, dateTo } = req.query;

      let startDate: Date;
      let endDate: Date = new Date();

      if (dateFrom && dateTo) {
        startDate = new Date(dateFrom as string);
        endDate = new Date(dateTo as string);
      } else {
        // Calcular fechas basadas en el período
        const now = new Date();
        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
      }

      const filter = {
        riderId: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      };

      const deliveries = await Delivery.find(filter);

      // Calcular estadísticas
      const totalDeliveries = deliveries.length;
      const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      const failedDeliveries = deliveries.filter(d => d.status === 'cancelled').length;
      const totalEarnings = deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + d.riderPayment, 0);

      // Calcular tiempo promedio
      const completedDeliveriesData = deliveries.filter(d => d.status === 'delivered');
      let averageDeliveryTime = 0;
      if (completedDeliveriesData.length > 0) {
        const totalTime = completedDeliveriesData.reduce((sum, d) => {
          if (d.estimatedDeliveryTime && d.actualDeliveryTime) {
            const estimated = new Date(d.estimatedDeliveryTime);
            const actual = new Date(d.actualDeliveryTime);
            return sum + (actual.getTime() - estimated.getTime()) / (1000 * 60); // minutos
          }
          return sum;
        }, 0);
        averageDeliveryTime = totalTime / completedDeliveriesData.length;
      }

      // Calcular distancia total
      const totalDistance = completedDeliveriesData.reduce((sum, d) => {
        const distance = this.calculateDistance(
          d.pickupLocation.coordinates.lat,
          d.pickupLocation.coordinates.lng,
          d.deliveryLocation.coordinates.lat,
          d.deliveryLocation.coordinates.lng
        );
        return sum + distance;
      }, 0);

      // Obtener calificación promedio
      const user = await User.findById(userId);
      const averageRating = user?.rating?.average || 0;

      // Generar reportes diarios
      const dailyReports = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayDeliveries = deliveries.filter(d => {
          const deliveryDate = new Date(d.createdAt);
          return deliveryDate >= dayStart && deliveryDate < dayEnd;
        });

        const dayCompleted = dayDeliveries.filter(d => d.status === 'delivered').length;
        const dayEarnings = dayDeliveries
          .filter(d => d.status === 'delivered')
          .reduce((sum, d) => sum + d.riderPayment, 0);

        const dayDistance = dayDeliveries
          .filter(d => d.status === 'delivered')
          .reduce((sum, d) => {
            const distance = this.calculateDistance(
              d.pickupLocation.coordinates.lat,
              d.pickupLocation.coordinates.lng,
              d.deliveryLocation.coordinates.lat,
              d.deliveryLocation.coordinates.lng
            );
            return sum + distance;
          }, 0);

        dailyReports.push({
          date: dayStart.toISOString(),
          deliveries: dayDeliveries.length,
          completed: dayCompleted,
          failed: dayDeliveries.length - dayCompleted,
          earnings: dayEarnings,
          distance: dayDistance,
          rating: averageRating
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.json({
        success: true,
        data: {
          stats: {
            totalDeliveries,
            completedDeliveries,
            failedDeliveries,
            averageDeliveryTime: Math.round(averageDeliveryTime),
            totalEarnings,
            averageRating,
            totalDistance: Math.round(totalDistance * 100) / 100,
            fuelCost: totalDistance * 0.15, // Estimación de costo de combustible
            netEarnings: totalEarnings - (totalDistance * 0.15)
          },
          daily: dailyReports
        }
      });

    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener calificaciones del delivery
   */
  static async getDeliveryRatings(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { rating, limit = 50, page = 1 } = req.query;

      const filter: any = { riderId: userId, customerRating: { $exists: true } };
      if (rating) filter.customerRating = parseInt(rating as string);

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [deliveries, total] = await Promise.all([
        Delivery.find(filter)
          .populate('customerId', 'name avatar')
          .populate('orderId', 'orderNumber')
          .select('customerRating customerReview createdAt orderId customerId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit as string)),
        Delivery.countDocuments(filter)
      ]);

      const ratings = deliveries.map(delivery => ({
        id: delivery._id,
        orderNumber: delivery.orderId?.orderNumber || 'N/A',
        customerName: delivery.customerId?.name || 'Cliente',
        customerAvatar: delivery.customerId?.avatar,
        rating: delivery.customerRating,
        comment: delivery.customerReview,
        date: delivery.createdAt,
        categories: {
          punctuality: delivery.customerRating || 0,
          service: delivery.customerRating || 0,
          communication: delivery.customerRating || 0,
          packaging: delivery.customerRating || 0
        },
        isVerified: true
      }));

      // Calcular estadísticas de calificaciones
      const allRatings = await Delivery.find({ 
        riderId: userId, 
        customerRating: { $exists: true } 
      }).select('customerRating');

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRatingSum = 0;
      let totalRatings = 0;

      allRatings.forEach(delivery => {
        const rating = delivery.customerRating;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
          totalRatingSum += rating;
          totalRatings++;
        }
      });

      const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

      res.json({
        success: true,
        data: {
          ratings,
          stats: {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings,
            ratingDistribution,
            categoryAverages: {
              punctuality: averageRating,
              service: averageRating,
              communication: averageRating,
              packaging: averageRating
            },
            recentTrend: 'up' // TODO: Calcular tendencia real
          }
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Error obteniendo calificaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener horario de trabajo del delivery
   */
  static async getDeliverySchedule(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const schedule = {
        isAutoSchedule: user.autoStatusMode || false,
        workDays: user.workSchedule?.daysOfWeek || [1, 2, 3, 4, 5, 6, 0],
        startTime: user.workSchedule?.startTime || '08:00',
        endTime: user.workSchedule?.endTime || '18:00',
        maxHoursPerDay: 8,
        maxHoursPerWeek: 40,
        timeZone: 'America/Caracas',
        notifications: {
          shiftReminder: true,
          breakReminder: true,
          endShiftReminder: true
        }
      };

      res.json({
        success: true,
        data: schedule
      });

    } catch (error) {
      console.error('Error obteniendo horario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar horario de trabajo del delivery
   */
  static async updateDeliverySchedule(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { isAutoSchedule, workDays, startTime, endTime, notifications } = req.body;

      const updateData: any = {
        autoStatusMode: isAutoSchedule,
        workSchedule: {
          daysOfWeek: workDays,
          startTime,
          endTime
        }
      };

      await User.findByIdAndUpdate(userId, updateData);

      res.json({
        success: true,
        message: 'Horario actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando horario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener configuración del delivery
   */
  static async getDeliverySettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const settings = {
        vehicle: user.vehicleInfo || {
          type: 'motorcycle',
          brand: '',
          model: '',
          year: '',
          plate: '',
          color: ''
        },
        deliveryZone: user.deliveryZone || {
          center: { latitude: 10.4806, longitude: -66.9036 },
          radius: 10,
          name: 'Zona Central'
        },
        notifications: {
          newOrders: true,
          orderUpdates: true,
          locationSharing: true,
          earningsUpdates: true,
          systemAlerts: true
        },
        privacy: {
          shareLocation: true,
          showOnlineStatus: true,
          allowDirectCalls: true
        },
        performance: {
          autoAcceptOrders: false,
          maxOrdersPerDay: 20,
          preferredDeliveryTime: '08:00'
        }
      };

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar configuración del delivery
   */
  static async updateDeliverySettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { vehicle, deliveryZone, notifications, privacy, performance } = req.body;

      const updateData: any = {};

      if (vehicle) updateData.vehicleInfo = vehicle;
      if (deliveryZone) updateData.deliveryZone = deliveryZone;
      if (notifications) updateData.notifications = notifications;
      if (privacy) updateData.privacy = privacy;
      if (performance) updateData.performance = performance;

      await User.findByIdAndUpdate(userId, updateData);

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener datos de ubicación del delivery
   */
  static async getDeliveryLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;

      const user = await User.findById(userId);
      const rider = await Rider.findOne({ userId });

      const locationData = {
        currentLocation: user?.location || {
          latitude: 10.4806,
          longitude: -66.9036,
          accuracy: 5,
          timestamp: new Date().toISOString()
        },
        settings: {
          isTracking: rider?.availability?.isOnline || false,
          shareWithStore: true,
          shareWithCustomers: false,
          updateInterval: 30,
          batteryOptimization: true,
          backgroundTracking: false
        },
        status: {
          status: user?.deliveryStatus || 'offline',
          lastUpdate: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        data: locationData
      });

    } catch (error) {
      console.error('Error obteniendo datos de ubicación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Actualizar ubicación del delivery
   */
  static async updateDeliveryLocation(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { location, settings } = req.body;

      const updateData: any = {};
      if (location) {
        updateData.location = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date()
        };
      }

      await User.findByIdAndUpdate(userId, updateData);

      // Actualizar también en el perfil de rider
      if (location) {
        await Rider.findOneAndUpdate(
          { userId },
          {
            'availability.currentLocation': {
              lat: location.latitude,
              lng: location.longitude,
              timestamp: new Date()
            },
            'availability.isOnline': settings?.isTracking || false
          }
        );
      }

      res.json({
        success: true,
        message: 'Ubicación actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener ganancias del delivery
   */
  static async getDeliveryEarnings(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      const { period = 'week', dateFrom, dateTo } = req.query;

      let startDate: Date;
      let endDate: Date = new Date();

      if (dateFrom && dateTo) {
        startDate = new Date(dateFrom as string);
        endDate = new Date(dateTo as string);
      } else {
        const now = new Date();
        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
      }

      const filter = {
        riderId: userId,
        status: 'delivered',
        createdAt: { $gte: startDate, $lte: endDate }
      };

      const deliveries = await Delivery.find(filter);

      // Calcular ganancias
      const totalEarnings = deliveries.reduce((sum, d) => sum + d.riderPayment, 0);
      const baseEarnings = deliveries.reduce((sum, d) => sum + (d.riderPayment * 0.8), 0);
      const tips = deliveries.reduce((sum, d) => sum + (d.riderPayment * 0.2), 0);
      const bonuses = 0; // TODO: Implementar sistema de bonos
      const deductions = 0; // TODO: Implementar sistema de deducciones

      // Calcular estadísticas de períodos
      const now = new Date();
      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [thisWeekDeliveries, lastWeekDeliveries, thisMonthDeliveries, lastMonthDeliveries] = await Promise.all([
        Delivery.find({ riderId: userId, status: 'delivered', createdAt: { $gte: thisWeekStart } }),
        Delivery.find({ riderId: userId, status: 'delivered', createdAt: { $gte: lastWeekStart, $lt: thisWeekStart } }),
        Delivery.find({ riderId: userId, status: 'delivered', createdAt: { $gte: thisMonthStart } }),
        Delivery.find({ riderId: userId, status: 'delivered', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } })
      ]);

      const thisWeek = thisWeekDeliveries.reduce((sum, d) => sum + d.riderPayment, 0);
      const lastWeek = lastWeekDeliveries.reduce((sum, d) => sum + d.riderPayment, 0);
      const thisMonth = thisMonthDeliveries.reduce((sum, d) => sum + d.riderPayment, 0);
      const lastMonth = lastMonthDeliveries.reduce((sum, d) => sum + d.riderPayment, 0);

      // Generar historial de pagos (mock)
      const payments = [
        {
          id: '1',
          date: new Date().toISOString(),
          amount: thisWeek,
          type: 'weekly',
          description: 'Pago semanal',
          status: 'completed',
          method: 'bank_transfer',
          reference: 'TRF-2024-001'
        }
      ];

      // Generar comisiones (mock)
      const commissions = deliveries.slice(0, 10).map(delivery => ({
        orderId: delivery._id,
        orderNumber: delivery.orderId?.orderNumber || 'N/A',
        date: delivery.createdAt,
        baseAmount: delivery.riderPayment * 0.8,
        tipAmount: delivery.riderPayment * 0.2,
        bonusAmount: 0,
        totalAmount: delivery.riderPayment,
        status: 'paid'
      }));

      res.json({
        success: true,
        data: {
          earnings: {
            totalEarnings,
            baseEarnings,
            tips,
            bonuses,
            deductions,
            netEarnings: totalEarnings - deductions,
            totalDeliveries: deliveries.length,
            averagePerDelivery: deliveries.length > 0 ? totalEarnings / deliveries.length : 0,
            thisWeek,
            lastWeek,
            thisMonth,
            lastMonth
          },
          payments,
          commissions
        }
      });

    } catch (error) {
      console.error('Error obteniendo ganancias:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Calcular distancia entre dos puntos
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default DeliveryController;
