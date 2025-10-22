import { Request, Response } from 'express';
import StoreWallet from '../models/StoreWallet';
import WalletTransaction from '../models/WalletTransaction';
import WalletSettings from '../models/WalletSettings';
import Store from '../models/Store';
import User from '../models/User';
import { walletService } from '../services/walletService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

class AdminWalletController {
  // Obtener todas las Wallets (solo admin)
  async getAllWallets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const filter: any = {};

      // Filtros
      if (search) {
        const stores = await Store.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        const storeIds = stores.map(store => store._id);
        filter.storeId = { $in: storeIds };
      }

      if (status) {
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;
        if (status === 'low_balance') filter.balance = { $lte: 50 };
        if (status === 'insufficient') filter.balance = { $lte: 0 };
      }

      const skip = (Number(page) - 1) * Number(limit);
      const wallets = await StoreWallet.find(filter)
        .populate('storeId', 'name email phone city')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip);

      const total = await StoreWallet.countDocuments(filter);

      res.json({
        success: true,
        data: {
          wallets,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo Wallets:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener Wallet específica (solo admin)
  async getWalletById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      const wallet = await StoreWallet.findById(walletId)
        .populate('storeId', 'name email phone city address');

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
        return;
      }

      // Obtener transacciones recientes
      const recentTransactions = await WalletTransaction.find({ walletId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('processedBy', 'name email');

      // Obtener configuraciones
      const settings = await WalletSettings.findOne({ storeId: wallet.storeId });

      res.json({
        success: true,
        data: {
          wallet,
          recentTransactions,
          settings
        }
      });
    } catch (error) {
      console.error('Error obteniendo Wallet:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Ajuste manual de saldo (solo admin)
  async manualAdjustment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { amount, description, reason } = req.body;
      const userId = (req as any).user._id;

      if (!amount || amount === 0) {
        res.status(400).json({
          success: false,
          message: 'El monto debe ser diferente de 0'
        });
        return;
      }

      const wallet = await StoreWallet.findById(walletId);
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
        return;
      }

      const result = await walletService.manualAdjustment(
        wallet.storeId.toString(),
        amount,
        description || `Ajuste manual: ${reason || 'Sin razón especificada'}`,
        userId,
        {
          reason,
          adminAdjustment: true
        }
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Ajuste realizado exitosamente',
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
      console.error('Error realizando ajuste manual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Revertir transacción (solo admin)
  async reverseTransaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user._id;

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar una razón para la reversión'
        });
        return;
      }

      const result = await walletService.reverseTransaction(
        transactionId!,
        reason,
        userId
      );

      if (result.success) {
        res.json({
          success: true,
          message: 'Transacción revertida exitosamente',
          data: result.transaction
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error revirtiendo transacción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Bloquear/Desbloquear Wallet (solo admin)
  async toggleWalletStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { isActive, reason } = req.body;
      const userId = (req as any).user._id;

      const wallet = await StoreWallet.findById(walletId);
      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
        return;
      }

      wallet.isActive = isActive;
      await wallet.save();

      // Crear transacción de registro
      const transaction = new WalletTransaction({
        walletId: wallet._id,
        storeId: wallet.storeId,
        type: 'system_adjustment',
        amount: 0,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        currency: 'USD',
        status: 'confirmed',
        description: `Wallet ${isActive ? 'activada' : 'desactivada'} por administrador: ${reason || 'Sin razón especificada'}`,
        metadata: {
          adminAction: true,
          reason,
          previousStatus: !isActive
        },
        processedBy: userId,
        processedAt: new Date()
      });

      await transaction.save();

      res.json({
        success: true,
        message: `Wallet ${isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: {
          wallet,
          transaction
        }
      });
    } catch (error) {
      console.error('Error cambiando estado de Wallet:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas globales de Wallets
  async getGlobalStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      // Estadísticas generales
      const totalWallets = await StoreWallet.countDocuments();
      const activeWallets = await StoreWallet.countDocuments({ isActive: true });
      const lowBalanceWallets = await StoreWallet.countDocuments({ balance: { $lte: 50 } });
      const insufficientBalanceWallets = await StoreWallet.countDocuments({ balance: { $lte: 0 } });

      // Estadísticas de transacciones
      const transactionStats = await WalletTransaction.aggregate([
        {
          $match: {
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

      // Wallets con problemas
      const problemWallets = await StoreWallet.find({
        $or: [
          { balance: { $lte: 0 } },
          { cashPaymentEnabled: false },
          { isActive: false }
        ]
      })
        .populate('storeId', 'name email phone')
        .limit(10);

      res.json({
        success: true,
        data: {
          period: Number(period),
          totalWallets,
          activeWallets,
          lowBalanceWallets,
          insufficientBalanceWallets,
          transactionStats,
          dailyStats,
          problemWallets,
          startDate,
          endDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas globales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Exportar datos de Wallet
  async exportWalletData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { walletId, startDate, endDate } = req.query;

      let filter: any = {};
      if (walletId) filter.walletId = walletId;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const transactions = await WalletTransaction.find(filter)
        .populate('storeId', 'name email')
        .populate('processedBy', 'name email')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 });

      // Convertir a CSV
      const csvData = this.convertToCSV(transactions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wallet-transactions.csv');
      res.send(csvData);
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Convertir datos a CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = [
      'Fecha',
      'Tienda',
      'Tipo',
      'Monto',
      'Saldo Anterior',
      'Saldo Posterior',
      'Estado',
      'Descripción',
      'Procesado Por',
      'Orden'
    ];

    const rows = data.map(transaction => [
      transaction.createdAt.toISOString(),
      transaction.storeId?.name || '',
      transaction.type,
      transaction.amount,
      transaction.balanceBefore,
      transaction.balanceAfter,
      transaction.status,
      transaction.description,
      transaction.processedBy?.name || '',
      transaction.orderId?.orderNumber || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

const adminWalletController = new AdminWalletController();
export default adminWalletController;
