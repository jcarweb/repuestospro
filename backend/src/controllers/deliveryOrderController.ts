import { Request, Response } from 'express';
import DeliveryOrder from '../models/DeliveryOrder';
import Delivery from '../models/Delivery';
import DeliveryTransaction from '../models/DeliveryTransaction';
import DeliveryWallet from '../models/DeliveryWallet';
import DeliveryLog from '../models/DeliveryLog';
// import { calculateDeliveryPayment } from '../services/deliveryPaymentService';
import { notificationService } from '../services/notificationService';

// Asignar pedido a delivery
export const assignOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      customerId,
      storeId,
      pickupInfo,
      deliveryInfo,
      orderDetails,
      metadata
    } = req.body;

    // Buscar delivery disponible más cercano
    const availableDeliverys = await Delivery.find({
      status: 'approved',
      isActive: true,
      'workInfo.availabilityStatus': 'available',
      'workInfo.zones': metadata.zone
    });

    if (availableDeliverys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay deliverys disponibles en esta zona'
      });
    }

    // Calcular distancias y seleccionar el más cercano
    let selectedDelivery = null;
    let minDistance = Infinity;

    for (const delivery of availableDeliverys) {
      if (delivery.workInfo.currentLocation) {
        const distance = calculateDistance(
          pickupInfo.storeCoordinates.lat,
          pickupInfo.storeCoordinates.lng,
          delivery.workInfo.currentLocation.lat,
          delivery.workInfo.currentLocation.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          selectedDelivery = delivery;
        }
      }
    }

    if (!selectedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo encontrar un delivery cercano'
      });
    }

    // Calcular pago del delivery
    // const paymentInfo = await calculateDeliveryPayment({
    //   distance: minDistance,
    //   orderValue: orderDetails.totalValue,
    //   zone: metadata.zone,
    //   peakHours: metadata.peakHours,
    //   weatherCondition: metadata.weatherCondition,
    //   priority: metadata.priority
    // });
    
    // Placeholder: Simular cálculo de pago
    const paymentInfo = {
      basePayment: 5.00,
      distanceFee: minDistance * 0.5,
      zoneMultiplier: metadata.zone === 'premium' ? 1.2 : 1.0,
      peakHoursMultiplier: metadata.peakHours ? 1.3 : 1.0,
      totalPayment: 5.00 + (minDistance * 0.5) * (metadata.zone === 'premium' ? 1.2 : 1.0) * (metadata.peakHours ? 1.3 : 1.0),
      estimatedTime: Math.round(minDistance * 2) // 2 minutos por km
    };

    // Crear el pedido de delivery
    const deliveryOrder = new DeliveryOrder({
      orderId,
      deliveryId: selectedDelivery._id,
      customerId,
      storeId,
      pickupInfo,
      deliveryInfo,
      orderDetails,
      paymentInfo,
      metadata,
      performance: {
        distance: minDistance,
        estimatedTime: paymentInfo.estimatedTime
      }
    });

    await deliveryOrder.save();

    // Actualizar estado del delivery
    await Delivery.findByIdAndUpdate(selectedDelivery._id, {
      'workInfo.availabilityStatus': 'busy'
    });

    // Log de la asignación
    await DeliveryLog.create({
      deliveryId: selectedDelivery._id,
      orderId,
      action: 'order_assigned',
      description: `Pedido asignado al delivery ${selectedDelivery.personalInfo.firstName}`,
      level: 'info',
      category: 'delivery',
      metadata: {
        orderValue: orderDetails.totalValue,
        distance: minDistance,
        paymentAmount: paymentInfo.totalPayment
      }
    });

    // Enviar notificación al delivery
      await notificationService.sendNotification(
        selectedDelivery._id,
        'new_order',
        'Nuevo pedido asignado',
        `Tienes un nuevo pedido de $${orderDetails.totalValue}`,
        {
          orderId,
          pickupAddress: pickupInfo.storeAddress,
          deliveryAddress: deliveryInfo.deliveryAddress
        }
      );

    return res.status(201).json({
      success: true,
      message: 'Pedido asignado exitosamente',
      data: {
        deliveryOrderId: deliveryOrder._id,
        deliveryId: selectedDelivery._id,
        deliveryName: `${selectedDelivery.personalInfo.firstName} ${selectedDelivery.personalInfo.lastName}`,
        paymentInfo
      }
    });

  } catch (error) {
    console.error('Error assigning order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar pedido como recogido
export const markPickedUp = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { deliveryId } = req.body;

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { orderId, deliveryId, status: 'assigned' },
      {
        status: 'picked_up',
        'tracking.pickedUpAt': new Date()
      },
      { new: true }
    );

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o ya procesado'
      });
    }

    await DeliveryLog.create({
      deliveryId,
      orderId,
      action: 'order_picked_up',
      description: 'Pedido recogido por el delivery',
      level: 'info',
      category: 'delivery'
    });

    return res.json({
      success: true,
      message: 'Pedido marcado como recogido',
      data: deliveryOrder
    });

  } catch (error) {
    console.error('Error marking order as picked up:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar pedido como en tránsito
export const markInTransit = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { deliveryId, currentLocation } = req.body;

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { orderId, deliveryId, status: 'picked_up' },
      {
        status: 'in_transit',
        'tracking.inTransitAt': new Date()
      },
      { new: true }
    );

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no está en estado correcto'
      });
    }

    // Actualizar ubicación del delivery
    await Delivery.findByIdAndUpdate(deliveryId, {
      'workInfo.currentLocation': {
        ...currentLocation,
        lastUpdate: new Date()
      }
    });

    await DeliveryLog.create({
      deliveryId,
      orderId,
      action: 'order_in_transit',
      description: 'Pedido en tránsito',
      level: 'info',
      category: 'delivery',
      metadata: { currentLocation }
    });

    return res.json({
      success: true,
      message: 'Pedido marcado como en tránsito',
      data: deliveryOrder
    });

  } catch (error) {
    console.error('Error marking order as in transit:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Completar entrega
export const completeDelivery = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { deliveryId, rating, feedback, actualDeliveryTime } = req.body;

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { orderId, deliveryId, status: 'in_transit' },
      {
        status: 'delivered',
        'tracking.deliveredAt': new Date(),
        'deliveryInfo.actualDeliveryTime': actualDeliveryTime || new Date(),
        'performance.rating': rating,
        'performance.feedback': feedback
      },
      { new: true }
    );

    if (deliveryOrder) {
      // Actualizar campos que dependen del deliveryOrder
      await DeliveryOrder.findByIdAndUpdate(deliveryOrder._id, {
        'performance.actualTime': calculateDeliveryTime(deliveryOrder.tracking.pickedUpAt || new Date(), new Date()),
        'performance.onTime': isOnTime(deliveryOrder.deliveryInfo.estimatedDeliveryTime, new Date())
      });
    }

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no está en estado correcto'
      });
    }

    // Procesar pago del delivery
    await processDeliveryPayment(deliveryOrder);

    // Actualizar estadísticas del delivery
    await updateDeliveryStats(deliveryId, deliveryOrder);

    // Marcar delivery como disponible
    await Delivery.findByIdAndUpdate(deliveryId, {
      'workInfo.availabilityStatus': 'available'
    });

    await DeliveryLog.create({
      deliveryId,
      orderId,
      action: 'delivery_completed',
      description: 'Entrega completada exitosamente',
      level: 'info',
      category: 'delivery',
      metadata: {
        rating,
        paymentAmount: deliveryOrder.paymentInfo.totalPayment
      }
    });

    return res.json({
      success: true,
      message: 'Entrega completada exitosamente',
      data: {
        orderId,
        paymentAmount: deliveryOrder.paymentInfo.totalPayment,
        rating
      }
    });

  } catch (error) {
    console.error('Error completing delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cancelar pedido
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { deliveryId, reason } = req.body;

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { orderId, deliveryId },
      {
        status: 'cancelled',
        'tracking.cancelledAt': new Date(),
        'tracking.failureReason': reason
      },
      { new: true }
    );

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Marcar delivery como disponible
    await Delivery.findByIdAndUpdate(deliveryId, {
      'workInfo.availabilityStatus': 'available'
    });

    await DeliveryLog.create({
      deliveryId,
      orderId,
      action: 'order_cancelled',
      description: `Pedido cancelado: ${reason}`,
      level: 'warning',
      category: 'delivery',
      metadata: { reason }
    });

    return res.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: deliveryOrder
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener pedidos del delivery
export const getDeliveryOrders = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { deliveryId };
    if (status) query.status = status;

    const orders = await DeliveryOrder
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await DeliveryOrder.countDocuments(query);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting delivery orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Funciones auxiliares
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateDeliveryTime(pickedUpAt: Date, deliveredAt: Date): number {
  return Math.round((deliveredAt.getTime() - pickedUpAt.getTime()) / (1000 * 60));
}

function isOnTime(estimatedTime: Date, actualTime: Date): boolean {
  const timeDiff = actualTime.getTime() - estimatedTime.getTime();
  return timeDiff <= 15 * 60 * 1000; // 15 minutos de tolerancia
}

async function processDeliveryPayment(deliveryOrder: any) {
  // Crear transacción de pago
  const transaction = new DeliveryTransaction({
    deliveryId: deliveryOrder.deliveryId,
    walletId: deliveryOrder.deliveryId, // Asumiendo que walletId = deliveryId
    orderId: deliveryOrder.orderId,
    type: 'delivery_payment',
    amount: deliveryOrder.paymentInfo.totalPayment,
    description: `Pago por entrega - Pedido ${deliveryOrder.orderId}`,
    status: 'completed',
    processedAt: new Date(),
    metadata: {
      deliveryFee: deliveryOrder.paymentInfo.deliveryFee,
      bonusAmount: deliveryOrder.paymentInfo.bonusAmount,
      distance: deliveryOrder.performance.distance,
      deliveryTime: deliveryOrder.performance.actualTime,
      rating: deliveryOrder.performance.rating,
      zone: deliveryOrder.metadata.zone,
      peakHours: deliveryOrder.metadata.peakHours,
      weatherCondition: deliveryOrder.metadata.weatherCondition,
      orderValue: deliveryOrder.orderDetails.totalValue,
      commissionDeduction: deliveryOrder.paymentInfo.commissionDeduction
    }
  });

  await transaction.save();

  // Actualizar wallet
  await DeliveryWallet.findOneAndUpdate(
    { deliveryId: deliveryOrder.deliveryId },
    {
      $inc: {
        currentBalance: deliveryOrder.paymentInfo.totalPayment,
        totalEarned: deliveryOrder.paymentInfo.totalPayment
      }
    }
  );
}

async function updateDeliveryStats(deliveryId: string, deliveryOrder: any) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) return;

  const newTotalDeliveries = delivery.performance.totalDeliveries + 1;
  const newCompletedDeliveries = delivery.performance.completedDeliveries + 1;
  const newOnTimeDeliveries = delivery.performance.onTimeDeliveries + 
    (deliveryOrder.performance.onTime ? 1 : 0);
  
  const newAverageDeliveryTime = 
    (delivery.performance.averageDeliveryTime * delivery.performance.completedDeliveries + 
     deliveryOrder.performance.actualTime) / newCompletedDeliveries;

  const newRating = deliveryOrder.performance.rating ? 
    (delivery.performance.rating * delivery.performance.completedDeliveries + 
     deliveryOrder.performance.rating) / newCompletedDeliveries : 
    delivery.performance.rating;

  await Delivery.findByIdAndUpdate(deliveryId, {
    'performance.totalDeliveries': newTotalDeliveries,
    'performance.completedDeliveries': newCompletedDeliveries,
    'performance.onTimeDeliveries': newOnTimeDeliveries,
    'performance.averageDeliveryTime': newAverageDeliveryTime,
    'performance.rating': newRating,
    'performance.totalEarnings': delivery.performance.totalEarnings + deliveryOrder.paymentInfo.totalPayment,
    'performance.lastActiveDate': new Date()
  });
}
