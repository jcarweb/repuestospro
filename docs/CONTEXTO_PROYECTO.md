# Contexto del Proyecto - Ecommerce de Repuestos

## Directriz: Contexto General del Sistema

Este es un proyecto de ecommerce multiplataforma para la venta de repuestos de vehículos desarrollado con las siguientes tecnologías:

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: MongoDB
- **Autenticación**: JWT + Passport.js
- **Iconos**: Lucide React
- **Rutas**: React Router DOM

### Estructura del Proyecto
```
repuestospro/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── contexts/          # Contextos de React (Auth, Cart, Favorites)
│   ├── hooks/             # Hooks personalizados
│   └── data/              # Datos estáticos
├── backend/               # Servidor Express
│   ├── src/
│   │   ├── controllers/   # Controladores de la API
│   │   ├── models/        # Modelos de MongoDB
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middlewares
│   │   ├── services/      # Servicios de negocio
│   │   └── config/        # Configuraciones
│   └── scripts/           # Scripts de utilidad
└── docs/                  # Documentación del proyecto
```

## Directriz: Sistema de Roles y Permisos

El sistema implementa un modelo de roles granular con 4 roles principales, cada uno con funcionalidades específicas y permisos bien definidos:

### 1. Rol Administrador (admin)

**Descripción**: Usuario con acceso completo al sistema y capacidad de gestión global.

**Funcionalidades Principales**:
- **Gestión de Usuarios**: Crear, modificar, eliminar y gestionar todos los usuarios del sistema
- **Gestión de Productos**: Subir lotes de productos, modificarlos, eliminarlos, crearlos y cargarlos de forma individual
- **Gestión de Categorías**: Crear, modificar y eliminar categorías, subcategorías y atributos
- **Gestión de Promociones**: Crear y gestionar promociones globales del sistema
- **Configuración del Sistema**: 
  - Configurar currency (moneda)
  - Configurar impuestos
  - Configurar tasas de delivery
  - Configurar comisiones por uso del aplicativo a terceros (tiendas)
- **Reportes y Analytics**:
  - Generar reportes de ventas
  - Acceder a estadísticas de Google Analytics
  - Monitorear métricas del sistema
- **Sistema de Códigos**: Crear códigos de registro para otros roles
- **Gestión de Lealtad**: Configurar sistema de puntos, premios y recompensas
- **Creación de Usuarios**: Puede crear otros usuarios Administradores, Delivery y Gestores de tienda

**Campos Específicos en Base de Datos**:
```typescript
adminPermissions: {
  userManagement: boolean;      // Gestión de usuarios
  systemConfiguration: boolean; // Configuración del sistema
  analyticsAccess: boolean;     // Acceso a analytics
  codeGeneration: boolean;      // Generación de códigos
  globalSettings: boolean;      // Configuraciones globales
}
```

### 2. Rol Cliente (client)

**Descripción**: Usuario final que realiza compras en la aplicación. Es el rol por defecto para nuevos registros.

**Funcionalidades Principales**:
- **Exploración de Productos**: Navegar por el catálogo completo de repuestos
- **Compras**: Realizar compras seguras con pasarelas de pago activas
- **Gestión de Perfil**: 
  - Modificar información personal
  - Cambiar contraseña
  - Activar doble factor de autenticación con Google Authenticator
  - Configurar PIN para inicio de sesión
  - Configurar huella dactilar
- **Configuración de Notificaciones**:
  - Recibir ofertas y notificaciones vía web
  - Configurar preferencias de marketing
- **Sistema de Fidelización**:
  - Ganar puntos por calificaciones y compras
  - Canjear puntos por cupones o premios
  - Ver historial de puntos y recompensas
- **Calificaciones y Reseñas**:
  - Calificar la aplicación
  - Calificar compras
  - Calificar delivery
  - Calificar entrega de productos
  - Calificar tiendas
- **Gestión de Compras**:
  - Carrito de compras
  - Lista de favoritos
  - Historial de pedidos
  - Seguimiento de entregas

**Campos Específicos en Base de Datos**:
```typescript
// Sistema de fidelización
points: number;                                    // Puntos acumulados
referralCode: string;                              // Código de referido
totalPurchases: number;                            // Total de compras
totalSpent: number;                                // Total gastado
loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';

// Configuraciones de notificaciones
notificationsEnabled: boolean;                     // Notificaciones generales
emailNotifications: boolean;                       // Notificaciones por email
pushNotifications: boolean;                        // Notificaciones push
marketingEmails: boolean;                          // Emails de marketing
```

### 3. Rol Delivery (delivery)

**Descripción**: Personal responsable de la entrega de repuestos a los clientes.

