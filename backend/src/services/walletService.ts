import StoreWallet from '../models/StoreWallet';
import WalletTransaction from '../models/WalletTransaction';
import WalletSettings from '../models/WalletSettings';
import WalletNotification from '../models/WalletNotification';
import Store from '../models/Store';
import { notificationService } from './notificationService';

class WalletService {
  // Crear Wallet para una tienda
  async createWallet(storeId: string): Promise<any> {
    try {
      // Verificar si ya existe
      const existingWallet = await StoreWallet.findOne({ storeId });
      if (existingWallet) {
        return existingWallet;
      }

      // Crear nueva Wallet
      const wallet = new StoreWallet({
        storeId,
        balance: 0,
        currency: 'USD',
        isActive: true,
        cashPaymentEnabled: true,
        minimumBalance: 0
      });

      await wallet.save();

      // Actualizar referencia en la tienda
      await Store.findByIdAndUpdate(storeId, {
        wallet: wallet._id,
        cashPaymentEnabled: true
      });

      // Crear configuraciones por defecto
      await this.createDefaultSettings(storeId);

      // Enviar notificación
      await notificationService.sendWalletNotification(
        storeId,
        'wallet_created',
        {
          balance: 0
        }
      );

      return wallet;
    } catch (error) {
      console.error('Error creando Wallet:', error);
      throw error;
    }
  }

  // Crear configuraciones por defecto
  async createDefaultSettings(storeId: string): Promise<any> {
    try {
      const settings = new WalletSettings({
        storeId,
        commissionRate: 5.0,
        minimumRechargeAmount: 10.0,
        maximumRechargeAmount: 10000.0,
        lowBalanceThreshold: 50.0,
        criticalBalanceThreshold: 0.0,
        autoRechargeEnabled: false,
        autoRechargeAmount: 100.0,
        autoRechargeThreshold: 20.0,
        notificationsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      });

      await settings.save();
      return settings;
    } catch (error) {
      console.error('Error creando configuraciones por defecto:', error);
      throw error;
    }
  }

