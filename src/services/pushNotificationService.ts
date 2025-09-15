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

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private registrationRetries: number = 0;
  private maxRetries: number = 3;
  private autoUpdateEnabled: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('🔧 PushNotificationService inicializado:', {
      isSupported: this.isSupported,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window
    });
  }

  // Función de logging detallado
  private log(message: string, data: any = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[PUSH-LOG ${timestamp}] ${message}`;
    console.log(logMessage, data || '');
  }

  // Verificar si las notificaciones push están soportadas
  isPushSupported(): boolean {
    this.log('🔍 Verificando soporte de notificaciones push');
    this.log('✅ Soporte disponible:', this.isSupported);
    return this.isSupported;
  }

  // Solicitar permisos de notificación
  async requestPermission(): Promise<NotificationPermission> {
    this.log('🔐 Solicitando permisos de notificación');
    
    if (!this.isSupported) {
      this.log('❌ Notificaciones push no soportadas en este navegador');
      throw new Error('Las notificaciones push no están soportadas en este navegador');
    }

    try {
      this.log('📱 Solicitando permiso de Notification.requestPermission()');
      const permission = await Notification.requestPermission();
      this.log('✅ Permiso obtenido:', permission);
      return permission;
    } catch (error) {
      this.log('❌ Error solicitando permisos de notificación:', error);
      throw new Error('No se pudieron obtener permisos de notificación');
    }
  }

  // Registrar el service worker con control total
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    this.log('🚀 Iniciando registro del Service Worker');
    
    if (!this.isSupported) {
      this.log('❌ Service Worker no está soportado');
      throw new Error('Service Worker no está soportado');
    }

    // Verificar si ya hay un registro activo
    if (this.swRegistration && this.swRegistration.active) {
      this.log('✅ Service Worker ya registrado y activo');
      this.log('📊 Estado del registro:', {
        scope: this.swRegistration.scope,
        active: !!this.swRegistration.active,
        waiting: !!this.swRegistration.waiting,
        installing: !!this.swRegistration.installing
      });
      return this.swRegistration;
    }

    try {
      this.log('📝 Intentando registrar Service Worker en /sw.js');
      
      // Intentar registrar el Service Worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Evitar cache del Service Worker
      });

      this.log('✅ Service Worker registrado exitosamente:', {
        scope: this.swRegistration.scope,
        active: !!this.swRegistration.active,
        waiting: !!this.swRegistration.waiting,
        installing: !!this.swRegistration.installing
      });
      
      // Resetear contador de reintentos
      this.registrationRetries = 0;

      // Configurar el Service Worker para modo defensivo
      this.log('⚙️ Configurando Service Worker en modo defensivo');
      await this.configureServiceWorker();

      // Manejar actualizaciones del Service Worker
      this.log('🔄 Configurando manejo de actualizaciones');
      this.setupUpdateHandling();

      return this.swRegistration;
    } catch (error) {
      this.log('❌ Error registrando Service Worker:', error);
      
      // Intentar retry si no se han agotado los intentos
      if (this.registrationRetries < this.maxRetries) {
        this.registrationRetries++;
        this.log(`🔄 Reintentando registro del Service Worker (${this.registrationRetries}/${this.maxRetries})...`);
        
        // Esperar un poco antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * this.registrationRetries));
        
        return this.registerServiceWorker();
      }

      // Si se agotaron los reintentos, lanzar error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.log('💥 Se agotaron los reintentos de registro');
      throw new Error(`No se pudo registrar el Service Worker después de ${this.maxRetries} intentos: ${errorMessage}`);
    }
  }

  // Configurar el Service Worker para modo defensivo
  private async configureServiceWorker(): Promise<void> {
    try {
      this.log('🔧 Configurando Service Worker en modo defensivo');
      
      // DESHABILITAR COMPLETAMENTE LAS ACTUALIZACIONES AUTOMÁTICAS
      if (this.swRegistration && this.swRegistration.active) {
        this.log('📡 Enviando mensaje al Service Worker para deshabilitar actualizaciones');
        
        // Enviar mensaje al Service Worker para deshabilitar actualizaciones
        this.swRegistration.active.postMessage({
          type: 'SET_AUTO_UPDATE',
          enabled: false
        });
        
        this.log('✅ Service Worker configurado en modo defensivo - SIN actualizaciones automáticas');
      } else {
        this.log('⚠️ Service Worker no está activo aún, configurando cuando esté disponible');
        
        // Esperar a que el Service Worker esté activo
        if (this.swRegistration && this.swRegistration.installing) {
          this.swRegistration.installing.addEventListener('statechange', () => {
            if (this.swRegistration?.active) {
              this.log('🔄 Service Worker ahora está activo, configurando...');
              this.configureServiceWorker();
            }
          });
        }
      }
    } catch (error) {
      this.log('❌ Error configurando Service Worker:', error);
      this.log('🔧 Continuando incluso si falla la configuración');
      // Continuar incluso si falla la configuración
    }
  }

  // Habilitar/deshabilitar actualizaciones automáticas
  async setAutoUpdate(enabled: boolean): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.active) return;

    try {
      this.autoUpdateEnabled = enabled;
      
      // Enviar mensaje al Service Worker
      const channel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            resolve();
          } else {
            reject(new Error('Error configurando actualizaciones automáticas'));
          }
        };

        this.swRegistration!.active!.postMessage({
          type: 'SET_AUTO_UPDATE',
          enabled: enabled
        }, [channel.port2]);
      });
    } catch (error) {
      console.error('Error configurando actualizaciones automáticas:', error);
      throw error;
    }
  }

  // Tomar control de las páginas
  async claimClients(): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.active) return;

    try {
      const channel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            resolve();
          } else {
            reject(new Error('Error tomando control de las páginas'));
          }
        };

        this.swRegistration!.active!.postMessage({
          type: 'CLAIM_CLIENTS'
        }, [channel.port2]);
      });
    } catch (error) {
      console.error('Error tomando control de las páginas:', error);
      throw error;
    }
  }

  // Obtener estado del Service Worker
  async getServiceWorkerStatus(): Promise<any> {
    if (!this.swRegistration || !this.swRegistration.active) return null;

    try {
      const channel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data) {
            resolve(event.data);
          } else {
            reject(new Error('Error obteniendo estado del Service Worker'));
          }
        };

        this.swRegistration!.active!.postMessage({
          type: 'GET_STATUS'
        }, [channel.port2]);
      });
    } catch (error) {
      console.error('Error obteniendo estado del Service Worker:', error);
      return null;
    }
  }

  // Configurar el manejo de actualizaciones del Service Worker
  private setupUpdateHandling(): void {
    if (!this.swRegistration) return;

    // Escuchar cambios en el Service Worker
    this.swRegistration.addEventListener('updatefound', () => {
      console.log('Nueva versión del Service Worker disponible');
      
      const newWorker = this.swRegistration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nueva versión instalada, esperando activación...');
            // NO activar automáticamente - esperar instrucciones del usuario
          }
        });
      }
    });

    // Escuchar cambios de estado
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Nuevo Service Worker tomó control');
    });

    // Escuchar errores del Service Worker
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('Error en Service Worker:', event);
    });

    navigator.serviceWorker.addEventListener('messageerror', (event) => {
      console.error('Error en mensaje del Service Worker:', event);
    });
  }

  // Suscribirse a notificaciones push con mejor manejo de errores
  async subscribeToPush(): Promise<globalThis.PushSubscription | null> {
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

      // Verificar que el Service Worker esté activo
      if (!this.swRegistration!.active) {
        throw new Error('Service Worker no está activo');
      }

      // Obtener suscripción existente o crear nueva
      let subscription = await this.swRegistration!.pushManager.getSubscription();
      
      if (!subscription) {
        // Crear nueva suscripción
        const vapidPublicKey = this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '');
        
        if (!vapidPublicKey || vapidPublicKey.length === 0) {
          throw new Error('Clave VAPID no configurada');
        }

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
      
      // Si el error es del Service Worker, intentar limpiar y reintentar
      if (error instanceof Error && error.message.includes('Service Worker') && this.swRegistration) {
        try {
          await this.swRegistration.unregister();
          this.swRegistration = null;
          console.log('Service Worker desregistrado, reintentando...');
          
          // Reintentar una vez más
          return this.subscribeToPush();
        } catch (cleanupError) {
          console.error('Error limpiando Service Worker:', cleanupError);
        }
      }
      
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
  private async sendSubscriptionToServer(subscription: globalThis.PushSubscription): Promise<void> {
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

      const notificationOptions: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/piezasya.png',
        badge: data.badge,
        tag: data.tag,
        data: data.data
      };

      const notification = new Notification(data.title, notificationOptions);

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

    try {
      const permission = await this.requestPermission();
      let subscribed = false;

      if (this.swRegistration) {
        const subscription = await this.swRegistration.pushManager.getSubscription();
        subscribed = !!subscription;
      }

      return { subscribed, permission };
    } catch (error) {
      console.error('Error verificando estado de suscripción:', error);
      return { subscribed: false, permission: 'denied' as NotificationPermission };
    }
  }

  // Método para forzar la actualización del Service Worker
  async forceUpdate(): Promise<void> {
    if (!this.swRegistration) return;

    try {
      // Habilitar actualizaciones automáticas temporalmente
      await this.setAutoUpdate(true);
      
      // Enviar mensaje al Service Worker para forzar actualización
      if (this.swRegistration.active) {
        this.swRegistration.active.postMessage({ type: 'UPDATE_SW' });
      }
      
      // También intentar actualizar manualmente
      await this.swRegistration.update();
      
      // Deshabilitar actualizaciones automáticas después de la actualización
      setTimeout(() => {
        this.setAutoUpdate(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error forzando actualización del Service Worker:', error);
    }
  }

  // Método para limpiar y reinstalar el Service Worker
  async reinstallServiceWorker(): Promise<void> {
    try {
      if (this.swRegistration) {
        await this.swRegistration.unregister();
        this.swRegistration = null;
      }
      
      // Limpiar caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      // Reintentar registro
      await this.registerServiceWorker();
    } catch (error) {
      console.error('Error reinstalando Service Worker:', error);
      throw error;
    }
  }

  // Método para limpiar caches del Service Worker
  async clearServiceWorkerCaches(): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.active) return;

    try {
      const channel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            resolve();
          } else {
            reject(new Error('Error limpiando caches'));
          }
        };

        this.swRegistration!.active!.postMessage({
          type: 'CLEAR_CACHES'
        }, [channel.port2]);
      });
    } catch (error) {
      console.error('Error limpiando caches del Service Worker:', error);
      throw error;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