**Funcionalidades Principales**:
- **Gestión de Perfil**: Todas las funcionalidades de configuración de perfil de usuario
- **Órdenes Asignadas**: Ver órdenes asignadas para entrega
- **Calificaciones**: Ver calificaciones recibidas (válidas para canje de premios)
- **Reporte de Entrega**: Módulo para reportar el estado de entregas
- **Mapa de Rutas**: Acceso al mapa con ruta para hacer la entrega del repuesto
- **Control de Disponibilidad**:
  - Botón para indicar disponibilidad al administrador y gestor de tienda
  - Opción automática: se coloca en "ocupado" al aceptar entrega y "disponible" al completarla
  - Opción manual: activar/desactivar al comenzar/terminar jornada laboral
- **Estados de Delivery**:
  - No disponible
  - Disponible
  - Ocupado
  - En Ruta
  - En retorno a la tienda
- **Gestión de Vehículo**: Información del vehículo de entrega
- **Horario de Trabajo**: Configuración de horarios laborales

**Campos Específicos en Base de Datos**:
```typescript
deliveryStatus: 'available' | 'unavailable' | 'busy' | 'on_route' | 'returning_to_store';
autoStatusMode: boolean;                           // true = automático, false = manual
currentOrder?: string;                             // Orden actual asignada
deliveryZone: {
  center: [number, number];                        // Centro de zona de entrega
  radius: number;                                  // Radio en kilómetros
};
vehicleInfo: {
  type: string;                                    // Tipo de vehículo
  model: string;                                   // Modelo
  plate: string;                                   // Placa
};
workSchedule: {
  startTime: string;                               // Hora de inicio (HH:mm)
  endTime: string;                                 // Hora de fin (HH:mm)
  daysOfWeek: number[];                            // Días de trabajo (0-6)
};
```

### 4. Rol Gestor de Tienda (store_manager)

**Descripción**: Usuario responsable de gestionar una tienda específica, similar al modelo de Mercado Libre.

**Funcionalidades Principales**:
- **Gestión de Productos**:
  - Subir lotes de productos
  - Modificar productos
  - Eliminar productos
  - Crear productos
  - Cargar productos de forma individual
  - Control absoluto de productos simples, variables y variaciones
- **Gestión de Promociones**: Cargar y crear promociones para su tienda
- **Configuración de Tienda**:
  - Configurar cupones de descuento
  - Asignar cupones a todos o solo algunos productos
  - Configurar parámetros respetando directrices del administrador
- **Analytics**: Acceso a estadísticas de Google Analytics de su tienda
- **Exportación**: Exportar productos de su tienda
- **Reportes**: Generar reportes de ventas y pagos
- **Gestión de Órdenes**:
  - Verificar estatus de órdenes
  - Asignar delivery
  - Reasignar delivery en caso de cambio
- **Gestión de Reseñas**:
  - Ver valoraciones y comentarios de sus productos
  - Desactivar reseñas de forma global o individual
- **Mensajería**: Manejo de mensajería privada cliente-tienda
- **Gestión de Atributos**: Crear atributos específicos para su tienda

**Campos Específicos en Base de Datos**:
```typescript
storeInfo: {
  name: string;                                    // Nombre de la tienda
  address: string;                                 // Dirección
  phone: string;                                   // Teléfono
  email: string;                                   // Email
  description?: string;                            // Descripción
  logo?: string;                                   // Logo de la tienda
  banner?: string;                                 // Banner de la tienda
  businessHours: {                                 // Horarios de atención
    [key: string]: {
      open: string;                                // Hora de apertura
      close: string;                               // Hora de cierre
      closed: boolean;                             // Cerrado
    };
  };
  deliverySettings: {                              // Configuración de delivery
    enabled: boolean;                              // Delivery habilitado
    freeDeliveryThreshold: number;                 // Umbral para delivery gratis
    deliveryFee: number;                           // Costo de delivery
    maxDeliveryDistance: number;                   // Distancia máxima
  };
  paymentSettings: {                               // Métodos de pago
    cash: boolean;                                 // Efectivo
    card: boolean;                                 // Tarjeta
    transfer: boolean;                             // Transferencia
    digitalWallet: boolean;                        // Billetera digital
  };
};
commissionRate: number;                            // Porcentaje de comisión
taxRate: number;                                   // Porcentaje de impuestos
```

### Implementación Técnica del Sistema de Roles

#### Middlewares de Autorización
```typescript
// Middlewares específicos por rol
adminMiddleware: Solo administradores
clientMiddleware: Solo clientes
deliveryMiddleware: Solo personal de delivery
storeManagerMiddleware: Solo gestores de tienda

// Middlewares combinados
adminOrStoreManagerMiddleware: Admin o gestor de tienda
adminOrDeliveryMiddleware: Admin o delivery
staffMiddleware: Cualquier usuario excepto clientes
```

#### Componentes de Ruta Protegida
```typescript
AdminRoute: Protege rutas de administrador
ClientRoute: Protege rutas de cliente
DeliveryRoute: Protege rutas de delivery
StoreManagerRoute: Protege rutas de gestor de tienda
```

