import { Request, Response } from 'express';
import Delivery from '../models/Delivery';
import DeliveryWallet from '../models/DeliveryWallet';
import DeliveryTransaction from '../models/DeliveryTransaction';
import DeliverySettings from '../models/DeliverySettings';
import DeliveryOrder from '../models/DeliveryOrder';
import DeliveryLog from '../models/DeliveryLog';

// Obtener todos los deliverys con paginación
export const getAllDeliverys = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      zone, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (status) query.status = status;
    if (zone) query['workInfo.zones'] = zone;
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'personalInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const deliverys = await Delivery
      .find(query)
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-documents.idFront -documents.idBack -documents.driverLicense -documents.vehicleRegistration -documents.insuranceDocument -documents.backgroundCheck');

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      data: {
        deliverys,
        pagination: {
          current: page,
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting all deliverys:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas generales
export const getDeliveryStats = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    const stats = await Delivery.aggregate([
      {
        $group: {
          _id: null,
          totalDeliverys: { $sum: 1 },
          activeDeliverys: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          approvedDeliverys: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingDeliverys: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          suspendedDeliverys: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
          },
          averageRating: { $avg: '$performance.rating' },
          totalDeliveries: { $sum: '$performance.totalDeliveries' },
          totalEarnings: { $sum: '$performance.totalEarnings' }
        }
      }
    ]);

    // Estadísticas de transacciones
    const transactionStats = await DeliveryTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalPayments: {
            $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] }
          },
          totalWithdrawals: {
            $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] }
          },
          totalBonuses: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$amount', 0] }, { $eq: ['$type', 'bonus'] }] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Estadísticas de pedidos
    const orderStats = await DeliveryOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalOrderValue: { $sum: '$orderDetails.totalValue' },
          totalDeliveryFees: { $sum: '$paymentInfo.deliveryFee' },
          totalBonuses: { $sum: '$paymentInfo.bonusAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        deliveryStats: stats[0] || {},
        transactionStats: transactionStats[0] || {},
        orderStats: orderStats[0] || {},
        period: parseInt(period as string)
      }
    });

  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener configuración de deliverys
export const getDeliverySettings = async (req: Request, res: Response) => {
  try {
    let settings = await DeliverySettings.findOne({ 'system.isActive': true });

    if (!settings) {
      // Crear configuración por defecto si no existe
      settings = new DeliverySettings({});
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error getting delivery settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar configuración de deliverys
export const updateDeliverySettings = async (req: Request, res: Response) => {
  try {
    const updateData = req.body;

    let settings = await DeliverySettings.findOne({ 'system.isActive': true });

    if (!settings) {
      settings = new DeliverySettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }

    await settings.save();

    await DeliveryLog.create({
      action: 'delivery_settings_updated',
      description: 'Configuración de deliverys actualizada',
      level: 'info',
      category: 'system',
      metadata: {
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: settings
    });

  } catch (error) {
    console.error('Error updating delivery settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener reportes de rentabilidad
export const getProfitabilityReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, zone } = req.query;

    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    if (zone) {
      matchQuery['metadata.zone'] = zone;
    }

    const report = await DeliveryOrder.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrderValue: { $sum: '$orderDetails.totalValue' },
          totalDeliveryFees: { $sum: '$paymentInfo.deliveryFee' },
          totalBonuses: { $sum: '$paymentInfo.bonusAmount' },
          totalCommissionDeduction: { $sum: '$paymentInfo.commissionDeduction' },
          averageOrderValue: { $avg: '$orderDetails.totalValue' },
          averageDeliveryFee: { $avg: '$paymentInfo.deliveryFee' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = report[0] || {};
    
    // Calcular métricas de rentabilidad
    const totalCost = (result.totalDeliveryFees || 0) + (result.totalBonuses || 0);
    const totalRevenue = result.totalCommissionDeduction || 0;
    const netProfit = totalRevenue - totalCost;
    const profitMargin = result.totalOrderValue > 0 ? (netProfit / result.totalOrderValue) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...result,
        totalCost,
        totalRevenue,
        netProfit,
        profitMargin,
        costPerOrder: result.totalOrders > 0 ? totalCost / result.totalOrders : 0,
        revenuePerOrder: result.totalOrders > 0 ? totalRevenue / result.totalOrders : 0
      }
    });

  } catch (error) {
    console.error('Error getting profitability report:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener logs del sistema
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      level, 
      category, 
      deliveryId,
      startDate,
      endDate
    } = req.query;

    const query: any = {};
    
    if (level) query.level = level;
    if (category) query.category = category;
    if (deliveryId) query.deliveryId = deliveryId;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const logs = await DeliveryLog
      .find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await DeliveryLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Suspender/Activar delivery
export const toggleDeliveryStatus = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { status, reason } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { 
        status,
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

    // Si se suspende, marcar como no disponible
    if (status === 'suspended') {
      await Delivery.findByIdAndUpdate(deliveryId, {
        'workInfo.availabilityStatus': 'offline',
        isActive: false
      });
    } else if (status === 'approved') {
      await Delivery.findByIdAndUpdate(deliveryId, {
        isActive: true
      });
    }

    await DeliveryLog.create({
      deliveryId,
      action: 'delivery_status_changed',
      description: `Estado del delivery cambiado a: ${status}`,
      level: 'info',
      category: 'system',
      metadata: {
        status,
        reason
      }
    });

    return res.json({
      success: true,
      message: `Delivery ${status === 'suspended' ? 'suspendido' : 'activado'} exitosamente`,
      data: delivery
    });

  } catch (error) {
    console.error('Error toggling delivery status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
