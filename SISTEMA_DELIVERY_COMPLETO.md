# Sistema de Delivery Completo - PiezasYA

## Resumen Ejecutivo

El sistema de delivery de PiezasYA es una solución integral que maneja la gestión de entregas de repuestos automotrices con una arquitectura mixta que incluye riders internos y externos. El sistema está diseñado para optimizar la asignación de entregas, gestionar la disponibilidad de riders y proporcionar tracking en tiempo real.

## Arquitectura del Sistema

### 1. Modelos de Datos

#### Modelo Delivery (`backend/src/models/Delivery.ts`)
```typescript
interface IDelivery {
  // Información básica
  orderId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  
  // Información del rider
  riderId?: mongoose.Types.ObjectId; // Para riders internos
  externalRiderId?: string; // Para riders externos
  riderType: 'internal' | 'external';
  riderName: string;
  riderPhone: string;
  riderVehicle?: {
    type: 'motorcycle' | 'bicycle' | 'car';
    plate?: string;
    model?: string;
  };
  
  // Estado del delivery
  status: 'pending' | 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  
  // Ubicaciones
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    storeName: string;
  };
  
  deliveryLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    customerName: string;
    customerPhone: string;
    instructions?: string;
  };
  
  // Tiempos
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  
  // Costos
  deliveryFee: number;
  riderPayment: number;
  platformFee: number;
  
  // Calificaciones
  customerRating?: number;
  customerReview?: string;
  riderRating?: number;
  riderReview?: string;
  
  // Tracking
  trackingCode: string;
  trackingUrl?: string;
  
  // Configuración de asignación
  assignmentConfig: {
    priority: 'internal_first' | 'external_first' | 'mixed';
    internalPercentage: number; // 0-100
    maxWaitTime: number; // minutos
    maxDistance: number; // km
  };
}
```

#### Modelo Rider (`backend/src/models/Rider.ts`)
```typescript
interface IRider {
  // Información básica
  userId?: mongoose.Types.ObjectId; // Para riders internos
  externalId?: string; // Para riders externos
  type: 'internal' | 'external';
  
  // Datos personales
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth: Date;
  
  // Información del vehículo
  vehicle: {
    type: 'motorcycle' | 'bicycle' | 'car';
    brand?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
    insurance?: {
      company: string;
      policyNumber: string;
      expiryDate: Date;
    };
  };
  
  // Documentos
  documents: {
    idCard: { front: string; back: string; verified: boolean; };
    driverLicense?: { front: string; back: string; verified: boolean; expiryDate: Date; };
    vehicleRegistration?: { front: string; back: string; verified: boolean; };
    insurance?: { document: string; verified: boolean; };
    backgroundCheck?: { document: string; verified: boolean; expiryDate: Date; };
  };
  
  // Estado y disponibilidad
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  availability: {
    isOnline: boolean;
    isAvailable: boolean;
    currentLocation?: { lat: number; lng: number; timestamp: Date; };
    workingHours: { start: string; end: string; days: number[]; };
    maxDistance: number; // km
    maxOrdersPerDay: number;
  };
  
  // Calificaciones y rendimiento
  rating: {
    average: number;
    totalReviews: number;
    lastUpdated: Date;
  };
  
  // Estadísticas
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    cancelledDeliveries: number;
    totalEarnings: number;
    totalDistance: number;
    averageDeliveryTime: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
  };
  
  // Configuración de pagos
  payment: {
    method: 'cash' | 'bank_transfer' | 'mobile_payment';
    bankAccount?: { bank: string; accountNumber: string; accountType: string; };
    mobilePayment?: { provider: string; phone: string; };
    commissionRate: number;
    minimumPayout: number;
  };
  
  // Para riders externos
  externalProvider?: {
    name: string;
    type: 'mototaxista' | 'courier' | 'independent';
    agreementId?: string;
    commissionRate: number;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
  };
  
  // Zonas de trabajo
  serviceAreas: Array<{
    name: string;
    coordinates: { lat: number; lng: number; };
    radius: number;
    isActive: boolean;
  }>;
  
  // Configuración de la app
  appSettings: {
    language: string;
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    autoAcceptOrders: boolean;
    maxConcurrentOrders: number;
  };
}
```

