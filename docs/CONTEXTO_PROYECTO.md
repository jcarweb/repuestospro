# Contexto del Proyecto - PiezasYA

## Descripción General

PiezasYA es una plataforma de ecommerce especializada en la venta de repuestos de vehículos, diseñada para conectar a clientes con tiendas especializadas y facilitar la búsqueda, compra y entrega de repuestos automotrices. El nombre "PiezasYA" refleja la rapidez y eficiencia del servicio: "El repuesto que buscas, al instante".

## Paleta de Colores Corporativa

La aplicación utiliza una paleta de colores específica que refleja los valores de la marca:

| Color               | Hex       | Significado                          |
| ------------------- | --------- | ------------------------------------ |
| **Amarillo Racing** | `#FFC300` | Rapidez, energía, atención inmediata |
| **Gris Carbón**     | `#333333` | Profesionalismo, confianza           |
| **Negro Onix**      | `#000000` | Solidez, elegancia                   |
| **Rojo Alerta**     | `#E63946` | Urgencia, acción, dinamismo          |
| **Blanco Nieve**    | `#FFFFFF` | Limpieza, modernidad                 |

## Estructura del Proyecto

### Frontend (React + TypeScript)
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API (AuthContext, CartContext, FavoritesContext)
- **Icons**: Lucide React
- **HTTP Client**: Fetch API nativo

### Backend (Node.js + Express)
- **Runtime**: Node.js con TypeScript
- **Framework**: Express.js
- **Database**: MongoDB con Mongoose
- **Authentication**: JWT + Passport.js
- **Email**: Nodemailer
- **Password Hashing**: bcrypt
- **Validation**: Express Validator

## Directriz: Sistema de Roles y Permisos

### 1. Administrador
**Funcionalidades principales:**
- Acceso completo a toda la aplicación
- Gestión de productos (carga masiva, modificaciones, eliminaciones, carga individual)
- Creación y gestión de promociones
- Configuración de currency, impuestos, tasas de delivery y comisión
- Reportes de ventas y estadísticas de Google Analytics
- Creación de categorías, atributos y menús
- Creación de otros usuarios (Administradores, Delivery, Gestores de Tienda)
- Gestión completa del sistema

**Campos específicos en base de datos:**
```typescript
adminPermissions: {
  userManagement: boolean;
  systemConfiguration: boolean;
  analyticsAccess: boolean;
  codeGeneration: boolean;
  globalSettings: boolean;
}
```

### 2. Cliente
**Funcionalidades principales:**
- Registro por defecto desde app móvil o web
- Realización de compras autorizadas
- Modificación de perfil y cambio de contraseña
- Activación de doble factor de autenticación con Google Authenticator
- Uso de PIN para inicio de sesión
- Configuración de notificaciones y ofertas
- Uso de pasarelas de pago
- Calificación de app, compras, delivery y tiendas
- Acumulación de puntos de fidelización
- Canje de puntos por cupones o premios

**Campos específicos en base de datos:**
```typescript
notificationsEnabled: boolean;
emailNotifications: boolean;
pushNotifications: boolean;
marketingEmails: boolean;
points: number;
totalPurchases: number;
totalSpent: number;
loyaltyLevel: string;
```

### 3. Delivery
**Funcionalidades principales:**
- Configuración de perfil de usuario
- Visualización de órdenes asignadas
- Visualización de calificaciones (canjeables por premios)
- Módulo de reporte de entregas
- Acceso a mapa con rutas de entrega
- Control de disponibilidad (automático/manual)
- Estados: "No disponible", "Disponible", "Ocupado", "En Ruta", "En retorno a la tienda"

**Campos específicos en base de datos:**
```typescript
deliveryStatus: string;
autoStatusMode: boolean;
currentOrder: ObjectId;
deliveryZone: {
  center: { lat: number; lng: number };
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
  days: string[];
};
```

### 4. Gestor de Tienda
**Funcionalidades principales:**
- Gestión completa de productos (similar a Mercado Libre)
- Creación y gestión de promociones
- Acceso a Google Analytics
- Exportación de productos
- Reportes de ventas y pagos
- Verificación de estado de órdenes
- Asignación y reasignación de delivery
- Configuración de cupones de descuento
- Control absoluto de productos (simples, variables, variaciones)
- Creación de atributos
- Gestión de valoraciones y comentarios
- Mensajería privada cliente-tienda