#### Navegación Dinámica
- Sidebar que muestra menús específicos según el rol
- Rutas organizadas por funcionalidad de cada rol
- Acceso contextual a funcionalidades según permisos

### Funcionalidades Principales

#### Frontend
- **Autenticación**: Login, registro, verificación de email
- **Catálogo**: Productos organizados por categorías y subcategorías
- **Carrito de Compras**: Gestión de productos en carrito
- **Favoritos**: Lista de productos favoritos
- **Perfil de Usuario**: Gestión de información personal
- **Búsqueda Avanzada**: Filtros por marca, categoría, precio
- **Panel de Administración**: Gestión completa del sistema

#### Backend
- **API RESTful**: Endpoints para todas las funcionalidades
- **Autenticación JWT**: Sistema seguro de autenticación
- **Gestión de Productos**: CRUD completo de productos
- **Sistema de Categorías**: Jerarquía de categorías y subcategorías
- **Sistema de Marcas**: Gestión de marcas de vehículos
- **Promociones**: Sistema de descuentos y ofertas
- **Analytics**: Seguimiento de métricas y Google Analytics
- **Sistema de Lealtad**: Puntos y recompensas
- **Códigos de Registro**: Sistema de invitaciones

### Estado Actual del Desarrollo

El proyecto está en desarrollo activo con las siguientes características implementadas:

1. **Sistema de Autenticación**: Completo con JWT y verificación de email
2. **Sistema de Roles**: Implementado con los 4 roles principales y sus funcionalidades específicas
3. **Gestión de Productos**: CRUD completo con imágenes y metadatos
4. **Sistema de Categorías**: Jerarquía completa implementada
5. **Panel de Administración**: Dashboard con todas las funcionalidades
6. **Sistema de Búsqueda**: Búsqueda avanzada con filtros
7. **Carrito y Favoritos**: Funcionalidades básicas implementadas
8. **Sistema de Promociones**: Gestión de descuentos y ofertas
9. **Analytics**: Integración con Google Analytics
10. **Sistema de Lealtad**: Puntos y recompensas
11. **Códigos de Registro**: Sistema de invitaciones
12. **Middlewares de Autorización**: Sistema completo de permisos por rol

### Archivos de Configuración Importantes

- `package.json`: Dependencias y scripts del frontend
- `backend/package.json`: Dependencias y scripts del backend
- `vite.config.ts`: Configuración de Vite
- `tailwind.config.js`: Configuración de Tailwind CSS
- `tsconfig.json`: Configuración de TypeScript
- `.gitignore`: Archivos excluidos del control de versiones

### Scripts de Desarrollo

- `npm run dev`: Ejecuta frontend y backend simultáneamente
- `npm run dev:frontend`: Solo frontend en puerto 3000
- `npm run dev:backend`: Solo backend
- `npm run build`: Construye frontend y backend
- `npm run install:all`: Instala dependencias de frontend y backend

### Base de Datos

El proyecto utiliza MongoDB con las siguientes colecciones principales:
- Users: Información de usuarios con roles y campos específicos
- Products: Catálogo de productos
- Categories: Categorías de productos
- Subcategories: Subcategorías
- Brands: Marcas de vehículos
- Promotions: Promociones y descuentos
- Reviews: Reseñas de productos
- Orders: Pedidos (en desarrollo)
- Analytics: Métricas y estadísticas

### Configuración de Entorno

El proyecto requiere las siguientes variables de entorno:
- `MONGODB_URI`: Conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `GOOGLE_CLIENT_ID`: ID de cliente de Google OAuth
- `GOOGLE_CLIENT_SECRET`: Secreto de cliente de Google OAuth
- `EMAIL_HOST`: Servidor de email
- `EMAIL_PORT`: Puerto del servidor de email
- `EMAIL_USER`: Usuario de email
- `EMAIL_PASS`: Contraseña de email
- `FRONTEND_URL`: URL del frontend

---

## Recapitulemos: Estado de Desarrollo Actual

El proyecto es un ecommerce completo de repuestos de vehículos con frontend en React/TypeScript y backend en Node.js/Express. Tiene implementado un sistema robusto de autenticación con 4 roles principales (Administrador, Cliente, Delivery, Gestor de Tienda), cada uno con funcionalidades específicas y permisos bien definidos. Incluye gestión de productos, categorías, panel de administración, sistema de búsqueda, carrito de compras, favoritos, promociones, analytics y sistema de lealtad. La aplicación está estructurada de manera modular y escalable, con separación clara entre frontend y backend. El sistema de autenticación incluye JWT, verificación de email y integración con Google OAuth. El panel de administración permite la gestión completa del catálogo, usuarios, promociones y métricas del sistema. El sistema de roles implementa un modelo granular que permite una gestión eficiente de permisos y funcionalidades específicas para cada tipo de usuario. 