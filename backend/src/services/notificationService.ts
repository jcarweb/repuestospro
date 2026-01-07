import WalletNotification from '../models/WalletNotification';
import Store from '../models/Store';
import User from '../models/User';
import WalletSettings from '../models/WalletSettings';
import { emailService } from './emailService';

class NotificationService {
  // Enviar notificación de Wallet
  async sendWalletNotification(
    storeId: string,
    type: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      const store = await Store.findById(storeId);
      if (!store) return;

      // Obtener configuraciones de notificaciones
      const settings = await WalletSettings.findOne({ storeId });
      if (!settings || !settings.notificationsEnabled) return;

      // Determinar canales de notificación
      const channels: ('email' | 'sms' | 'push')[] = [];
      if (settings.emailNotifications) channels.push('email');
      if (settings.smsNotifications) channels.push('sms');
      if (settings.pushNotifications) channels.push('push');

      if (channels.length === 0) return;

      // Crear notificación
      const notification = new WalletNotification({
        storeId,
        walletId: store.wallet,
        type,
        title: this.getNotificationTitle(type, metadata),
        message: this.getNotificationMessage(type, metadata),
        priority: this.getNotificationPriority(type),
        status: 'pending',
        channels,
        metadata
      });

      await notification.save();

      // Procesar notificación según canales
      await this.processNotification(notification, store, channels);
    } catch (error) {
      console.error('Error enviando notificación de Wallet:', error);
    }
  }

  // Procesar notificación según canales
  private async processNotification(
    notification: any,
    store: any,
    channels: string[]
  ): Promise<void> {
    try {
      // Obtener usuarios de la tienda para notificaciones
      const users = await User.find({
        $or: [
          { _id: store.owner },
          { _id: { $in: store.managers } }
        ]
      });

      for (const channel of channels) {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(notification, store, users);
            break;
          case 'sms':
            await this.sendSMSNotification(notification, store, users);
            break;
          case 'push':
            await this.sendPushNotification(notification, store, users);
            break;
        }
      }

      // Marcar como enviada
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      console.error('Error procesando notificación:', error);
      notification.status = 'failed';
      await notification.save();
    }
  }

  // Enviar notificación por email
  private async sendEmailNotification(
    notification: any,
    store: any,
    users: any[]
  ): Promise<void> {
    try {
      // Enviar email a la tienda
      if (store.email) {
        // TODO: Implementar sendWalletNotification en EmailService
        // const result = await emailService.sendWalletNotification(
        //   store.email,
        //   notification.title,
        //   notification.type,
        //   {
        //     ...notification.metadata,
        //     storeName: store.name,
        //     dashboardUrl: `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/wallet/${store._id}`
        //   }
        // );
        console.log(`Notificación de wallet para ${store.email}: ${notification.title}`);
      }

      // Enviar email a usuarios de la tienda
      for (const user of users) {
        if (user.emailNotifications && user.email !== store.email) {
          // TODO: Implementar sendWalletNotification en EmailService
          // const result = await emailService.sendWalletNotification(
          //   user.email,
          //   notification.title,
          //   notification.type,
          //   {
          //     ...notification.metadata,
          //     storeName: store.name,
          //     userName: user.name,
          //     dashboardUrl: `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/wallet/${store._id}`
          //   }
          // );
          console.log(`Notificación de wallet para ${user.email}: ${notification.title}`);
        }
      }
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  }

  // Enviar notificación por SMS
  private async sendSMSNotification(
    notification: any,
    store: any,
    users: any[]
  ): Promise<void> {
    try {
      // Aquí implementarías el envío real de SMS
      // Por ejemplo, usando Twilio, AWS SNS, etc.
      console.log(`Enviando SMS a ${store.phone}: ${notification.message}`);
    } catch (error) {
      console.error('Error enviando SMS:', error);
    }
  }

  // Enviar notificación push
  private async sendPushNotification(
    notification: any,
    store: any,
    users: any[]
): Promise<void> {
  try {
      // Aquí implementarías el envío real de push notifications
      // Por ejemplo, usando Firebase Cloud Messaging, OneSignal, etc.
      console.log(`Enviando push notification: ${notification.title}`);
    } catch (error) {
      console.error('Error enviando push notification:', error);
    }
  }

  // Obtener título de notificación
  private getNotificationTitle(type: string, metadata: any): string {
    const titles: Record<string, string> = {
      low_balance: '⚠️ Saldo bajo en tu Wallet',
      insufficient_balance: '🚫 Saldo insuficiente - Pagos bloqueados',
      cash_payment_blocked: '🚫 Pagos en efectivo bloqueados',
      cash_payment_enabled: '✅ Pagos en efectivo habilitados',
      recharge_successful: '✅ Wallet recargada exitosamente',
      recharge_failed: '❌ Error en recarga de Wallet',
      commission_deducted: '💰 Comisión descontada',
      transaction_failed: '❌ Transacción fallida',
      wallet_created: '🎉 Wallet creada',
      wallet_deactivated: '⚠️ Wallet desactivada',
      settings_updated: '⚙️ Configuración actualizada'
    };

    return titles[type] || 'Notificación de Wallet';
  }

  // Obtener mensaje de notificación
  private getNotificationMessage(type: string, metadata: any): string {
    const messages: Record<string, string> = {
      low_balance: `Tu saldo actual es $${metadata.balance || 0}. Considera recargar tu Wallet para evitar interrupciones.`,
      insufficient_balance: `Tu saldo es insuficiente ($${metadata.balance || 0}). Los pagos en efectivo han sido bloqueados. Recarga tu Wallet para habilitarlos nuevamente.`,
      cash_payment_blocked: `Los pagos en efectivo han sido bloqueados debido a saldo insuficiente ($${metadata.balance || 0}). Recarga tu Wallet para habilitarlos.`,
      cash_payment_enabled: `Los pagos en efectivo han sido habilitados. Tu saldo actual es $${metadata.balance || 0}.`,
      recharge_successful: `Tu Wallet ha sido recargada con $${metadata.amount || 0}. Saldo actual: $${metadata.balance || 0}.`,
      recharge_failed: `Error al procesar la recarga de $${metadata.amount || 0}. Por favor, intenta nuevamente.`,
      commission_deducted: `Se ha descontado una comisión de $${metadata.amount || 0} por la venta de la orden ${metadata.orderNumber || ''}.`,
      transaction_failed: `Error al procesar una transacción. Por favor, verifica tu saldo y contacta soporte si es necesario.`,
      wallet_created: `Tu Wallet ha sido creada exitosamente. Comienza recargando saldo para habilitar pagos en efectivo.`,
      wallet_deactivated: `Tu Wallet ha sido desactivada. Contacta soporte para más información.`,
      settings_updated: `Las configuraciones de tu Wallet han sido actualizadas.`
    };

    return messages[type] || 'Notificación de Wallet';
  }

  // Obtener prioridad de notificación
  private getNotificationPriority(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const priorities: Record<string, string> = {
      low_balance: 'medium',
      insufficient_balance: 'critical',
      cash_payment_blocked: 'critical',
      cash_payment_enabled: 'high',
      recharge_successful: 'medium',
      recharge_failed: 'high',
      commission_deducted: 'low',
      transaction_failed: 'high',
      wallet_created: 'medium',
      wallet_deactivated: 'high',
      settings_updated: 'low'
    };

    return (priorities[type] as 'low' | 'medium' | 'high' | 'critical') || 'medium';
  }

  // Obtener template de email
  private getEmailTemplate(notification: any, store: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Tienda:</strong> ${store.name}<br>
              <strong>Fecha:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // Obtener notificaciones pendientes
  async getPendingNotifications(storeId: string): Promise<any[]> {
    try {
      return await WalletNotification.find({
        storeId,
        status: 'pending'
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error obteniendo notificaciones pendientes:', error);
      return [];
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await WalletNotification.findByIdAndUpdate(notificationId, {
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  // Limpiar notificaciones antiguas
  async cleanupOldNotifications(days: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      await WalletNotification.deleteMany({
        createdAt: { $lt: cutoffDate },
        status: { $in: ['sent', 'failed'] }
      });
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
    }
  }

  // Método genérico para enviar notificaciones
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      // Implementar lógica de notificación genérica
      console.log(`Enviando notificación a usuario ${userId}: ${title} - ${message}`);
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  // Método para enviar notificaciones a administradores
  async sendNotificationToAdmin(
    type: string,
    title: string,
    message: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      // Implementar lógica de notificación a administradores
      console.log(`Enviando notificación a administradores: ${title} - ${message}`);
    } catch (error) {
      console.error('Error enviando notificación a administradores:', error);
    }
  }
}

export const notificationService = new NotificationService();