import { Request, Response } from 'express';
import RechargeRequest from '../models/RechargeRequest';
import Wallet from '../models/Wallet';
import WalletTransaction from '../models/WalletTransaction';
import exchangeRateService from '../services/exchangeRateService';
// import { sendEmail } from '../services/emailService';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

export class RechargeController {
  /**
   * Crear una nueva solicitud de recarga
   */
  static async createRechargeRequest(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('🔍 RechargeController: createRechargeRequest called');
      console.log('🔍 RechargeController: req.body:', req.body);
      console.log('🔍 RechargeController: req.user:', req.user);
      
      const { storeId, amount, currency, paymentMethod } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        console.log('❌ RechargeController: Usuario no autenticado');
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Validar datos de entrada
      if (!storeId || !amount || !currency || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos'
        });
      }

      // Verificar que la wallet existe
      const wallet = await Wallet.findOne({ storeId });
      if (!wallet) {
        console.log('❌ RechargeController: Wallet no encontrada para storeId:', storeId);
        return res.status(404).json({
          success: false,
          message: 'Wallet no encontrada'
        });
      }

      // Validar monto mínimo y máximo
      if (amount < wallet.settings.minimumRechargeAmount) {
        return res.status(400).json({
          success: false,
          message: `El monto mínimo es ${wallet.settings.minimumRechargeAmount} ${currency}`
        });
      }

      if (amount > wallet.settings.maximumRechargeAmount) {
        return res.status(400).json({
          success: false,
          message: `El monto máximo es ${wallet.settings.maximumRechargeAmount} ${currency}`
        });
      }

      // Obtener tasa de cambio
      const targetCurrency = wallet.currency;
      const { amount: convertedAmount, rate } = await exchangeRateService.convertAmount(
        amount, 
        currency as 'USD' | 'EUR' | 'VES', 
        targetCurrency as 'USD' | 'VES'
      );

      // Obtener instrucciones de pago
      const paymentInstructions = exchangeRateService.getPaymentInstructions(
        paymentMethod, 
        amount, 
        currency
      );

      // Crear solicitud de recarga
      const rechargeRequest = new RechargeRequest({
        storeId,
        userId,
        amount,
        currency,
        targetCurrency,
        exchangeRate: rate,
        convertedAmount,
        paymentMethod,
        status: 'pending',
        paymentInstructions
      });

      await rechargeRequest.save();

      // Enviar email con instrucciones
      // await sendEmail({
      //   to: req.user.email,
      //   subject: 'Instrucciones de Pago - Recarga de Wallet',
      //   template: 'recharge-instructions',
      //   data: {
      //     amount,
      //     currency,
      //     convertedAmount,
      //     targetCurrency,
      //     paymentMethod,
      //     paymentInstructions,
      //     reference: rechargeRequest._id
      //   }
      // });

      console.log('✅ RechargeController: Solicitud de recarga creada exitosamente:', rechargeRequest._id);
      
      res.status(201).json({
        success: true,
        message: 'Solicitud de recarga creada exitosamente',
        data: {
          rechargeRequest: {
            id: rechargeRequest._id,
            amount,
            currency,
            convertedAmount,
            targetCurrency,
            paymentMethod,
            status: 'pending',
            paymentInstructions,
            createdAt: rechargeRequest.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Error creando solicitud de recarga:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtener solicitudes de recarga de un usuario
   */
  static async getUserRechargeRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { page = 1, limit = 10, status } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const query: any = { userId };
      if (status) {
        query.status = status;
      }

      const rechargeRequests = await RechargeRequest.find(query)
        .populate('storeId', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await RechargeRequest.countDocuments(query);

      res.json({
        success: true,
        data: {
          rechargeRequests,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo solicitudes de recarga:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir comprobante de pago
   */
  static async uploadPaymentProof(req: AuthenticatedRequest, res: Response) {
    try {
      const { rechargeRequestId } = req.params;
      const { paymentReference, paymentProof } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const rechargeRequest = await RechargeRequest.findOne({
        _id: rechargeRequestId,
        userId
      });

      if (!rechargeRequest) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de recarga no encontrada'
        });
      }

      if (rechargeRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'La solicitud ya no está pendiente'
        });
      }

      // Actualizar con comprobante
      rechargeRequest.paymentReference = paymentReference;
      rechargeRequest.paymentProof = paymentProof;
      rechargeRequest.status = 'pending'; // Mantener pendiente hasta validación

      await rechargeRequest.save();

      // Notificar a administradores
      // await sendEmail({
      //   to: 'admin@piezasyaya.com',
      //   subject: 'Nuevo Comprobante de Pago - Validación Requerida',
      //   template: 'admin-payment-proof',
      //   data: {
      //     rechargeRequest,
      //     user: req.user
      //   }
      // });

      res.json({
        success: true,
        message: 'Comprobante de pago subido exitosamente',
        data: { rechargeRequest }
      });

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Validar recarga (solo administradores)
   */
  static async validateRecharge(req: AuthenticatedRequest, res: Response) {
    try {
      const { rechargeRequestId } = req.params;
      const { action, adminNotes } = req.body; // action: 'approve' | 'reject'
      const adminId = req.user?._id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const rechargeRequest = await RechargeRequest.findById(rechargeRequestId);
      if (!rechargeRequest) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de recarga no encontrada'
        });
      }

      if (rechargeRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'La solicitud ya fue procesada'
        });
      }

      if (action === 'approve') {
        // Aprobar recarga
        await this.approveRecharge(rechargeRequest, adminId);
        
        res.json({
          success: true,
          message: 'Recarga aprobada exitosamente',
          data: { rechargeRequest }
        });

      } else if (action === 'reject') {
        // Rechazar recarga
        rechargeRequest.status = 'rejected';
        rechargeRequest.rejectionReason = adminNotes;
        rechargeRequest.validatedBy = adminId;
        rechargeRequest.validatedAt = new Date();

        await rechargeRequest.save();

        // Notificar al usuario
        // await sendEmail({
        //   to: rechargeRequest.userId.toString(), // Necesitarías obtener el email del usuario
        //   subject: 'Recarga Rechazada',
        //   template: 'recharge-rejected',
        //   data: {
        //     rechargeRequest,
        //     rejectionReason: adminNotes
        //   }
        // });

        res.json({
          success: true,
          message: 'Recarga rechazada',
          data: { rechargeRequest }
        });

      } else {
        res.status(400).json({
          success: false,
          message: 'Acción inválida'
        });
      }

    } catch (error) {
      console.error('Error validando recarga:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Aprobar recarga y acreditar saldo
   */
  private static async approveRecharge(rechargeRequest: any, adminId: string) {
    const session = await RechargeRequest.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Actualizar solicitud
        rechargeRequest.status = 'approved';
        rechargeRequest.validatedBy = adminId;
        rechargeRequest.validatedAt = new Date();
        await rechargeRequest.save({ session });

        // Obtener wallet
        const wallet = await Wallet.findOne({ storeId: rechargeRequest.storeId }).session(session);
        if (!wallet) {
          throw new Error('Wallet no encontrada');
        }

        // Calcular nuevo saldo
        const newBalance = wallet.balance + rechargeRequest.convertedAmount;

        // Crear transacción
        const transaction = new WalletTransaction({
          storeId: rechargeRequest.storeId,
          walletId: wallet._id,
          rechargeRequestId: rechargeRequest._id,
          type: 'deposit',
          amount: rechargeRequest.convertedAmount,
          currency: rechargeRequest.targetCurrency,
          description: `Recarga aprobada - ${rechargeRequest.paymentMethod.toUpperCase()}`,
          reference: rechargeRequest.paymentReference,
          status: 'completed',
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          exchangeRate: rechargeRequest.exchangeRate,
          originalAmount: rechargeRequest.amount,
          originalCurrency: rechargeRequest.currency,
          metadata: {
            paymentMethod: rechargeRequest.paymentMethod,
            transactionId: rechargeRequest._id.toString()
          }
        });

        await transaction.save({ session });

        // Actualizar wallet
        wallet.balance = newBalance;
        wallet.lastTransactionAt = new Date();
        await wallet.save({ session });

        // Notificar al usuario
        // await sendEmail({
        //   to: rechargeRequest.userId.toString(),
        //   subject: 'Recarga Aprobada - Saldo Acreditado',
        //   template: 'recharge-approved',
        //   data: {
        //     rechargeRequest,
        //     newBalance,
        //     transaction
        //   }
        // });
      });

    } catch (error) {
      console.error('Error en transacción de aprobación:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Obtener solicitudes pendientes (solo administradores)
   */
  static async getPendingRecharges(req: AuthenticatedRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const rechargeRequests = await RechargeRequest.find({ status: 'pending' })
        .populate('userId', 'name email')
        .populate('storeId', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await RechargeRequest.countDocuments({ status: 'pending' });

      res.json({
        success: true,
        data: {
          rechargeRequests,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo recargas pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
