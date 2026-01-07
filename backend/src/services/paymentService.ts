import axios from 'axios';

interface PayPalWebhookData {
  id: string;
  event_type: string;
  resource: {
    id: string;
    state: string;
    amount: {
      total: string;
      currency: string;
    };
    custom_id?: string;
  };
}

interface StripeWebhookData {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: {
        rechargeRequestId?: string;
      };
    };
  };
}

export class PaymentService {
  /**
   * Procesar webhook de PayPal
   */
  static async processPayPalWebhook(webhookData: PayPalWebhookData) {
    try {
      console.log('🔍 Procesando webhook de PayPal:', webhookData);

      // Verificar que es un evento de pago completado
      if (webhookData.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
        return { success: false, message: 'Evento no relevante' };
      }

      const { resource } = webhookData;
      
      // Verificar que el pago está completado
      if (resource.state !== 'COMPLETED') {
        return { success: false, message: 'Pago no completado' };
      }

      // Obtener ID de solicitud de recarga desde custom_id
      const rechargeRequestId = resource.custom_id;
      if (!rechargeRequestId) {
        return { success: false, message: 'ID de solicitud no encontrado' };
      }

      // Aquí validarías la transacción con PayPal
      const isValidPayment = await this.validatePayPalPayment(resource.id);
      if (!isValidPayment) {
        return { success: false, message: 'Pago no válido' };
      }

      return {
        success: true,
        rechargeRequestId,
        paymentId: resource.id,
        amount: parseFloat(resource.amount.total),
        currency: resource.amount.currency
      };

    } catch (error) {
      console.error('Error procesando webhook de PayPal:', error);
      return { success: false, message: 'Error procesando webhook' };
    }
  }

  /**
   * Procesar webhook de Stripe
   */
  static async processStripeWebhook(webhookData: StripeWebhookData) {
    try {
      console.log('🔍 Procesando webhook de Stripe:', webhookData);

      // Verificar que es un evento de pago completado
      if (webhookData.type !== 'payment_intent.succeeded') {
        return { success: false, message: 'Evento no relevante' };
      }

      const { data } = webhookData;
      const payment = data.object;

      // Verificar que el pago está completado
      if (payment.status !== 'succeeded') {
        return { success: false, message: 'Pago no completado' };
      }

      // Obtener ID de solicitud de recarga desde metadata
      const rechargeRequestId = payment.metadata?.rechargeRequestId;
      if (!rechargeRequestId) {
        return { success: false, message: 'ID de solicitud no encontrado' };
      }

      // Aquí validarías la transacción con Stripe
      const isValidPayment = await this.validateStripePayment(payment.id);
      if (!isValidPayment) {
        return { success: false, message: 'Pago no válido' };
      }

      return {
        success: true,
        rechargeRequestId,
        paymentId: payment.id,
        amount: payment.amount / 100, // Stripe usa centavos
        currency: payment.currency.toUpperCase()
      };

    } catch (error) {
      console.error('Error procesando webhook de Stripe:', error);
      return { success: false, message: 'Error procesando webhook' };
    }
  }

  /**
   * Validar pago con PayPal
   */
  private static async validatePayPalPayment(paymentId: string): Promise<boolean> {
    try {
      // Implementar validación con PayPal API
      // const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      // const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      // const paypalBaseUrl = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

      // // Obtener token de acceso
      // const tokenResponse = await axios.post(`${paypalBaseUrl}/v1/oauth2/token`, 
      //   'grant_type=client_credentials',
      //   {
      //     headers: {
      //       'Content-Type': 'application/x-www-form-urlencoded',
      //       'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`
      //     }
      //   }
      // );

      // const accessToken = tokenResponse.data.access_token;

      // // Verificar pago
      // const paymentResponse = await axios.get(
      //   `${paypalBaseUrl}/v1/payments/payment/${paymentId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // return paymentResponse.data.state === 'approved';
      return true; // Temporalmente deshabilitado

    } catch (error) {
      console.error('Error validando pago con PayPal:', error);
      return false;
    }
  }

  /**
   * Validar pago con Stripe
   */
  private static async validateStripePayment(paymentIntentId: string): Promise<boolean> {
    try {
      // const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      // const response = await axios.get(
      //   `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${stripeSecretKey}`,
      //       'Content-Type': 'application/x-www-form-urlencoded'
      //     }
      //   }
      // );

      // return response.data.status === 'succeeded';
      return true; // Temporalmente deshabilitado

    } catch (error) {
      console.error('Error validando pago con Stripe:', error);
      return false;
    }
  }

  /**
   * Crear intención de pago con Stripe
   */
  static async createStripePaymentIntent(
    amount: number, 
    currency: string, 
    rechargeRequestId: string
  ) {
    try {
      // const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      // const response = await axios.post(
      //   'https://api.stripe.com/v1/payment_intents',
      //   {
      //     amount: Math.round(amount * 100), // Convertir a centavos
      //     currency: currency.toLowerCase(),
      //     metadata: {
      //       rechargeRequestId
      //     }
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${stripeSecretKey}`,
      //       'Content-Type': 'application/x-www-form-urlencoded'
      //     }
      //   }
      // );

      // return {
      //   success: true,
      //   clientSecret: response.data.client_secret,
      //   paymentIntentId: response.data.id
      // };
      return { success: false, message: 'Servicio temporalmente deshabilitado' };

    } catch (error) {
      console.error('Error creando intención de pago con Stripe:', error);
      return { success: false, message: 'Error creando pago' };
    }
  }

  /**
   * Crear pago con PayPal
   */
  static async createPayPalPayment(
    amount: number, 
    currency: string, 
    rechargeRequestId: string
  ) {
    try {
      // const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      // const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      // const paypalBaseUrl = process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com';

      // // Obtener token de acceso
      // const tokenResponse = await axios.post(`${paypalBaseUrl}/v1/oauth2/token`, 
      //   'grant_type=client_credentials',
      //   {
      //     headers: {
      //       'Content-Type': 'application/x-www-form-urlencoded',
      //       'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`
      //     }
      //   }
      // );

      // const accessToken = tokenResponse.data.access_token;

      // // Crear pago
      // const paymentData = {
      //   intent: 'CAPTURE',
      //   purchase_units: [{
      //     amount: {
      //       currency_code: currency,
      //       value: amount.toString()
      //     },
      //     custom_id: rechargeRequestId
      //   }],
      //   application_context: {
      //     return_url: `${process.env.FRONTEND_URL}/wallet/recharge/success`,
      //     cancel_url: `${process.env.FRONTEND_URL}/wallet/recharge/cancel`
      //   }
      // };

      // const response = await axios.post(
      //   `${paypalBaseUrl}/v2/checkout/orders`,
      //   paymentData,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // return {
      //   success: true,
      //   paymentId: response.data.id,
      //   approvalUrl: response.data.links.find((link: any) => link.rel === 'approve')?.href
      // };
      return { success: false, message: 'Servicio temporalmente deshabilitado' };

    } catch (error) {
      console.error('Error creando pago con PayPal:', error);
      return { success: false, message: 'Error creando pago' };
    }
  }
}