**Campos específicos en base de datos:**
```typescript
storeInfo: {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logo: string;
  banner: string;
  businessHours: object;
  deliverySettings: object;
  paymentSettings: object;
};
commissionRate: number;
taxRate: number;
```

## Directriz: Sistema de Autenticación Modal con Verificación de Ubicación

### Características Implementadas

#### 1. Modal de Login Unificado
- **Interfaz**: Modal responsive con múltiples métodos de autenticación
- **Estados**: Login, Registro, Recuperación de contraseña, Login con PIN
- **Validación**: Verificación de ubicación obligatoria antes de cualquier autenticación

#### 2. Métodos de Autenticación Soportados

**a) Autenticación por Email y Contraseña**
- Formulario tradicional con validación
- Integración con sistema de roles
- Verificación de ubicación previa

**b) Autenticación con Google OAuth**
- Integración con Google OAuth 2.0
- Redirección segura con verificación de ubicación
- Manejo de tokens y sesiones

**c) Autenticación con PIN**
- PIN de 4-6 dígitos numéricos
- Configuración opcional en perfil de usuario
- Validación de ubicación antes del login

**d) Autenticación Biométrica (Huella Dactilar)**
- Soporte para WebAuthn API
- Compatible con dispositivos móviles Android/iOS
- Verificación de disponibilidad de hardware
- Almacenamiento seguro de credenciales

#### 3. Verificación de Ubicación GPS Obligatoria

**Características:**
- **Modal de Permisos**: Solicitud obligatoria de ubicación antes del login
- **Validación**: Sin ubicación no se permite acceso a la aplicación
- **Persistencia**: Almacenamiento local de ubicación para sesiones futuras
- **Precisión**: Configuración de alta precisión para mejor experiencia

**Flujo de Verificación:**
1. Usuario intenta acceder a la aplicación
2. Se muestra modal de solicitud de ubicación
3. Usuario debe permitir acceso a GPS
4. Se obtiene y valida ubicación
5. Solo entonces se permite proceder con autenticación

**Mensajes de Error:**
- Navegador no soporta geolocalización
- Permiso denegado por el usuario
- Error de obtención de ubicación
- Tiempo de espera agotado

#### 4. Configuración de Métodos de Autenticación

**a) Configuración de PIN**
- Modal dedicado para configuración
- Validación de seguridad (4-6 dígitos)
- Confirmación de PIN
- Recomendaciones de seguridad

**b) Configuración de Huella Dactilar**
- Verificación de compatibilidad del dispositivo
- Registro de credenciales biométricas
- Instrucciones paso a paso
- Manejo de errores específicos

#### 5. Seguridad y Validaciones

**Medidas de Seguridad:**
- Verificación de ubicación obligatoria
- Validación de métodos de autenticación
- Manejo seguro de tokens
- Encriptación de datos sensibles
- Timeouts de sesión

**Validaciones Implementadas:**
- Formato de email válido
- Contraseña con requisitos mínimos
- PIN numérico de longitud correcta
- Ubicación dentro de rangos válidos
- Compatibilidad de dispositivo para biométricos

## Implementación Técnica del Sistema de Roles

### Middlewares de Autorización
```typescript
// Middlewares específicos por rol
clientMiddleware: Verifica rol 'client'
deliveryMiddleware: Verifica rol 'delivery'
storeManagerMiddleware: Verifica rol 'store_manager'
adminMiddleware: Verifica rol 'admin'

// Middlewares combinados
adminOrStoreManagerMiddleware: Permite 'admin' o 'store_manager'
adminOrDeliveryMiddleware: Permite 'admin' o 'delivery'
staffMiddleware: Permite cualquier rol excepto 'client'
```

### Rutas Protegidas
- **Admin**: `/admin/*` - Panel de administración completo
- **Store Manager**: `/store-manager/*` - Gestión de tienda
- **Delivery**: `/delivery/*` - Gestión de entregas
- **Client**: `/cart`, `/profile`, `/orders` - Funcionalidades de cliente

