import { Request, Response } from 'express';
import Delivery, { IDelivery } from '../models/Delivery';
import Rider, { IRider } from '../models/Rider';
import Order from '../models/Order';
import Store from '../models/Store';
import User from '../models/User';
import DeliveryAssignmentService, { AssignmentConfig } from '../services/DeliveryAssignmentService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class DeliveryController {
  /**
   * Crear un nuevo delivery
   */
  static async createDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        res.status(404).json({ message: 'Orden no encontrada' });
        return;
      }
      
      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      
      // Crear el delivery
      const delivery = new Delivery({
        orderId,
        storeId,
        customerId,
        pickupLocation: {
          address: pickupLocation.address,
          coordinates: pickupLocation.coordinates,
          storeName: store?.name || ''
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
      delivery.trackingCode = (delivery as any).generateTrackingCode();
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
   * Obtener delivery específico
   */
  static async getDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const delivery = await Delivery.findById(id)
        .populate('orderId')
        .populate('storeId')
        .populate('customerId')
        .populate('riderId');
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery no encontrado' });
        return;
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
  static async updateDeliveryStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const delivery = await Delivery.findById(id);
      
      if (!delivery) {
        res.status(404).json({ message: 'Delivery no encontrado' });
        return;
      }
      
      delivery.status = status;
      if (delivery.statusHistory) {
        delivery.statusHistory.push({
          status,
          timestamp: new Date(),
          note: notes
        });
      }
      
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
   * Actualizar estado de disponibilidad del delivery
   */
  static async updateDeliveryAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
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
   * Obtener riders disponibles
   */
  static async getAvailableRiders(req: AuthenticatedRequest, res: Response) {
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
   * Actualizar configuración del delivery
   */
  static async updateDeliverySettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
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
}

export default DeliveryController;

// Export individual functions for backward compatibility
export const registerDelivery = DeliveryController.createDelivery;
export const getDelivery = DeliveryController.getDelivery;
export const updateDelivery = DeliveryController.updateDeliverySettings;
export const updateAvailability = DeliveryController.updateDeliveryAvailability;
export const getAvailableDeliverys = DeliveryController.getAvailableRiders;
export const updateDeliveryStatus = DeliveryController.updateDeliveryStatus;
