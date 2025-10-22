import { Request, Response } from 'express';
import StoreWallet from '../models/StoreWallet';
import WalletTransaction from '../models/WalletTransaction';
import WalletSettings from '../models/WalletSettings';
import WalletNotification from '../models/WalletNotification';
import Store from '../models/Store';
import User from '../models/User';
import { walletService } from '../services/walletService';
import { notificationService } from '../services/notificationService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

class WalletController {
  // Obtener información de la Wallet de una tienda
  async getWalletInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      // Verificar si el usuario tiene acceso a esta tienda
      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta Wallet'
        });
        return;
      }

      // Obtener o crear Wallet
      let wallet = await StoreWallet.findOne({ storeId });
      if (!wallet && storeId) {
        wallet = await walletService.createWallet(storeId);
      }

      // Obtener configuraciones
      const settings = await WalletSettings.findOne({ storeId }) || 
                      (storeId ? await walletService.createDefaultSettings(storeId) : null);

      // Obtener transacciones recientes
      const recentTransactions = await WalletTransaction.find({ storeId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('processedBy', 'name email');

      // Obtener notificaciones pendientes
      const pendingNotifications = await WalletNotification.find({
        storeId,
        status: 'pending'
      }).sort({ createdAt: -1 }).limit(5);

      res.json({
        success: true,
        data: {
          wallet: wallet ? {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
            isActive: wallet.isActive,
            cashPaymentEnabled: wallet.cashPaymentEnabled,
            lastTransactionAt: wallet.lastTransactionAt
          } : null,
          settings,
          recentTransactions,
          pendingNotifications,
          store: {
            id: store._id,
            name: store.name,
            email: store.email
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo información de Wallet:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener historial de transacciones
  async getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta Wallet'
        });
        return;
      }

      // Construir filtros
      const filter: any = { storeId };
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const transactions = await WalletTransaction.find(filter)
        .populate('processedBy', 'name email')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip);

      const total = await WalletTransaction.countDocuments(filter);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo historial de transacciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Recargar Wallet
  async rechargeWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { amount, paymentMethod, reference, description } = req.body;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Validaciones
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
        return;
      }

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para recargar esta Wallet'
        });
        return;
      }

      // Obtener configuraciones
      const settings = await WalletSettings.findOne({ storeId });
      if (!settings) {
        res.status(400).json({
          success: false,
          message: 'Configuraciones de Wallet no encontradas'
        });
        return;
      }

      // Validar montos
      if (amount < settings.minimumRechargeAmount) {
        res.status(400).json({
          success: false,
          message: `El monto mínimo de recarga es $${settings.minimumRechargeAmount}`
        });
        return;
      }

      if (amount > settings.maximumRechargeAmount) {
        res.status(400).json({
          success: false,
          message: `El monto máximo de recarga es $${settings.maximumRechargeAmount}`
        });
        return;
      }

      // Procesar recarga
      const result = await walletService.rechargeWallet(
        storeId!,
        amount,
        userId,
        {
          paymentMethod,
          reference,
          description: description || `Recarga de $${amount} USD`
        }
      );

      if (result.success) {
        // Enviar notificación
        await notificationService.sendWalletNotification(
          storeId!,
          'recharge_successful',
          {
            amount,
            balance: result.newBalance,
            paymentMethod
          }
        );

        res.json({
          success: true,
          message: 'Wallet recargada exitosamente',
          data: {
            transaction: result.transaction,
            newBalance: result.newBalance
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error recargando Wallet:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar saldo para pago en efectivo
  async checkCashPaymentBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
        return;
      }

      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
        return;
      }

      const canProcess = wallet.canProcessCashPayment() && wallet.hasSufficientBalance(amount);
      const balanceStatus = wallet.getBalanceStatus();

      res.json({
        success: true,
        data: {
          canProcess,
          balance: wallet.balance,
          balanceStatus,
          cashPaymentEnabled: wallet.cashPaymentEnabled,
          isActive: wallet.isActive
        }
      });
    } catch (error) {
      console.error('Error verificando saldo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Bloquear/Desbloquear pagos en efectivo
  async toggleCashPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { enabled } = req.body;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta configuración'
        });
        return;
      }

      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
        return;
      }

      // Actualizar estado
      wallet.cashPaymentEnabled = enabled;
      await wallet.save();

      // Actualizar también en la tienda
      store.cashPaymentEnabled = enabled;
      await store.save();

      // Enviar notificación
      const notificationType = enabled ? 'cash_payment_enabled' : 'cash_payment_blocked';
      await notificationService.sendWalletNotification(
        storeId!,
        notificationType,
        {
          balance: wallet.balance,
          enabled
        }
      );

      res.json({
        success: true,
        message: `Pagos en efectivo ${enabled ? 'habilitados' : 'bloqueados'} exitosamente`,
        data: {
          cashPaymentEnabled: enabled,
          balance: wallet.balance
        }
      });
    } catch (error) {
      console.error('Error modificando pagos en efectivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener configuraciones de Wallet
  async getWalletSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a estas configuraciones'
        });
        return;
      }

      const settings = await WalletSettings.findOne({ storeId });
      if (!settings) {
        // Crear configuraciones por defecto
        const defaultSettings = await walletService.createDefaultSettings(storeId!);
        res.json({
          success: true,
          data: defaultSettings
        });
        return;
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuraciones de Wallet
  async updateWalletSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const updateData = req.body;
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar estas configuraciones'
        });
        return;
      }

      const settings = await WalletSettings.findOneAndUpdate(
        { storeId },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      // Enviar notificación
      await notificationService.sendWalletNotification(
        storeId!,
        'settings_updated',
        {
          updatedBy: userId,
          changes: Object.keys(updateData)
        }
      );

      res.json({
        success: true,
        message: 'Configuraciones actualizadas exitosamente',
        data: settings
      });
    } catch (error) {
      console.error('Error actualizando configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de Wallet
  async getWalletStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { period = '30' } = req.query; // días
      const userId = (req as any).user._id;
      const userRole = (req as any).user.role;

      // Verificar permisos
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      const hasAccess = userRole === 'admin' || 
                       store.owner.toString() === userId.toString() || 
                       store.managers.includes(userId);

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a estas estadísticas'
        });
        return;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      // Estadísticas de transacciones
      const transactionStats = await WalletTransaction.aggregate([
        {
          $match: {
            storeId: store._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Estadísticas por día
      const dailyStats = await WalletTransaction.aggregate([
        {
          $match: {
            storeId: store._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          period: Number(period),
          transactionStats,
          dailyStats,
          startDate,
          endDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

const walletController = new WalletController();
export default walletController;
