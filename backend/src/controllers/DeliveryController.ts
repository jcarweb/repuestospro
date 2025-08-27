import { Request, Response } from 'express';
import Delivery, { IDelivery } from '../models/Delivery';
import Rider, { IRider } from '../models/Rider';
import Order from '../models/Order';
import Store from '../models/Store';
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
      delivery.trackingUrl = `${process.env.FRONTEND_URL}/tracking/${delivery.trackingCode}`;

      await delivery.save();

      // Intentar asignar automáticamente
      const assignmentResult = await DeliveryAssignmentService.assignDelivery(
        delivery._id.toString(),
        delivery.assignmentConfig
      );

      if (assignmentResult.success) {
        delivery.status = 'assigned';
        await delivery.save();
      }

      res.status(201).json({
        success: true,
        data: delivery,
        assignment: assignmentResult
      });

    } catch (error) {
      console.error('Error creando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener todos los deliveries con filtros
   */
  static async getDeliveries(req: Request, res: Response) {
    try {
      const {
        status,
        riderType,
        storeId,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20
      } = req.query;

      const filter: any = {};

      if (status) filter.status = status;
      if (riderType) filter.riderType = riderType;
      if (storeId) filter.storeId = storeId;

      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const deliveries = await Delivery.find(filter)
        .populate('orderId')
        .populate('storeId')
        .populate('customerId')
        .populate('riderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Delivery.countDocuments(filter);

      res.json({
        success: true,
        data: deliveries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      console.error('Error obteniendo deliveries:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener un delivery específico
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
   * Actualizar estado del delivery
   */
  static async updateDeliveryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      // Actualizar estado
      await delivery.updateStatus(status, notes, req.user?.email);

      // Si el estado es 'picked_up', registrar tiempo de recogida
      if (status === 'picked_up') {
        delivery.actualPickupTime = new Date();
      }

      // Si el estado es 'delivered', registrar tiempo de entrega
      if (status === 'delivered') {
        delivery.actualDeliveryTime = new Date();
      }

      await delivery.save();

      res.json({
        success: true,
        data: delivery,
        message: `Estado actualizado a: ${status}`
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Asignar delivery manualmente
   */
  static async assignDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { riderId, assignmentConfig } = req.body;

      const delivery = await Delivery.findById(id);
      if (!delivery) {
        return res.status(404).json({ message: 'Delivery no encontrado' });
      }

      const rider = await Rider.findById(riderId);
      if (!rider) {
        return res.status(404).json({ message: 'Rider no encontrado' });
      }

      // Verificar que el rider esté disponible
      if (!rider.availability.isAvailable || !rider.availability.isOnline) {
        return res.status(400).json({ message: 'Rider no está disponible' });
      }

      // Actualizar asignación
      delivery.riderId = rider._id;
      delivery.riderType = rider.type;
      delivery.riderName = `${rider.firstName} ${rider.lastName}`;
      delivery.riderPhone = rider.phone;
      delivery.status = 'assigned';

      if (rider.vehicle) {
        delivery.riderVehicle = {
          type: rider.vehicle.type,
          plate: rider.vehicle.plate,
          model: rider.vehicle.model
        };
      }

      // Agregar al historial
      delivery.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(),
        notes: `Asignado manualmente a ${rider.firstName} ${rider.lastName}`,
        updatedBy: req.user?.email || 'admin'
      });

      await delivery.save();

      res.json({
        success: true,
        data: delivery,
        message: `Delivery asignado a ${rider.firstName} ${rider.lastName}`
      });

    } catch (error) {
      console.error('Error asignando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Reasignar delivery
   */
  static async reassignDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newRiderId, reason } = req.body;

      const result = await DeliveryAssignmentService.reassignDelivery(
        id,
        newRiderId,
        reason
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      const delivery = await Delivery.findById(id)
        .populate('riderId');

      res.json({
        success: true,
        data: delivery,
        message: result.message
      });

    } catch (error) {
      console.error('Error reasignando delivery:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener riders disponibles
   */
  static async getAvailableRiders(req: Request, res: Response) {
    try {
      const { lat, lng, maxDistance = 10 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ message: 'Coordenadas requeridas' });
      }

      const riders = await DeliveryAssignmentService.findAvailableRiders(
        Number(lat),
        Number(lng),
        Number(maxDistance)
      );

      res.json({
        success: true,
        data: riders,
        count: riders.length
      });

    } catch (error) {
      console.error('Error obteniendo riders disponibles:', error);
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
        if (delivery.actualPickupTime && delivery.actualDeliveryTime) {
          const pickup = new Date(delivery.actualPickupTime);
          const delivery_time = new Date(delivery.actualDeliveryTime);
          const timeDiff = (delivery_time.getTime() - pickup.getTime()) / (1000 * 60); // minutos
          averageDeliveryTime += timeDiff;

          if (delivery.estimatedDeliveryTime) {
            const estimated = new Date(delivery.estimatedDeliveryTime);
            if (delivery_time <= estimated) {
              onTimeDeliveries++;
            } else {
              lateDeliveries++;
            }
          }
        }
      }

      if (deliveredDeliveriesData.length > 0) {
        averageDeliveryTime = averageDeliveryTime / deliveredDeliveriesData.length;
      }

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
          onTimeRate: deliveredDeliveries > 0 ? (onTimeDeliveries / deliveredDeliveries) * 100 : 0
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  /**
   * Obtener tracking de delivery
   */
  static async getDeliveryTracking(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;

      const delivery = await Delivery.findOne({ trackingCode })
        .populate('orderId')
        .populate('storeId')
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
}

export default DeliveryController;
