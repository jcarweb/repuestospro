import { Request, Response } from 'express';
import DeliveryWallet from '../models/DeliveryWallet';
import DeliveryTransaction from '../models/DeliveryTransaction';
import DeliveryLog from '../models/DeliveryLog';
// import { processWithdrawal } from '../services/withdrawalService';
import { notificationService } from '../services/notificationService';
import DeliverySettings from '../models/DeliverySettings';

// Obtener información de la wallet
export const getWallet = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;

    const wallet = await DeliveryWallet.findOne({ deliveryId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet no encontrada'
      });
    }

    // Obtener transacciones recientes
    const recentTransactions = await DeliveryTransaction
      .find({ deliveryId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      data: {
        wallet: {
          currentBalance: wallet.currentBalance,
          totalEarned: wallet.totalEarned,
          totalWithdrawn: wallet.totalWithdrawn,
          pendingWithdrawal: wallet.pendingWithdrawal,
          isActive: wallet.isActive
        },
        recentTransactions
      }
    });

  } catch (error) {
    console.error('Error getting wallet:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de transacciones
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { page = 1, limit = 20, type, status } = req.query;

    const query: any = { deliveryId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await DeliveryTransaction
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await DeliveryTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Solicitar retiro de fondos
export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { amount, paymentMethod, bankAccount } = req.body;

    const wallet = await DeliveryWallet.findOne({ deliveryId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet no encontrada'
      });
    }

    if (!wallet.isActive) {
      return res.status(400).json({
        success: false,
        message: 'La wallet está inactiva'
      });
    }

    if (amount > wallet.currentBalance) {
      return res.status(400).json({
        success: false,
        message: 'Fondos insuficientes'
      });
    }

    // Verificar monto mínimo (se obtiene de configuración)
    const settings = await DeliverySettings.findOne({ 'system.isActive': true });
    const minimumAmount = settings?.withdrawals.minimumAmount || 20;

    if (amount < minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `El monto mínimo para retiro es $${minimumAmount}`
      });
    }

    // Crear transacción de retiro
    const transaction = new DeliveryTransaction({
      deliveryId,
      walletId: wallet._id,
      type: 'withdrawal',
      amount: -amount, // Negativo porque es un retiro
      description: `Solicitud de retiro de $${amount}`,
      status: 'pending',
      metadata: {
        paymentMethod,
        bankAccount
      }
    });

    await transaction.save();

    // Actualizar wallet
    await DeliveryWallet.findOneAndUpdate(
      { deliveryId },
      {
        $inc: {
          currentBalance: -amount,
          pendingWithdrawal: amount
        }
      }
    );

    // Log de la transacción
    await DeliveryLog.create({
      deliveryId,
      action: 'withdrawal_requested',
      description: `Solicitud de retiro por $${amount}`,
      level: 'info',
      category: 'payment',
      metadata: {
        amount,
        paymentMethod,
        transactionId: transaction._id
      }
    });

    // Procesar retiro (en producción esto sería asíncrono)
    try {
      // await processWithdrawal(transaction._id, amount, paymentMethod, bankAccount);
      // Placeholder: Simular procesamiento exitoso
      console.log('Processing withdrawal:', { transactionId: transaction._id, amount, paymentMethod, bankAccount });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      // El retiro falló, revertir cambios
      await DeliveryWallet.findOneAndUpdate(
        { deliveryId },
        {
          $inc: {
            currentBalance: amount,
            pendingWithdrawal: -amount
          }
        }
      );
      
      await DeliveryTransaction.findByIdAndUpdate(transaction._id, {
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Error desconocido'
      });

      return res.status(500).json({
        success: false,
        message: 'Error procesando el retiro'
      });
    }

    return res.json({
      success: true,
      message: 'Solicitud de retiro procesada exitosamente',
      data: {
        transactionId: transaction._id,
        amount,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de la wallet
export const getWalletStats = async (req: Request, res: Response) => {
  try {
    const { deliveryId } = req.params;
    const { period = '30' } = req.query; // días

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    const stats = await DeliveryTransaction.aggregate([
      {
        $match: {
          deliveryId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
            }
          },
          totalWithdrawals: {
            $sum: {
              $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
            }
          },
          totalBonuses: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$amount', 0] }, { $eq: ['$type', 'bonus'] }] },
                '$amount',
                0
              ]
            }
          },
          totalDeliveries: {
            $sum: {
              $cond: [{ $eq: ['$type', 'delivery_payment'] }, 1, 0]
            }
          },
          averageEarning: {
            $avg: {
              $cond: [{ $gt: ['$amount', 0] }, '$amount', null]
            }
          }
        }
      }
    ]);

    const wallet = await DeliveryWallet.findOne({ deliveryId });

    return res.json({
      success: true,
      data: {
        currentBalance: wallet?.currentBalance || 0,
        totalEarned: wallet?.totalEarned || 0,
        totalWithdrawn: wallet?.totalWithdrawn || 0,
        periodStats: stats[0] || {
          totalEarnings: 0,
          totalWithdrawals: 0,
          totalBonuses: 0,
          totalDeliveries: 0,
          averageEarning: 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
