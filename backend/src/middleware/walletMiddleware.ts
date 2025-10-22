import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/walletService';
import StoreWallet from '../models/StoreWallet';
import WalletSettings from '../models/WalletSettings';
import Store from '../models/Store';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware para verificar saldo antes de procesar pago en efectivo
export const checkWalletBalance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeId, paymentMethod, totalAmount } = req.body;

    // Solo verificar para pagos en efectivo o divisas
    if (paymentMethod === 'cash' || paymentMethod === 'foreign_currency') {
      const canProcess = await walletService.canProcessCashPayment(storeId, totalAmount);
      
      if (!canProcess) {
        const wallet = await StoreWallet.findOne({ storeId });
        const store = await Store.findById(storeId);
        
        res.status(400).json({
          success: false,
          message: '⚠️ Tu saldo en Wallet es insuficiente. Recarga para habilitar nuevamente el cobro en efectivo.',
          data: {
            balance: wallet?.balance || 0,
            required: totalAmount,
            cashPaymentEnabled: wallet?.cashPaymentEnabled || false,
            storeEmail: store?.email
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Error verificando saldo de Wallet:', error);
    next();
  }
};

// Middleware para procesar comisión después de pago confirmado
export const processWalletCommission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, storeId, paymentMethod, commissionAmount, orderNumber } = req.body;

    // Solo procesar para pagos en efectivo o divisas
    if (paymentMethod === 'cash' || paymentMethod === 'foreign_currency') {
      if (commissionAmount && commissionAmount > 0) {
        // Obtener tasa de comisión
        const settings = await WalletSettings.findOne({ storeId });
        const commissionRate = settings?.commissionRate || 5.0;

        // Descontar comisión de la Wallet
        const result = await walletService.deductCommission(
          storeId,
          commissionAmount,
          orderId,
          orderNumber,
          commissionRate
        );

        if (!result.success) {
          // Si no se puede descontar la comisión, la orden no se puede completar
          res.status(400).json({
            success: false,
            message: result.message,
            data: {
              walletBalance: await walletService.getBalance(storeId),
              requiredCommission: commissionAmount
            }
          });
          return;
        }

        // Agregar información de la transacción a la respuesta
        req.body.walletTransaction = result.transaction;
      }
    }

    next();
  } catch (error) {
    console.error('Error procesando comisión de Wallet:', error);
    next();
  }
};

// Middleware para verificar si la tienda puede recibir pagos en efectivo
export const checkCashPaymentEnabled = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { storeId, paymentMethod } = req.body;

    if (paymentMethod === 'cash' || paymentMethod === 'foreign_currency') {
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      if (!store.cashPaymentEnabled) {
        res.status(400).json({
          success: false,
          message: '⚠️ Los pagos en efectivo están deshabilitados para esta tienda. Recarga tu Wallet para habilitarlos.',
          data: {
            cashPaymentEnabled: false,
            storeEmail: store.email
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Error verificando pagos en efectivo:', error);
    next();
  }
};

// Middleware para actualizar estado de pagos en efectivo basado en saldo
export const updateCashPaymentStatus = async (
  storeId: string,
  newBalance: number
): Promise<void> => {
  try {
    const settings = await WalletSettings.findOne({ storeId });
    const criticalThreshold = settings?.criticalBalanceThreshold || 0;

    if (newBalance <= criticalThreshold) {
      // Bloquear pagos en efectivo
      await StoreWallet.findOneAndUpdate(
        { storeId },
        { cashPaymentEnabled: false }
      );

      await Store.findByIdAndUpdate(storeId, {
        cashPaymentEnabled: false
      });
    } else {
      // Habilitar pagos en efectivo si el saldo es suficiente
      await StoreWallet.findOneAndUpdate(
        { storeId },
        { cashPaymentEnabled: true }
      );

      await Store.findByIdAndUpdate(storeId, {
        cashPaymentEnabled: true
      });
    }
  } catch (error) {
    console.error('Error actualizando estado de pagos en efectivo:', error);
  }
};
