import { Request, Response } from 'express';
// import { PaymentService } from '../services/paymentService';
import RechargeRequest from '../models/RechargeRequest';
import { RechargeController } from './rechargeController';

export class WebhookController {
  /**
   * Webhook de PayPal
   */
  static async paypalWebhook(req: Request, res: Response): Promise<Response | void> {
    try {
      console.log('🔍 Webhook de PayPal recibido:', req.body);

      // Verificar firma del webhook (implementar según PayPal)
      const isValidSignature = await this.verifyPayPalSignature(req);
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Firma inválida'
        });
      }

      // Procesar webhook
      // const result = await PaymentService.processPayPalWebhook(req.body);
      const result: { success: boolean; message: string; rechargeRequestId?: string } = { success: false, message: 'Servicio temporalmente deshabilitado' };
      
      if (result.success && result.rechargeRequestId) {
        // Aprobar recarga automáticamente
        const rechargeRequest = await RechargeRequest.findById(result.rechargeRequestId);
        if (rechargeRequest && rechargeRequest.status === 'pending') {
          // Simular validación de administrador
          await RechargeController.validateRecharge({
            params: { rechargeRequestId: result.rechargeRequestId },
            body: { action: 'approve' },
            user: { _id: 'system' }
          } as any, res);
        }
      }

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error('Error procesando webhook de PayPal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Webhook de Stripe
   */
  static async stripeWebhook(req: Request, res: Response): Promise<Response | void> {
    try {
      console.log('🔍 Webhook de Stripe recibido:', req.body);

      // Verificar firma del webhook
      const isValidSignature = await this.verifyStripeSignature(req);
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Firma inválida'
        });
      }

      // Procesar webhook
      // const result = await PaymentService.processStripeWebhook(req.body);
      const result: { success: boolean; message: string; rechargeRequestId?: string } = { success: false, message: 'Servicio temporalmente deshabilitado' };
      
      if (result.success && result.rechargeRequestId) {
        // Aprobar recarga automáticamente
        const rechargeRequest = await RechargeRequest.findById(result.rechargeRequestId);
        if (rechargeRequest && rechargeRequest.status === 'pending') {
          // Simular validación de administrador
          await RechargeController.validateRecharge({
            params: { rechargeRequestId: result.rechargeRequestId },
            body: { action: 'approve' },
            user: { _id: 'system' }
          } as any, res);
        }
      }

      res.status(200).json({ success: true });
      return;
    } catch (error) {
      console.error('Error procesando webhook de Stripe:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar firma de PayPal
   */
  private static async verifyPayPalSignature(req: Request): Promise<boolean> {
    try {
      // Implementar verificación de firma según PayPal
      // Por ahora, retornar true para desarrollo
      return true;
    } catch (error) {
      console.error('Error verificando firma de PayPal:', error);
      return false;
    }
  }

  /**
   * Verificar firma de Stripe
   */
  private static async verifyStripeSignature(req: Request): Promise<boolean> {
    try {
      const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
      const signature = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

      if (!signature || !webhookSecret) {
        return false;
      }

      // Verificar firma
      stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      return true;
    } catch (error) {
      console.error('Error verificando firma de Stripe:', error);
      return false;
    }
  }
}