### 2. Servicios Principales

#### DeliveryAssignmentService (`backend/src/services/DeliveryAssignmentService.ts`)
```typescript
export class DeliveryAssignmentService {
  // Asigna un delivery a un rider disponible
  static async assignDelivery(deliveryId: string, config: AssignmentConfig)
  
  // Busca riders disponibles en tiempo real
  static async findAvailableRiders(lat: number, lng: number, maxDistance: number)
  
  // Reasigna un delivery a otro rider
  static async reassignDelivery(deliveryId: string, newRiderId: string, reason: string)
  
  // Evalúa candidatos de riders
  private static async evaluateRiderCandidate(rider: IRider, delivery: IDelivery, config: AssignmentConfig)
  
  // Calcula score de disponibilidad
  private static calculateAvailabilityScore(rider: IRider): number
}
```

### 3. Controladores

#### DeliveryController (`backend/src/controllers/DeliveryController.ts`)
```typescript
export class DeliveryController {
  // Crear un nuevo delivery
  static async createDelivery(req: Request, res: Response)
  
  // Obtener deliveries
  static async getDeliveries(req: Request, res: Response)
  
  // Obtener delivery específico
  static async getDelivery(req: Request, res: Response)
  
  // Actualizar estado de delivery
  static async updateDeliveryStatus(req: Request, res: Response)
  
  // Obtener estadísticas de delivery
  static async getDeliveryStats(req: Request, res: Response)
  
  // Tracking público
  static async getDeliveryTracking(req: Request, res: Response)
  
  // Obtener riders disponibles
  static async getAvailableRiders(req: Request, res: Response)
}
```

#### RiderController (`backend/src/controllers/RiderController.ts`)
```typescript
export class RiderController {
  // Crear un nuevo rider
  static async createRider(req: Request, res: Response)
  
  // Obtener riders
  static async getRiders(req: Request, res: Response)
  
  // Actualizar estado del rider
  static async updateRiderStatus(req: Request, res: Response)
  
  // Actualizar disponibilidad del rider
  static async updateRiderAvailability(req: Request, res: Response)
  
  // Obtener estadísticas del rider
  static async getRiderStats(req: Request, res: Response)
}
```

## Funcionalidades del Rol de Delivery

### 1. Dashboard de Delivery (`src/pages/DeliveryDashboard.tsx`)

**Funcionalidades principales:**
- Visualización de órdenes asignadas para entrega
- Estadísticas de rendimiento personal
- Control de disponibilidad (automático/manual)
- Vista de calificaciones recibidas
- Acceso rápido a funcionalidades principales

**Características:**
- Filtros por estado, tipo de rider, fechas
- Búsqueda de deliveries
- Actualización en tiempo real
- Vista de estadísticas detalladas

### 2. Gestión de Órdenes (`src/pages/DeliveryOrders.tsx`)

**Funcionalidades:**
- Ver órdenes asignadas
- Actualizar estado de entregas
- Ver detalles de cliente y ubicación
- Marcar como recogido/en tránsito/entregado
- Reportar problemas de entrega

### 3. Mapa de Rutas (`src/pages/DeliveryMap.tsx`)

**Funcionalidades:**
- Visualización de rutas de entrega
- Ubicación en tiempo real
- Optimización de rutas
- Tracking de entregas activas

### 4. Reporte de Entregas (`src/pages/DeliveryReport.tsx`)

**Funcionalidades:**
- Reportar estado de entregas
- Subir fotos de entrega
- Registrar incidencias
- Confirmar entregas exitosas

### 5. Calificaciones (`src/pages/DeliveryRatings.tsx`)

**Funcionalidades:**
- Ver calificaciones recibidas
- Historial de reseñas
- Estadísticas de satisfacción
- Mejoras sugeridas

### 6. Horario de Trabajo (`src/pages/DeliverySchedule.tsx`)

**Funcionalidades:**
- Configurar horario de trabajo
- Definir días disponibles
- Establecer zonas de servicio
- Configurar notificaciones

### 7. Estado de Disponibilidad (`src/pages/DeliveryStatus.tsx`)

