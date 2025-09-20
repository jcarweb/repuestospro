import { Request, Response } from 'express';
import { TransactionService, TransactionCreationData } from '../services/TransactionService';

export class TransactionController {

  /**
   * Crear una nueva transacción (checkout)
   */
  public createTransaction = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const {
        storeId,
        items,
        shippingAddress,
        paymentMethod,
        warrantyEnabled,
        warrantyLevel,
        notes
      } = req.body;

      // Validar datos requeridos
      if (!storeId || !items || !shippingAddress || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Datos requeridos faltantes'
        });
      }

      const transactionData: TransactionCreationData = {
        userId,
        storeId,
        items,
        shippingAddress,
        paymentMethod,
        warrantyEnabled: warrantyEnabled || false,
        warrantyLevel: warrantyLevel || 'none',
        notes,
        createdBy: userId
      };

      const transaction = await TransactionService.createTransaction(transactionData);

      res.status(201).json({
        success: true,
        message: 'Transacción creada exitosamente',
        data: {
          transaction: {
            id: transaction._id,
            transactionNumber: transaction.transactionNumber,
            status: transaction.status,
            totalAmount: transaction.totalAmount,
            warrantyEnabled: transaction.warrantyEnabled,
            warrantyLevel: transaction.warrantyLevel,
            createdAt: transaction.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Error al crear transacción:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener transacciones del usuario
   */
  public getUserTransactions = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await TransactionService.getUserTransactions(userId, page, limit);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener transacciones del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener transacciones de la tienda (para store managers)
   */
  public getStoreTransactions = async (req: Request, res: Response) => {
    try {
      const storeId = (req as any).user.storeId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!storeId) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado: no tienes una tienda asignada'
        });
      }

      const result = await TransactionService.getStoreTransactions(storeId, page, limit);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener transacciones de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener transacción por ID
   */
  public getTransactionById = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const transaction = await TransactionService.getTransactionById(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
      }

      // Verificar permisos
      if (userRole !== 'admin' && 
          transaction.userId.toString() !== userId && 
          transaction.storeId.toString() !== (req as any).user.storeId) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      res.json({
        success: true,
        data: transaction
      });

    } catch (error) {
      console.error('Error al obtener transacción por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar estado de transacción
   */
  public updateTransactionStatus = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const { status, paymentStatus } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // Validar estado
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de transacción inválido'
        });
      }

      // Obtener transacción para verificar permisos
      const transaction = await TransactionService.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
      }

      // Verificar permisos (solo admin, usuario propietario o store manager de la tienda)
      if (userRole !== 'admin' && 
          transaction.userId.toString() !== userId && 
          transaction.storeId.toString() !== (req as any).user.storeId) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Solo admin y store managers pueden cambiar estado a 'completed'
      if (status === 'completed' && userRole === 'client') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para completar transacciones'
        });
      }

      const updatedTransaction = await TransactionService.updateTransactionStatus(
        transactionId, 
        status, 
        paymentStatus
      );

      res.json({
        success: true,
        message: 'Estado de transacción actualizado exitosamente',
        data: updatedTransaction
      });

    } catch (error) {
      console.error('Error al actualizar estado de transacción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener estadísticas de transacciones
   */
  public getTransactionStats = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const storeId = (req as any).user.storeId;

      let stats;
      if (userRole === 'admin') {
        // Admin ve todas las estadísticas
        stats = await TransactionService.getTransactionStats();
      } else if (userRole === 'store_manager' && storeId) {
        // Store manager ve estadísticas de su tienda
        stats = await TransactionService.getTransactionStats(undefined, storeId);
      } else {
        // Cliente ve sus propias estadísticas
        stats = await TransactionService.getTransactionStats(userId);
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de transacciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Calcular resumen de checkout (preview)
   */
  public calculateCheckoutSummary = async (req: Request, res: Response) => {
    try {
      const {
        items,
        warrantyEnabled,
        warrantyLevel
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren productos para calcular el resumen'
        });
      }

      // Calcular subtotal
      let subtotal = 0;
      for (const item of items) {
        if (item.quantity && item.unitPrice) {
          subtotal += item.quantity * item.unitPrice;
        }
      }

      // Calcular montos
      const taxAmount = subtotal * 0.16; // IVA 16%
      const commissionAmount = subtotal * 0.05; // Comisión 5%
      const warrantyTotal = warrantyEnabled && warrantyLevel && warrantyLevel !== 'none' ? 
        subtotal * (warrantyLevel === 'basic' ? 0.02 : warrantyLevel === 'premium' ? 0.05 : 0.08) : 0;
      const totalAmount = subtotal + taxAmount + commissionAmount + warrantyTotal;

      // Calcular cobertura de garantía
      let warrantyCoverage = 0;
      if (warrantyEnabled && warrantyLevel && warrantyLevel !== 'none') {
        warrantyCoverage = subtotal * (warrantyLevel === 'basic' ? 0.8 : warrantyLevel === 'premium' ? 0.9 : 1);
      }

      res.json({
        success: true,
        data: {
          subtotal,
          taxAmount,
          commissionAmount,
          warrantyTotal,
          totalAmount,
          warrantyCoverage,
          breakdown: {
            subtotal,
            tax: { amount: taxAmount, rate: 16, description: 'IVA' },
            commission: { amount: commissionAmount, rate: 5, description: 'Comisión de plataforma' },
            warranty: { 
              amount: warrantyTotal, 
              level: warrantyLevel || 'none',
              coverage: warrantyCoverage,
              description: warrantyLevel === 'basic' ? 'Protección Básica (2%)' :
                         warrantyLevel === 'premium' ? 'Protección Premium (5%)' :
                         warrantyLevel === 'extended' ? 'Protección Extendida (8%)' : 'Sin protección'
            }
          }
        }
      });

    } catch (error) {
      console.error('Error al calcular resumen de checkout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Cancelar transacción
   */
  public cancelTransaction = async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // Obtener transacción para verificar permisos
      const transaction = await TransactionService.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transacción no encontrada'
        });
      }

      // Verificar permisos
      if (userRole !== 'admin' && 
          transaction.userId.toString() !== userId && 
          transaction.storeId.toString() !== (req as any).user.storeId) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Verificar si se puede cancelar
      if (!transaction.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'La transacción no puede ser cancelada en su estado actual'
        });
      }

      const updatedTransaction = await TransactionService.updateTransactionStatus(
        transactionId, 
        'cancelled'
      );

      res.json({
        success: true,
        message: 'Transacción cancelada exitosamente',
        data: updatedTransaction
      });

    } catch (error) {
      console.error('Error al cancelar transacción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