  // Recargar Wallet
  async rechargeWallet(
    storeId: string,
    amount: number,
    processedBy: string,
    metadata: any = {}
  ): Promise<{ success: boolean; message?: string; transaction?: any; newBalance?: number }> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        return { success: false, message: 'Wallet no encontrada' };
      }

      if (!wallet.isActive) {
        return { success: false, message: 'Wallet desactivada' };
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // Crear transacción
      const transaction = new WalletTransaction({
        walletId: wallet._id,
        storeId,
        type: 'recharge',
        amount,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        status: 'confirmed',
        description: metadata.description || `Recarga de $${amount} USD`,
        reference: metadata.reference,
        metadata: {
          paymentMethod: metadata.paymentMethod,
          paymentProvider: metadata.paymentProvider,
          transactionId: metadata.transactionId
        },
        processedBy,
        processedAt: new Date()
      });

      await transaction.save();

      // Actualizar saldo
      wallet.balance = balanceAfter;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      return {
        success: true,
        transaction,
        newBalance: balanceAfter
      };
    } catch (error) {
      console.error('Error recargando Wallet:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Descontar comisión
  async deductCommission(
    storeId: string,
    amount: number,
    orderId: string,
    orderNumber: string,
    commissionRate: number
  ): Promise<{ success: boolean; message?: string; transaction?: any; newBalance?: number }> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        return { success: false, message: 'Wallet no encontrada' };
      }

      if (!wallet.isActive) {
        return { success: false, message: 'Wallet desactivada' };
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      // Verificar si hay saldo suficiente
      if (balanceAfter < 0) {
        // Bloquear pagos en efectivo
        wallet.cashPaymentEnabled = false;
        await wallet.save();

        // Actualizar también en la tienda
        await Store.findByIdAndUpdate(storeId, {
          cashPaymentEnabled: false
        });

        // Enviar notificación de saldo insuficiente
        await notificationService.sendWalletNotification(
          storeId,
          'insufficient_balance',
          {
            balance: balanceAfter,
            amount,
            orderNumber
          }
        );

        return { success: false, message: 'Saldo insuficiente. Pagos en efectivo bloqueados.' };
      }

      // Crear transacción
      const transaction = new WalletTransaction({
        walletId: wallet._id,
        storeId,
        orderId,
        type: 'commission_deduction',
        amount: -amount, // Negativo para descuento
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        status: 'confirmed',
        description: `Comisión de venta - Orden ${orderNumber}`,
        metadata: {
          commissionRate,
          orderNumber
        },
        processedAt: new Date()
      });

      await transaction.save();

      // Actualizar saldo
      wallet.balance = balanceAfter;
      wallet.lastTransactionAt = new Date();

      // Verificar si el saldo está por debajo del umbral crítico
      const settings = await WalletSettings.findOne({ storeId });
      if (settings && balanceAfter <= settings.criticalBalanceThreshold) {
        wallet.cashPaymentEnabled = false;
        await Store.findByIdAndUpdate(storeId, {
          cashPaymentEnabled: false
        });

        // Enviar notificación
        await notificationService.sendWalletNotification(
          storeId,
          'cash_payment_blocked',
          {
            balance: balanceAfter,
            threshold: settings.criticalBalanceThreshold
          }
        );
      }

      await wallet.save();

      return {
        success: true,
        transaction,
        newBalance: balanceAfter
      };
    } catch (error) {
      console.error('Error descontando comisión:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Verificar si se puede procesar pago en efectivo
  async canProcessCashPayment(storeId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) return false;

      return wallet.canProcessCashPayment() && wallet.hasSufficientBalance(amount);
    } catch (error) {
      console.error('Error verificando pago en efectivo:', error);
      return false;
    }
  }

  // Obtener saldo actual
  async getBalance(storeId: string): Promise<number> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      return wallet ? wallet.balance : 0;
    } catch (error) {
      console.error('Error obteniendo saldo:', error);
      return 0;
    }
  }

  // Ajuste manual de saldo
  async manualAdjustment(
    storeId: string,
    amount: number,
    description: string,
    processedBy: string,
    metadata: any = {}
  ): Promise<{ success: boolean; message?: string; transaction?: any; newBalance?: number }> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        return { success: false, message: 'Wallet no encontrada' };
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // Crear transacción
      const transaction = new WalletTransaction({
        walletId: wallet._id,
        storeId,
        type: 'manual_adjustment',
        amount,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        status: 'confirmed',
        description,
        metadata,
        processedBy,
        processedAt: new Date()
      });

      await transaction.save();

      // Actualizar saldo
      wallet.balance = balanceAfter;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      return {
        success: true,
        transaction,
        newBalance: balanceAfter
      };
    } catch (error) {
      console.error('Error en ajuste manual:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Revertir transacción
  async reverseTransaction(
    transactionId: string,
    reason: string,
    processedBy: string
  ): Promise<{ success: boolean; message?: string; transaction?: any }> {
    try {
      const originalTransaction = await WalletTransaction.findById(transactionId);
      if (!originalTransaction) {
        return { success: false, message: 'Transacción no encontrada' };
      }

      if (originalTransaction.status !== 'completed') {
        return { success: false, message: 'Solo se pueden revertir transacciones completadas' };
      }

      const wallet = await StoreWallet.findOne({ storeId: originalTransaction.storeId });
      if (!wallet) {
        return { success: false, message: 'Wallet no encontrada' };
      }

      // Crear transacción de reversión
      const reverseAmount = -originalTransaction.amount;
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + reverseAmount;

      const reverseTransaction = new WalletTransaction({
        walletId: wallet._id,
        storeId: originalTransaction.storeId,
        orderId: (originalTransaction as any).orderId,
        type: 'manual_adjustment',
        amount: reverseAmount,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        status: 'confirmed',
        description: `Reversión: ${originalTransaction.description} - ${reason}`,
        metadata: {
          originalTransactionId: transactionId,
          reason
        },
        processedBy,
        processedAt: new Date()
      });

      await reverseTransaction.save();

      // Actualizar saldo
      wallet.balance = balanceAfter;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      // Marcar transacción original como revertida (usar 'cancelled' en lugar de 'reversed')
      originalTransaction.status = 'cancelled';
      await originalTransaction.save();

      return {
        success: true,
        transaction: reverseTransaction
      };
    } catch (error) {
      console.error('Error revirtiendo transacción:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  // Obtener estadísticas de Wallet
  async getWalletStats(storeId: string, period: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const stats = await WalletTransaction.aggregate([
        {
          $match: {
            storeId: storeId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalRecharges: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'recharge'] },
                  '$amount',
                  0
                ]
              }
            },
            totalCommissions: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'commission_deduction'] },
                  { $abs: '$amount' },
                  0
                ]
              }
            },
            totalRefunds: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'refund'] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        totalTransactions: 0,
        totalRecharges: 0,
        totalCommissions: 0,
        totalRefunds: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalTransactions: 0,
        totalRecharges: 0,
        totalCommissions: 0,
        totalRefunds: 0
      };
    }
  }
}

export const walletService = new WalletService();
