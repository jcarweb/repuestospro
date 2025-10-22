import { Request, Response } from 'express';
import Delivery, { IDelivery } from '../models/Delivery';
import Rider, { IRider } from '../models/Rider';
import Order from '../models/Order';
import Store from '../models/Store';
import User from '../models/User';
import DeliveryWallet from '../models/DeliveryWallet';
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
      userId,
      personalInfo,
      vehicleInfo,
      workInfo,
      documents
    } = req.body;

    // Verificar si ya existe un delivery con este userId
    const existingDelivery = await Delivery.findOne({ userId });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un delivery registrado con este usuario'
      });
    }

    // Crear wallet para el delivery
    const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deliveryWallet = new DeliveryWallet({
      deliveryId: walletId,
      currentBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      pendingWithdrawal: 0
    });

    await deliveryWallet.save();

    // Crear el delivery
    const delivery = new Delivery({
      userId,
      personalInfo,
      vehicleInfo,
      workInfo,
      documents,
      wallet: {
        walletId,
        currentBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingWithdrawal: 0
      }
    });

    await delivery.save();

    // Log del registro
    await DeliveryLog.create({
      deliveryId: delivery._id,
      action: 'delivery_registered',
      description: 'Nuevo delivery registrado en el sistema',
      level: 'info',
      category: 'delivery',
      metadata: {
        userId,
        walletId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Delivery registrado exitosamente',
      data: {
        deliveryId: delivery._id,
        walletId,
        status: delivery.status
      }
    });
    return;

  } catch (error) {
    console.error('Error registering delivery:', error);
    
    await DeliveryLog.create({
      action: 'delivery_registration_error',
      description: 'Error al registrar delivery',
      level: 'error',
      category: 'delivery',
      metadata: {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stackTrace: error instanceof Error ? error.stack : undefined
      }
    });

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Obtener información del delivery
export const getDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery no encontrado'
      });
    }

    res.json({
      success: true,
      data: delivery
    });
    return;

  } catch (error) {
    console.error('Error getting delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Actualizar información del delivery
export const updateDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery no encontrado'
      });
    }

    await DeliveryLog.create({
      deliveryId: id,
      action: 'delivery_updated',
      description: 'Información del delivery actualizada',
      level: 'info',
      category: 'delivery',
      metadata: {
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Delivery actualizado exitosamente',
      data: delivery
    });
    return;

  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Cambiar estado de disponibilidad
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availabilityStatus, currentLocation } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      {
        'workInfo.availabilityStatus': availabilityStatus,
        'workInfo.currentLocation': currentLocation ? {
          ...currentLocation,
          lastUpdate: new Date()
        } : undefined,
        'performance.lastActiveDate': new Date()
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery no encontrado'
      });
    }

    await DeliveryLog.create({
      deliveryId: id,
      action: 'availability_updated',
      description: `Estado de disponibilidad cambiado a: ${availabilityStatus}`,
      level: 'info',
      category: 'delivery',
      metadata: {
        availabilityStatus,
        currentLocation
      }
    });

    res.json({
      success: true,
      message: 'Estado de disponibilidad actualizado',
      data: {
        availabilityStatus: delivery.workInfo.availabilityStatus,
        currentLocation: delivery.workInfo.currentLocation
      }
    });
    return;

  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Obtener deliverys disponibles por zona
export const getAvailableDeliverys = async (req: Request, res: Response) => {
  try {
    const { zone, lat, lng, maxDistance = 10 } = req.query;

    let query: any = {
      status: 'approved',
      isActive: true,
      'workInfo.availabilityStatus': 'available'
    };

    if (zone) {
      query['workInfo.zones'] = zone;
    }

    let deliverys = await Delivery.find(query);

    // Filtrar por distancia si se proporcionan coordenadas
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxDist = parseFloat(maxDistance as string);

      deliverys = deliverys.filter(delivery => {
        if (!delivery.workInfo.currentLocation) return false;
        
        const distance = calculateDistance(
          userLat,
          userLng,
          delivery.workInfo.currentLocation.lat,
          delivery.workInfo.currentLocation.lng
        );

        return distance <= maxDist;
      });
    }

    // Ordenar por rating y distancia
    deliverys.sort((a, b) => {
      const ratingDiff = b.performance.rating - a.performance.rating;
      if (ratingDiff !== 0) return ratingDiff;
      
      // Si tienen el mismo rating, ordenar por distancia
      if (lat && lng) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        
        const distanceA = (a as any).workInfo.currentLocation ? 
          calculateDistance(userLat, userLng, (a as any).workInfo.currentLocation.lat, (a as any).workInfo.currentLocation.lng) : 
          Infinity;
        const distanceB = (b as any).workInfo.currentLocation ? 
          calculateDistance(userLat, userLng, (b as any).workInfo.currentLocation.lat, (b as any).workInfo.currentLocation.lng) : 
          Infinity;
        
        return distanceA - distanceB;
      }
      
      return 0;
    });

    res.json({
      success: true,
      data: deliverys.map(delivery => ({
        _id: delivery._id,
        personalInfo: {
          firstName: delivery.personalInfo.firstName,
          lastName: delivery.personalInfo.lastName,
          phone: delivery.personalInfo.phone
        },
        vehicleInfo: {
          type: delivery.vehicleInfo.type,
          brand: delivery.vehicleInfo.brand,
          model: delivery.vehicleInfo.model
        },
        performance: {
          rating: delivery.performance.rating,
          totalDeliveries: delivery.performance.totalDeliveries,
          averageDeliveryTime: delivery.performance.averageDeliveryTime
        },
        workInfo: {
          currentLocation: delivery.workInfo.currentLocation,
          zones: delivery.workInfo.zones
        }
      }))
    });

  } catch (error) {
    console.error('Error getting available deliverys:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Aprobar/Rechazar delivery
export const updateDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { 
        status,
        'documents.rejectionReason': rejectionReason,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery no encontrado'
      });
    }

    // Si se aprueba, activar la wallet
    if (status === 'approved') {
      await DeliveryWallet.findOneAndUpdate(
        { deliveryId: delivery.wallet.walletId },
        { isActive: true }
      );
    }

    await DeliveryLog.create({
      deliveryId: id,
      action: 'delivery_status_updated',
      description: `Estado del delivery cambiado a: ${status}`,
      level: 'info',
      category: 'delivery',
      metadata: {
        status,
        rejectionReason
      }
    });

    res.json({
      success: true,
      message: `Delivery ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`,
      data: delivery
    });
    return;

  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Función auxiliar para calcular distancia
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}