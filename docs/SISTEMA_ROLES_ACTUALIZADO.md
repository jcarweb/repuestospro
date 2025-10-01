# Sistema de Roles Actualizado - PiezasYA v1.4.0

**Versión**: 1.4.0  
**Desarrollador**: Juan Hernandez  
**Empresa**: LDJ Digital Solutions  
**Equipo de Desarrollo**: PiezasYA  
**Última actualización**: Octubre 2025

## Resumen de Cambios

Se ha actualizado completamente el sistema de roles de la aplicación PiezasYA v1.4.0 para implementar las directrices especificadas. Los cambios incluyen la reestructuración de roles, nuevos campos específicos para cada rol, middlewares de autorización mejorados y funcionalidades específicas por rol.

## Roles Implementados

### 1. Administrador (admin)

**Funcionalidades principales:**
- Gestión completa de usuarios y permisos del sistema
- Configuración de productos, categorías y atributos
- Monitoreo de ventas y reportes globales
- Administración de códigos de registro
- Configuración de Google Analytics
- Gestión del sistema de lealtad y premios
- Configuración de currency, impuestos y tasas de delivery
- Creación de otros usuarios administradores, delivery y gestores de tienda

**Campos específicos:**
```typescript
adminPermissions: {
  userManagement: boolean;
  systemConfiguration: boolean;
  analyticsAccess: boolean;
  codeGeneration: boolean;
  globalSettings: boolean;
}
```

### 2. Cliente (client)

**Funcionalidades principales:**
- Exploración del catálogo completo de repuestos
- Realización de compras seguras
- Sistema de puntos de lealtad
- Acceso a descuentos y promociones exclusivas
- Configuración de notificaciones y ofertas
- Historial completo de compras
- Calificación de productos, delivery y tiendas
- Configuración de seguridad (2FA, PIN, huella)
- Gestión de favoritos y carrito de compras

**Campos específicos:**
```typescript
// Sistema de fidelización
points: number;
referralCode: string;
totalPurchases: number;
totalSpent: number;
loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';

// Configuraciones de notificaciones
notificationsEnabled: boolean;
emailNotifications: boolean;
pushNotifications: boolean;
marketingEmails: boolean;
```

### 3. Delivery (delivery)

**Funcionalidades principales:**
- Visualización de órdenes asignadas para entrega
- Acceso al mapa con rutas de entrega
- Reporte de estado de entregas
- Configuración de horario de trabajo
- Control de disponibilidad (automático/manual)
- Visualización de calificaciones recibidas
- Configuración del perfil de usuario
- Gestión de información del vehículo

**Campos específicos:**
```typescript
deliveryStatus: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
autoStatusMode: boolean; // true = automático, false = manual
currentOrder?: string;
deliveryZone: {
  center: [number, number];
  radius: number;
};
vehicleInfo: {
  type: string;
  model: string;
  plate: string;
};
workSchedule: {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
};
```

### 4. Gestor de Tienda (store_manager)

**Funcionalidades principales:**
- Gestión completa del inventario de repuestos
- Carga de lotes de productos y gestión individual
- Creación y gestión de promociones
- Acceso a estadísticas de Google Analytics
- Exportación de productos y reportes de ventas
- Verificación de estatus de órdenes
- Asignación y reasignación de delivery
- Configuración de cupones de descuento
- Manejo de mensajería privada con clientes
- Control de valoraciones y comentarios

**Campos específicos:**
```typescript
storeInfo: {
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  logo?: string;
  banner?: string;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  deliverySettings: {
    enabled: boolean;
    freeDeliveryThreshold: number;
    deliveryFee: number;
    maxDeliveryDistance: number;
  };
  paymentSettings: {
    cash: boolean;
    card: boolean;
    transfer: boolean;
    digitalWallet: boolean;
  };
};
commissionRate: number;
taxRate: number;
```

## Cambios Técnicos Implementados

### 1. Modelo de Usuario Actualizado

**Archivo:** `backend/src/models/User.ts`

- Cambio de roles: `'user'` → `'client'`
- Nuevos campos específicos para cada rol
- Índices optimizados para consultas
- Middleware pre-save para generar códigos de referido
- Métodos de instancia mejorados

### 2. Middlewares de Autorización

**Archivo:** `backend/src/middleware/authMiddleware.ts`

- `adminMiddleware`: Solo administradores
- `clientMiddleware`: Solo clientes
- `deliveryMiddleware`: Solo personal de delivery
- `storeManagerMiddleware`: Solo gestores de tienda
- `adminOrStoreManagerMiddleware`: Admin o gestor de tienda
- `adminOrDeliveryMiddleware`: Admin o delivery
- `staffMiddleware`: Cualquier usuario excepto clientes

### 3. Tipos de TypeScript Actualizados

**Archivo:** `src/types/index.ts`

