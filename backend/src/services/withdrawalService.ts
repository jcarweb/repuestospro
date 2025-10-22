import DeliveryWallet from '../models/DeliveryWallet';
import DeliveryTransaction from '../models/DeliveryTransaction';
import DeliveryLog from '../models/DeliveryLog';

interface WithdrawalRequest {
  deliveryId: string;
  amount: number;
  paymentMethod: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  digitalWallet?: {
    walletType: string;
    walletAddress: string;
  };
}

export async function processWithdrawal(
  transactionId: string,
  amount: number,
  paymentMethod: string,
  bankAccount?: any
): Promise<void> {
  try {
    // Simular procesamiento de retiro
    // En producción, aquí se integraría con servicios de pago reales
    
    const transaction = await DeliveryTransaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Simular procesamiento exitoso
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar estado de la transacción
    await DeliveryTransaction.findByIdAndUpdate(transactionId, {
      status: 'completed',
      processedAt: new Date()
    });

    // Actualizar wallet
    await DeliveryWallet.findOneAndUpdate(
      { deliveryId: transaction.deliveryId },
      {
        $inc: {
          totalWithdrawn: amount,
          pendingWithdrawal: -amount
        }
      }
    );

    // Log de la transacción
    await DeliveryLog.create({
      deliveryId: transaction.deliveryId,
      action: 'withdrawal_completed',
      description: `Retiro completado: $${amount}`,
      level: 'info',
      category: 'payment',
      metadata: {
        amount,
        paymentMethod,
        transactionId
      }
    });

    console.log(`Retiro procesado exitosamente: $${amount} para delivery ${transaction.deliveryId}`);

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    
    // Marcar transacción como fallida
    await DeliveryTransaction.findByIdAndUpdate(transactionId, {
      status: 'failed',
      failureReason: error instanceof Error ? error.message : 'Error desconocido'
    });

    // Revertir cambios en la wallet
    const transaction = await DeliveryTransaction.findById(transactionId);
    if (transaction) {
      await DeliveryWallet.findOneAndUpdate(
        { deliveryId: transaction.deliveryId },
        {
          $inc: {
            currentBalance: amount,
            pendingWithdrawal: -amount
          }
        }
      );
    }

    throw error;
  }
}

export async function validateWithdrawalRequest(
  deliveryId: string,
  amount: number
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const wallet = await DeliveryWallet.findOne({ deliveryId });
    if (!wallet) {
      return { valid: false, reason: 'Wallet no encontrada' };
    }

    if (!wallet.isActive) {
      return { valid: false, reason: 'Wallet inactiva' };
    }

    if (amount > wallet.currentBalance) {
      return { valid: false, reason: 'Fondos insuficientes' };
    }

    if (amount < 20) {
      return { valid: false, reason: 'Monto mínimo de retiro es $20' };
    }

    if (amount > 500) {
      return { valid: false, reason: 'Monto máximo de retiro es $500' };
    }

    return { valid: true };

  } catch (error) {
    console.error('Error validating withdrawal request:', error);
    return { valid: false, reason: 'Error interno' };
  }
}

export async function getWithdrawalHistory(
  deliveryId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ transactions: any[]; total: number }> {
  try {
    const transactions = await DeliveryTransaction
      .find({
        deliveryId,
        type: 'withdrawal'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeliveryTransaction.countDocuments({
      deliveryId,
      type: 'withdrawal'
    });

    return { transactions, total };

  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    throw error;
  }
}