**Funcionalidades:**
- Cambiar estado de disponibilidad
- Configurar modo automático/manual
- Establecer ubicación actual
- Control de notificaciones

### 8. Perfil de Delivery (`src/pages/DeliveryProfile.tsx`)

**Funcionalidades:**
- Configuración del perfil
- Gestión de información del vehículo
- Configuración de pagos
- Documentos y verificaciones

## Rutas API del Sistema

### Rutas de Delivery (`backend/src/routes/deliveryRoutes.ts`)

```typescript
// Rutas públicas (para tracking)
GET /api/delivery/tracking/:trackingCode

// Rutas protegidas
GET /api/delivery/available-riders

// Rutas para gestores de tienda y admin
POST /api/delivery
GET /api/delivery
GET /api/delivery/stats
GET /api/delivery/:id
PUT /api/delivery/:id/status
```

### Rutas de Riders (`backend/src/routes/riderRoutes.ts`)

```typescript
// Gestión de riders
POST /api/riders
GET /api/riders
GET /api/riders/:id
PUT /api/riders/:id
DELETE /api/riders/:id

// Estado y disponibilidad
PUT /api/riders/:id/status
PUT /api/riders/:id/availability
GET /api/riders/:id/stats

// Zonas de servicio
POST /api/riders/:id/service-areas
PUT /api/riders/:id/service-areas
DELETE /api/riders/:id/service-areas/:areaId
```

### Rutas de Órdenes para Delivery (`backend/src/routes/orderRoutes.ts`)

```typescript
// Rutas específicas para delivery
GET /api/orders/delivery
GET /api/orders/delivery/:orderId
PUT /api/orders/delivery/:orderId
```

## Middleware de Autorización

### DeliveryMiddleware (`backend/src/middleware/authMiddleware.ts`)
```typescript
export const deliveryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (user.role !== 'delivery') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo personal de delivery puede acceder a esta funcionalidad'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
```

## Sistema de Asignación Inteligente

### Lógica de Asignación

1. **Priorización por tipo:**
   - `internal_first`: Prioriza riders internos
   - `external_first`: Prioriza riders externos
   - `mixed`: Distribución equilibrada

2. **Criterios de selección:**
   - Distancia desde la ubicación actual
   - Disponibilidad del rider
   - Calificación promedio
   - Historial de entregas a tiempo
   - Límite de órdenes concurrentes
   - Zona de servicio

3. **Algoritmo de scoring:**
   ```typescript
   score = (distance * 0.3) + (rating * 0.25) + (availability * 0.2) + (cost * 0.15) + (type * 0.1)
   ```

### Configuración de Asignación

```typescript
interface AssignmentConfig {
  priority: 'internal_first' | 'external_first' | 'mixed';
  internalPercentage: number; // 0-100
  maxWaitTime: number; // minutos
  maxDistance: number; // km
}
```

## Estados del Delivery

### Flujo de Estados
1. **pending**: Delivery creado, esperando asignación
2. **assigned**: Asignado a un rider
3. **accepted**: Rider aceptó la entrega
4. **picked_up**: Producto recogido de la tienda
5. **in_transit**: En camino al cliente
6. **delivered**: Entregado exitosamente
7. **cancelled**: Cancelado
8. **failed**: Falló la entrega

### Transiciones de Estado
```typescript
const stateTransitions = {
  pending: ['assigned', 'cancelled'],
  assigned: ['accepted', 'cancelled'],
  accepted: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'failed'],
  delivered: [], // Estado final
  cancelled: [], // Estado final
  failed: [] // Estado final
};
```

## Sistema de Tracking

### Código de Tracking
- Generación automática de códigos únicos
- URL de tracking pública
- Actualizaciones en tiempo real
- Notificaciones automáticas

### Notificaciones
```typescript
notifications: {
  customerSmsSent: boolean;
  customerEmailSent: boolean;
  riderSmsSent: boolean;
  riderWhatsappSent: boolean;
}
```

## Configuración de Pagos

### Estructura de Comisiones
```typescript
// Costos del delivery
deliveryFee: number;        // Tarifa total
riderPayment: number;       // Pago al rider (80% por defecto)
platformFee: number;        // Comisión de la plataforma (20% por defecto)
```