- Nuevo tipo `UserRole`
- Interfaz `User` actualizada con todos los campos específicos
- Nuevos tipos para delivery, tienda y lealtad
- Tipos para órdenes y estados de delivery

### 4. Contexto de Autenticación Mejorado

**Archivo:** `src/contexts/AuthContext.tsx`

- Métodos `hasRole()` y `hasAnyRole()` para verificación de permisos
- Tipos actualizados para los nuevos roles
- Mejor manejo de estados de autenticación

### 5. Componentes de Ruta Protegida

- `AdminRoute`: Protege rutas de administrador
- `ClientRoute`: Protege rutas de cliente
- `DeliveryRoute`: Protege rutas de delivery
- `StoreManagerRoute`: Protege rutas de gestor de tienda

### 6. Sidebar Dinámico

**Archivo:** `src/components/Sidebar.tsx`

- Menús específicos para cada rol
- Navegación contextual según permisos
- Iconos y descripciones apropiadas para cada funcionalidad

### 7. Servicio de Email Actualizado

**Archivo:** `backend/src/services/emailService.ts`

- Emails específicos por rol
- Información detallada de funcionalidades
- Plantillas HTML mejoradas
- Configuración de email actualizada

## Rutas Implementadas

### Rutas de Administrador
- `/admin/dashboard` - Panel principal
- `/admin/users` - Gestión de usuarios
- `/admin/products` - Gestión de productos
- `/admin/categories` - Gestión de categorías
- `/admin/promotions` - Gestión de promociones
- `/admin/sales` - Reportes de ventas
- `/admin/loyalty` - Sistema de lealtad
- `/admin/analytics` - Google Analytics
- `/admin/registration-codes` - Códigos de registro
- `/admin/search-config` - Configuración de búsqueda
- `/admin/generate-products` - Generar productos

### Rutas de Gestor de Tienda
- `/store-manager/dashboard` - Panel de tienda
- `/store-manager/products` - Productos de la tienda
- `/store-manager/promotions` - Promociones de la tienda
- `/store-manager/sales` - Ventas de la tienda
- `/store-manager/orders` - Gestión de pedidos
- `/store-manager/delivery` - Gestión de delivery
- `/store-manager/analytics` - Analytics de la tienda
- `/store-manager/messages` - Mensajería
- `/store-manager/reviews` - Reseñas
- `/store-manager/settings` - Configuración

### Rutas de Delivery
- `/delivery/dashboard` - Panel de delivery
- `/delivery/orders` - Pedidos asignados
- `/delivery/map` - Mapa de rutas
- `/delivery/report` - Reportar entregas
- `/delivery/ratings` - Calificaciones
- `/delivery/schedule` - Horario de trabajo
- `/delivery/status` - Estado de disponibilidad
- `/delivery/profile` - Perfil de delivery

### Rutas de Cliente
- `/` - Página principal
- `/products` - Explorar productos
- `/categories` - Ver categorías
- `/cart` - Carrito de compras
- `/favorites` - Productos favoritos
- `/loyalty` - Sistema de lealtad
- `/orders` - Historial de pedidos
- `/profile` - Perfil de usuario
- `/security` - Configuración de seguridad
- `/notifications` - Configurar notificaciones

## Scripts de Migración

### Actualización de Roles
**Archivo:** `backend/update-user-roles.js`

Este script actualiza automáticamente:
- Usuarios con rol 'user' → 'client'
- Configuraciones específicas por rol
- Códigos de referido faltantes
- Permisos de administrador
- Configuraciones de tienda y delivery

**Ejecución:**
```bash
cd backend
node update-user-roles.js
```

## Configuración de Email

**Archivo:** `backend/src/config/env.ts`

Variables de entorno actualizadas:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password
```

## Próximos Pasos

1. **Crear páginas faltantes:**
   - Páginas específicas para gestor de tienda
   - Páginas específicas para delivery
   - Páginas adicionales para cliente

2. **Implementar funcionalidades específicas:**
   - Sistema de delivery con mapas
   - Mensajería privada cliente-tienda
   - Sistema de calificaciones
   - Gestión de horarios de trabajo

3. **Pruebas y validación:**
   - Probar todos los middlewares de autorización
   - Validar funcionalidades por rol
   - Verificar emails específicos por rol

4. **Documentación adicional:**
   - Manual de usuario por rol
   - Guía de administración
   - Documentación técnica detallada

## Notas Importantes

- Todos los usuarios existentes con rol 'user' serán actualizados automáticamente a 'client'
- Los códigos de referido se generarán automáticamente para usuarios que no los tengan
- Las configuraciones por defecto se aplicarán según el rol
- Los middlewares de autorización previenen acceso no autorizado
- El sistema mantiene compatibilidad con configuraciones existentes

## Contacto

Para dudas o problemas con la implementación, revisar la documentación técnica o contactar al equipo de desarrollo.