### Navegación Dinámica
- Sidebar adaptativo según rol del usuario
- Menús específicos para cada tipo de usuario
- Acceso condicional a funcionalidades

## Estado Actual del Desarrollo

### ✅ Completado
1. **Sistema de Roles**: Implementación completa de 4 roles con permisos específicos
2. **Autenticación Modal**: Sistema unificado con múltiples métodos
3. **Verificación de Ubicación**: Obligatoria antes del login
4. **Middlewares de Autorización**: Protección de rutas por rol
5. **Navegación Dinámica**: Sidebar adaptativo según rol
6. **Configuración de PIN**: Sistema completo de configuración
7. **Configuración Biométrica**: Soporte para huella dactilar
8. **Integración Google OAuth**: Autenticación con Google
9. **Dashboard por Rol**: Interfaces específicas para cada tipo de usuario
10. **Sistema de Email**: Notificaciones y verificación

### 🔄 En Desarrollo
1. **Páginas Específicas**: Algunas páginas de delivery y store manager
2. **Funcionalidades Avanzadas**: Mensajería, reportes detallados
3. **Integración de Pagos**: Pasarelas de pago
4. **Sistema de Notificaciones**: Push notifications

### 📋 Pendiente
1. **Testing**: Pruebas unitarias y de integración
2. **Optimización**: Performance y SEO
3. **Documentación**: API documentation
4. **Deployment**: Configuración de producción

## Base de Datos

### Modelos Principales
- **Users**: Información de usuarios con roles y campos específicos
- **Products**: Catálogo de repuestos con variaciones
- **Categories**: Categorización de productos
- **Orders**: Pedidos y estados de entrega
- **Promotions**: Sistema de promociones y descuentos
- **RegistrationCodes**: Códigos de registro para roles específicos

### Índices y Optimización
- Índices en campos de búsqueda frecuente
- Optimización de consultas por rol
- Indexación geográfica para ubicaciones

## Configuración de Entorno

### Variables de Entorno Requeridas
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/PiezasYA

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@PiezasYA.com
EMAIL_PASS=your-email-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API URLs
VITE_API_URL=http://localhost:5000/api
```

## Estructura de Archivos

```
PiezasYA/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── contexts/          # Context API providers
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript type definitions
├── backend/               # Backend Node.js
│   ├── src/
│   │   ├── controllers/   # Controladores de API
│   │   ├── models/        # Modelos de MongoDB
│   │   ├── routes/        # Rutas de API
│   │   ├── middleware/    # Middlewares de Express
│   │   └── services/      # Lógica de negocio
│   └── scripts/           # Scripts de utilidad
└── docs/                  # Documentación del proyecto
```

## Recapitulemos: Estado de Desarrollo Actual

El proyecto es un ecommerce completo de repuestos de vehículos con frontend en React/TypeScript y backend en Node.js/Express. Tiene implementado un sistema robusto de autenticación con 4 roles principales (Administrador, Cliente, Delivery, Gestor de Tienda), cada uno con funcionalidades específicas y permisos bien definidos. 

**Características destacadas del sistema de autenticación:**
- **Modal unificado** con múltiples métodos de autenticación (email/contraseña, Google OAuth, PIN, huella dactilar)
- **Verificación de ubicación GPS obligatoria** antes de cualquier autenticación
- **Configuración de métodos de autenticación** (PIN y huella dactilar) con validaciones de seguridad
- **Sistema de roles granular** con middlewares de autorización específicos
- **Navegación dinámica** adaptada al rol del usuario

La aplicación incluye gestión de productos, categorías, panel de administración, sistema de búsqueda, carrito de compras, favoritos, promociones, analytics y sistema de lealtad. Está estructurada de manera modular y escalable, con separación clara entre frontend y backend. El sistema de autenticación incluye JWT, verificación de email y integración con Google OAuth. El panel de administración permite la gestión completa del catálogo, usuarios, promociones y métricas del sistema. 

El sistema de roles implementa un modelo granular que permite una gestión eficiente de permisos y funcionalidades específicas para cada tipo de usuario, mientras que el sistema de autenticación modal con verificación de ubicación garantiza la seguridad y la experiencia de usuario optimizada según los requisitos específicos del negocio. 