### Métodos de Pago para Riders
- **Efectivo**: Pago directo
- **Transferencia bancaria**: Depósito a cuenta
- **Pago móvil**: Plataformas digitales

## Seguridad y Verificación

### Documentos Requeridos
- Cédula de identidad (frente y reverso)
- Licencia de conducir (si aplica)
- Registro del vehículo
- Seguro del vehículo
- Verificación de antecedentes

### Estados de Verificación
- `pending_verification`: Pendiente de verificación
- `active`: Verificado y activo
- `inactive`: Inactivo temporalmente
- `suspended`: Suspendido por incumplimientos

## Integración con Otros Sistemas

### Con Sistema de Órdenes
- Creación automática de delivery al completar orden
- Sincronización de estados
- Actualización de inventario

### Con Sistema de Tiendas
- Configuración de delivery por tienda
- Gestión de zonas de cobertura
- Configuración de tarifas

### Con Sistema de Clientes
- Notificaciones de estado
- Calificaciones y reseñas
- Tracking en tiempo real

## Métricas y Analytics

### KPIs del Sistema
- Tiempo promedio de entrega
- Tasa de entregas a tiempo
- Satisfacción del cliente
- Eficiencia del rider
- Costos operativos

### Reportes Disponibles
- Reporte de rendimiento por rider
- Análisis de rutas optimizadas
- Estadísticas de satisfacción
- Análisis de costos por zona

## Configuración del Frontend

### Rutas Protegidas
```typescript
// Componente DeliveryRoute
const DeliveryRoute: React.FC<DeliveryRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('delivery')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### Menú de Navegación
```typescript
const deliveryMenuItems = [
  { title: 'Dashboard', path: '/delivery/dashboard', icon: Home },
  { title: 'Órdenes Asignadas', path: '/delivery/orders', icon: ShoppingBag },
  { title: 'Mapa de Rutas', path: '/delivery/map', icon: MapPin },
  { title: 'Reporte de Entregas', path: '/delivery/report', icon: FileText },
  { title: 'Calificaciones', path: '/delivery/ratings', icon: Star },
  { title: 'Horario de Trabajo', path: '/delivery/schedule', icon: Clock },
  { title: 'Estado de Disponibilidad', path: '/delivery/status', icon: Bell },
  { title: 'Perfil', path: '/delivery/profile', icon: User }
];
```

## Estado Actual de Implementación

### ✅ Completado
- Modelos de datos (Delivery y Rider)
- Servicios de asignación
- Controladores principales
- Middleware de autorización
- Rutas API básicas
- Dashboard principal
- Sistema de roles

### 🚧 En Desarrollo
- Páginas específicas del delivery
- Integración con mapas
- Sistema de notificaciones push
- Optimización de rutas
- Reportes avanzados

### 📋 Pendiente
- Implementación completa de páginas
- Integración con servicios de mapas
- Sistema de pagos automáticos
- App móvil para riders
- Analytics avanzados

## Próximos Pasos

1. **Completar páginas del delivery:**
   - Implementar funcionalidad completa en DeliveryOrders
   - Integrar mapas en DeliveryMap
   - Desarrollar sistema de reportes

2. **Mejorar sistema de asignación:**
   - Implementar algoritmos de optimización de rutas
   - Añadir machine learning para predicciones
   - Mejorar sistema de scoring

3. **Integración con servicios externos:**
   - Google Maps para navegación
   - Servicios de SMS/WhatsApp
   - Sistemas de pagos móviles

4. **Desarrollo de app móvil:**
   - App nativa para riders
   - Tracking GPS en tiempo real
   - Notificaciones push

## Conclusión

El sistema de delivery de PiezasYA representa una solución completa y escalable para la gestión de entregas de repuestos automotrices. Con su arquitectura mixta de riders internos y externos, sistema de asignación inteligente y tracking en tiempo real, proporciona una base sólida para el crecimiento del negocio.

La implementación actual cubre los aspectos fundamentales del sistema, mientras que las funcionalidades en desarrollo y pendientes permitirán una experiencia de usuario más rica y eficiente para todos los actores involucrados en el proceso de delivery.
