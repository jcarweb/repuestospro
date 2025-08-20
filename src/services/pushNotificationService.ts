import { api } from '../config/api';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Verificar si las notificaciones push están soportadas
  isPushSupported(): boolean {
    return this.isSupported;
  }

  // Solicitar permisos de notificación
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Las notificaciones push no están soportadas en este navegador');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Registrar el service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported) {
      throw new Error('Service Worker no está soportado');
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.swRegistration);
      return this.swRegistration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw error;
    }
  }

  // Suscribirse a notificaciones push
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isSupported) {
      throw new Error('Las notificaciones push no están soportadas');
    }

    try {
      // Verificar permisos
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificación denegado');
      }

      // Registrar service worker si no está registrado
      if (!this.swRegistration) {
        await this.registerServiceWorker();
      }

      // Obtener suscripción existente o crear nueva
      let subscription = await this.swRegistration!.pushManager.getSubscription();
      
      if (!subscription) {
        // Crear nueva suscripción
        const vapidPublicKey = this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '');
        subscription = await this.swRegistration!.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });
      }

      // Enviar suscripción al servidor
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a notificaciones push:', error);
      throw error;
    }
  }

  // Desuscribirse de notificaciones push
  async unsubscribeFromPush(): Promise<void> {
    if (!this.isSupported || !this.swRegistration) {
      return;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
      }
    } catch (error) {
      console.error('Error desuscribiéndose de notificaciones push:', error);
      throw error;
    }
  }

  // Enviar suscripción al servidor
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await api.post('/notifications/push/subscribe', {
        subscription: subscription.toJSON()
      });
    } catch (error) {
      console.error('Error enviando suscripción al servidor:', error);
      throw error;
    }
  }

  // Remover suscripción del servidor
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await api.delete('/notifications/push/unsubscribe');
    } catch (error) {
      console.error('Error removiendo suscripción del servidor:', error);
      throw error;
    }
  }

  // Mostrar notificación local
  async showNotification(data: PushNotificationData): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/piezasya.png',
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        actions: data.actions
      });

      // Manejar clic en la notificación
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Navegar a la URL específica si se proporciona en data
        if (data.data?.url) {
          window.location.href = data.data.url;
        }
      };
    } catch (error) {
      console.error('Error mostrando notificación:', error);
    }
  }

  // Convertir clave VAPID de base64 a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Verificar estado de la suscripción
  async getSubscriptionStatus(): Promise<{
    subscribed: boolean;
    permission: NotificationPermission;
  }> {
    if (!this.isSupported) {
      return { subscribed: false, permission: 'denied' as NotificationPermission };
    }

    const permission = await this.requestPermission();
    let subscribed = false;

    if (this.swRegistration) {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      subscribed = !!subscription;
    }

    return { subscribed, permission };
  }
}

export const pushNotificationService = new PushNotificationService();
