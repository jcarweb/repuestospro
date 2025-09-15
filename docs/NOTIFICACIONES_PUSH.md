# Sistema de Notificaciones Push - PiezasYA

## Descripción

El sistema de notificaciones push permite enviar notificaciones en tiempo real a los usuarios de la aplicación web, Android e iOS. Utiliza la Web Push API para navegadores web y puede extenderse para aplicaciones móviles nativas.

## Características

- ✅ **Notificaciones Push Web**: Compatible con todos los navegadores modernos
- ✅ **Service Worker**: Manejo de notificaciones en segundo plano
- ✅ **Suscripciones Automáticas**: Los usuarios pueden suscribirse/desuscribirse fácilmente
- ✅ **Notificaciones por Rol**: Enviar notificaciones específicas por tipo de usuario
- ✅ **Notificaciones por Ubicación**: Enviar notificaciones a usuarios en un área específica
- ✅ **Estadísticas**: Monitoreo de suscripciones y entregas
- 🔄 **Android/iOS**: Preparado para extensión a aplicaciones móviles

## Configuración

### 1. Claves VAPID

Las claves VAPID son necesarias para autenticar las notificaciones push. Se generan automáticamente con el script incluido.

```bash
# Generar claves VAPID
cd backend
node generate-vapid-keys.js
```

### 2. Variables de Entorno

Agregar las siguientes variables al archivo `.env` del backend:

```env
# Configuración de VAPID para notificaciones push
VAPID_PUBLIC_KEY=BGilUKAryEto13QdVaxeKktJPGNMPO8IotnTJ01BpH209GcgwbplsMClR5MBCkXEX238a9cSlhr_CH7fE6678EY
VAPID_PRIVATE_KEY=VG75o7UF2mSXMhoE-t461Y2uWxMQAQRmMGBpljAGdOA
```

Y al archivo `.env` del frontend:

```env
# Clave pública VAPID para el frontend
VITE_VAPID_PUBLIC_KEY=BGilUKAryEto13QdVaxeKktJPGNMPO8IotnTJ01BpH209GcgwbplsMClR5MBCkXEX238a9cSlhr_CH7fE6678EY
```

### 3. Service Worker

El Service Worker (`public/sw.js`) maneja las notificaciones push en el navegador. Se registra automáticamente cuando el usuario habilita las notificaciones push.

## Uso

### Frontend

#### 1. Habilitar Notificaciones Push

Los usuarios pueden habilitar las notificaciones push desde la página de configuración:

```typescript
import { pushNotificationService } from '../services/pushNotificationService';

// Suscribirse a notificaciones push
await pushNotificationService.subscribeToPush();

// Desuscribirse de notificaciones push
await pushNotificationService.unsubscribeFromPush();
```

#### 2. Verificar Estado

```typescript
// Verificar si las notificaciones push están soportadas
const isSupported = pushNotificationService.isPushSupported();

// Obtener estado de la suscripción
const status = await pushNotificationService.getSubscriptionStatus();
```

### Backend

#### 1. Enviar Notificación a un Usuario

```typescript
import notificationController from '../controllers/notificationController';

await notificationController.sendPushToUser(userId, {
  title: 'Nuevo pedido',
  body: 'Tienes un nuevo pedido pendiente',
  icon: '/piezasya.png',
  data: {
    url: '/orders/123',
    orderId: '123'
  }
});
```

#### 2. Enviar Notificación a Múltiples Usuarios

```typescript
// Por rol
await notificationController.sendPushByRole('client', {
  title: 'Promoción especial',
  body: '¡20% de descuento en repuestos!',
  data: {
    url: '/promotions'
  }
});

// Por ubicación
await notificationController.sendPushByLocation(
  [-66.9036, 10.4806], // Caracas, Venezuela
  10, // 10km de radio
  {
    title: 'Repuestos cerca de ti',
    body: 'Encuentra repuestos en tu área',
    data: {
      url: '/nearby-products'
    }
  }
);

// A todos los usuarios
await notificationController.sendPushToAll({
  title: 'Mantenimiento programado',
  body: 'La aplicación estará en mantenimiento mañana',
  data: {
    url: '/maintenance'
  }
});
```

#### 3. Obtener Estadísticas

```typescript
// Obtener estadísticas de notificaciones push
const stats = await notificationController.getPushStats();
```

## API Endpoints

### Suscribirse a Notificaciones Push
```
POST /api/notifications/push/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Desuscribirse de Notificaciones Push
```
DELETE /api/notifications/push/unsubscribe
```

### Obtener Estadísticas (Admin)
```
GET /api/notifications/push/stats
```

## Estructura de Notificaciones

```typescript
interface PushNotification {
  title: string;           // Título de la notificación
  body: string;            // Cuerpo de la notificación
  icon?: string;           // URL del ícono (opcional)
  badge?: string;          // URL del badge (opcional)
  tag?: string;            // Tag para agrupar notificaciones
  data?: Record<string, any>; // Datos adicionales
  actions?: Array<{        // Acciones de la notificación
    action: string;
    title: string;
    icon?: string;
  }>;
}
```

## Casos de Uso

### 1. Nuevo Pedido
- **Destinatarios**: Cliente, Delivery, Store Manager
- **Contenido**: Detalles del pedido, estado, ubicación

### 2. Promociones
- **Destinatarios**: Clientes
- **Contenido**: Descuentos, ofertas especiales, cupones

### 3. Actualizaciones de Estado
- **Destinatarios**: Cliente, Delivery
- **Contenido**: Cambios en el estado del pedido

### 4. Alertas de Stock
- **Destinatarios**: Store Manager
- **Contenido**: Productos con stock bajo

### 5. Notificaciones de Ubicación
- **Destinatarios**: Clientes en área específica
- **Contenido**: Repuestos disponibles cerca

## Seguridad

- Las claves VAPID privadas nunca se exponen al frontend
- Las suscripciones se validan en el servidor
- Las notificaciones se envían solo a usuarios autenticados
- Se implementa rate limiting para prevenir spam

## Monitoreo

### Métricas Disponibles
- Total de usuarios suscritos
- Porcentaje de usuarios con push habilitado
- Estadísticas por rol de usuario
- Tasa de entrega de notificaciones

### Logs
- Suscripciones/desuscripciones
- Errores de envío
- Intentos de suscripción fallidos

## Extensión para Móviles

El sistema está preparado para extenderse a aplicaciones móviles:

### Android
- Usar Firebase Cloud Messaging (FCM)
- Integrar con el sistema de notificaciones push existente

### iOS
- Usar Apple Push Notification Service (APNs)
- Configurar certificados de desarrollo y producción

## Troubleshooting

### Problemas Comunes

1. **Notificaciones no aparecen**
   - Verificar permisos del navegador
   - Comprobar que el Service Worker esté registrado
   - Revisar la consola del navegador para errores

2. **Error de suscripción**
   - Verificar que las claves VAPID estén configuradas correctamente
   - Comprobar que el dominio esté en HTTPS (requerido para producción)

3. **Notificaciones no se envían**
   - Verificar la configuración de web-push
   - Comprobar que las claves VAPID sean válidas
   - Revisar los logs del servidor

### Debugging

```typescript
// Habilitar logs detallados
console.log('Push subscription:', subscription);
console.log('Push status:', await pushNotificationService.getSubscriptionStatus());
```

## Próximos Pasos

1. **Implementar notificaciones push para Android/iOS**
2. **Agregar plantillas de notificaciones**
3. **Implementar programación de notificaciones**
4. **Agregar analytics de engagement**
5. **Implementar notificaciones push para promociones automáticas**
