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
