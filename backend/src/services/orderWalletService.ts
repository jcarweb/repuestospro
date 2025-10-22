import { walletService } from './walletService';
import { notificationService } from './notificationService';
import StoreWallet from '../models/StoreWallet';
import WalletSettings from '../models/WalletSettings';
import Store from '../models/Store';

class OrderWalletService {
  // Procesar pago y comisión cuando una orden se marca como pagada
  async processOrderPayment(
    orderId: string,
    storeId: string,
    orderNumber: string,
    paymentMethod: string,
    totalAmount: number,
    commissionAmount: number
  ): Promise<{ success: boolean; message?: string; walletTransaction?: any }> {
    try {
      // Solo procesar para pagos en efectivo o divisas
      if (paymentMethod !== 'cash' && paymentMethod !== 'foreign_currency') {
        return { success: true, message: 'Pago procesado sin Wallet' };
      }

      // Verificar si la tienda tiene Wallet
      let wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        // Crear Wallet si no existe
        wallet = await walletService.createWallet(storeId);
      }

      // Verificar si se puede procesar el pago
      const canProcess = await walletService.canProcessCashPayment(storeId, commissionAmount);
      if (!canProcess) {
        return {
          success: false,
          message: 'Saldo insuficiente en Wallet. Los pagos en efectivo han sido bloqueados.'
        };
      }

      // Descontar comisión
      const result = await walletService.deductCommission(
        storeId,
        commissionAmount,
        orderId,
        orderNumber,
        5.0 // Tasa de comisión por defecto
      );

      if (result.success) {
        // Enviar notificación de comisión descontada
        await notificationService.sendWalletNotification(
          storeId,
          'commission_deducted',
          {
            amount: commissionAmount,
            orderNumber,
            balance: result.newBalance
          }
        );

        return {
          success: true,
          message: 'Comisión descontada exitosamente',
          walletTransaction: result.transaction
        };
      } else {
        return {
          success: false,
          message: result.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('Error procesando pago de orden:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Verificar si se puede procesar pago en efectivo antes de crear la orden
  async canProcessCashPayment(
    storeId: string,
    totalAmount: number
  ): Promise<{ canProcess: boolean; reason?: string; balance?: number }> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) {
        return {
          canProcess: false,
          reason: 'Wallet no encontrada'
        };
      }

      if (!wallet.isActive) {
        return {
          canProcess: false,
          reason: 'Wallet desactivada'
        };
      }

      if (!wallet.cashPaymentEnabled) {
        return {
          canProcess: false,
          reason: 'Pagos en efectivo deshabilitados',
          balance: wallet.balance
        };
      }

      // Obtener configuraciones para calcular comisión
      const settings = await WalletSettings.findOne({ storeId });
      const commissionRate = settings?.commissionRate || 5.0;
      const commissionAmount = (totalAmount * commissionRate) / 100;

      if (wallet.balance < commissionAmount) {
        return {
          canProcess: false,
          reason: 'Saldo insuficiente para cubrir la comisión',
          balance: wallet.balance
        };
      }

      return {
        canProcess: true,
        balance: wallet.balance
      };
    } catch (error) {
      console.error('Error verificando pago en efectivo:', error);
      return {
        canProcess: false,
        reason: 'Error interno del servidor'
      };
    }
  }

  // Bloquear pagos en efectivo cuando el saldo es insuficiente
  async blockCashPayments(storeId: string, reason: string): Promise<void> {
    try {
      // Actualizar Wallet
      await StoreWallet.findOneAndUpdate(
        { storeId },
        { cashPaymentEnabled: false }
      );

      // Actualizar tienda
      await Store.findByIdAndUpdate(storeId, {
        cashPaymentEnabled: false
      });

      // Enviar notificación
      await notificationService.sendWalletNotification(
        storeId,
        'cash_payment_blocked',
        {
          reason,
          balance: await walletService.getBalance(storeId)
        }
      );
    } catch (error) {
      console.error('Error bloqueando pagos en efectivo:', error);
    }
  }

  // Habilitar pagos en efectivo cuando se recarga saldo
  async enableCashPayments(storeId: string): Promise<void> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      if (!wallet) return;

      // Solo habilitar si el saldo es suficiente
      if (wallet.balance > 0) {
        // Actualizar Wallet
        await StoreWallet.findOneAndUpdate(
          { storeId },
          { cashPaymentEnabled: true }
        );

        // Actualizar tienda
        await Store.findByIdAndUpdate(storeId, {
          cashPaymentEnabled: true
        });

        // Enviar notificación
        await notificationService.sendWalletNotification(
          storeId,
          'cash_payment_enabled',
          {
            balance: wallet.balance
          }
        );
      }
    } catch (error) {
      console.error('Error habilitando pagos en efectivo:', error);
    }
  }

  // Obtener información de Wallet para mostrar en el checkout
  async getWalletInfoForCheckout(storeId: string): Promise<any> {
    try {
      const wallet = await StoreWallet.findOne({ storeId });
      const store = await Store.findById(storeId);

      if (!wallet || !store) {
        return null;
      }

      return {
        balance: wallet.balance,
        currency: wallet.currency,
        cashPaymentEnabled: wallet.cashPaymentEnabled && store.cashPaymentEnabled,
        isActive: wallet.isActive,
        balanceStatus: wallet.getBalanceStatus()
      };
    } catch (error) {
      console.error('Error obteniendo información de Wallet para checkout:', error);
      return null;
    }
  }

  // Calcular comisión para una orden
  async calculateCommission(storeId: string, totalAmount: number): Promise<number> {
    try {
      const settings = await WalletSettings.findOne({ storeId });
      const commissionRate = settings?.commissionRate || 5.0;
      return (totalAmount * commissionRate) / 100;
    } catch (error) {
      console.error('Error calculando comisión:', error);
      return (totalAmount * 5.0) / 100; // 5% por defecto
    }
  }

  // Procesar reembolso y devolver comisión a la Wallet
  async processRefund(
    orderId: string,
    storeId: string,
    orderNumber: string,
    refundAmount: number,
    commissionAmount: number
  ): Promise<{ success: boolean; message?: string; walletTransaction?: any }> {
    try {
      // Devolver comisión a la Wallet
      const result = await walletService.manualAdjustment(
        storeId,
        commissionAmount,
        `Reembolso de comisión - Orden ${orderNumber}`,
        'system',
        {
          orderId,
          orderNumber,
          refundAmount,
          type: 'refund'
        }
      );

      if (result.success) {
        // Enviar notificación
        await notificationService.sendWalletNotification(
          storeId,
          'commission_deducted',
          {
            amount: commissionAmount,
            orderNumber,
            balance: result.newBalance,
            type: 'refund'
          }
        );

        return {
          success: true,
          message: 'Comisión devuelta a la Wallet',
          walletTransaction: result.transaction
        };
      } else {
        return {
          success: false,
          message: result.message || 'Error desconocido'
        };
      }
    } catch (error) {
      console.error('Error procesando reembolso:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}

export const orderWalletService = new OrderWalletService();
