# 🏦 Sistema de Monetización - Acceso a Promociones

## 📋 Descripción General

Se ha implementado un sistema completo de monetización que restringe el acceso a las promociones según el plan de suscripción de cada tienda. Este sistema asegura que solo las tiendas con planes Pro o Elite puedan crear y gestionar promociones.

## 🎯 Características Implementadas

### 1. **Modelo de Store Actualizado**
- ✅ Campo `subscription` - Referencia al plan de suscripción
- ✅ Campo `subscriptionStatus` - Estado de la suscripción (active, inactive, expired, pending)
- ✅ Campo `subscriptionExpiresAt` - Fecha de expiración

### 2. **Servicio de Validación de Suscripción**
- ✅ `SubscriptionService.hasPromotionsAccess()` - Verifica acceso a promociones
- ✅ `SubscriptionService.hasPremiumAccess()` - Verifica acceso a funcionalidades premium
- ✅ `SubscriptionService.getCurrentPlan()` - Obtiene plan actual
- ✅ `SubscriptionService.updateSubscription()` - Actualiza suscripción
- ✅ `SubscriptionService.checkPlanLimits()` - Verifica límites del plan
- ✅ `SubscriptionService.getUpgradeInfo()` - Información de upgrade

### 3. **Controlador de Promociones Actualizado**
- ✅ Validación de suscripción antes de crear promociones
- ✅ Endpoint `/api/promotions/check-access` para verificar acceso
- ✅ Respuestas con información de upgrade cuando no hay acceso

### 4. **Frontend - Validación de Acceso**
- ✅ Página de promociones con verificación de acceso
- ✅ Mensaje de restricción para planes básicos
- ✅ Botón de upgrade que redirige a monetización
- ✅ Componente `SubscriptionStatus` para mostrar estado

## 🏗️ Arquitectura del Sistema

### Backend

#### Modelo Store Actualizado
```typescript
// Nuevos campos agregados
subscription?: mongoose.Types.ObjectId; // Plan de suscripción actual
subscriptionStatus: 'active' | 'inactive' | 'expired' | 'pending';
subscriptionExpiresAt?: Date; // Fecha de expiración
```

#### Servicio de Validación
```typescript
// backend/src/services/subscriptionService.ts
export class SubscriptionService {
  static async hasPromotionsAccess(storeId: string): Promise<{
    hasAccess: boolean;
    reason?: string;
    subscription?: any;
  }>
}
```

#### Controlador Actualizado
```typescript
// backend/src/controllers/promotionController.ts
static async createPromotion(req: Request, res: Response): Promise<void> {
  // Verificar acceso a promociones antes de crear
  const accessCheck = await SubscriptionService.hasPromotionsAccess(storeId);
  if (!accessCheck.hasAccess) {
    return res.status(403).json({
      success: false,
      message: accessCheck.reason,
      requiresUpgrade: true
    });
  }
}
```

### Frontend

#### Página de Promociones
```typescript
// src/pages/StoreManagerPromotions.tsx
// Verificación de acceso al cargar la página
useEffect(() => {
  if (activeStore) {
    checkPromotionsAccess();
  }
}, [activeStore]);

// Mostrar mensaje de restricción si no hay acceso
if (promotionsAccess && !promotionsAccess.hasAccess) {
  return <RestrictionMessage reason={promotionsAccess.reason} />;
}
```

#### Componente de Estado de Suscripción
```typescript
// src/components/SubscriptionStatus.tsx
// Muestra el plan actual y funcionalidades disponibles
<SubscriptionStatus className="mb-4" />
```

## 📊 Planes de Suscripción

### **Plan Básico (Gratis)**
- ❌ **Promociones** - No disponible
- ❌ **Analytics Avanzado** - No disponible
- ❌ **Soporte Prioritario** - No disponible
- ✅ **Productos** - Hasta 50
- ✅ **Tiendas** - 1 tienda

### **Plan Pro ($29.99/mes)**
- ✅ **Promociones** - Disponible
- ✅ **Analytics Avanzado** - Disponible
- ✅ **Soporte Prioritario** - Disponible
- ❌ **Publicidad** - No disponible
- ✅ **Productos** - Hasta 200
- ✅ **Tiendas** - Hasta 3

### **Plan Elite ($99.99/mes)**
- ✅ **Promociones** - Disponible
- ✅ **Analytics Avanzado** - Disponible
- ✅ **Soporte Prioritario** - Disponible
- ✅ **Publicidad** - Disponible
- ✅ **Dominio Personalizado** - Disponible
- ✅ **API Access** - Disponible
- ✅ **Productos** - Sin límites
- ✅ **Tiendas** - Hasta 10

## 🔧 API Endpoints

### Verificar Acceso a Promociones
```
GET /api/promotions/check-access?storeId={storeId}
```

**Respuesta:**
```json
{
  "success": true,
  "hasAccess": false,
  "reason": "Plan básico no incluye promociones. Actualiza a Pro o Elite.",
  "subscription": {
    "name": "Plan Básico",
    "type": "basic",
    "price": 0
  },
  "requiresUpgrade": true
}
```

### Crear Promoción (con validación)
```
POST /api/promotions
```

**Si no hay acceso:**
```json
{
  "success": false,
  "message": "Plan básico no incluye promociones. Actualiza a Pro o Elite.",
  "subscription": { ... },
  "requiresUpgrade": true
}
```

## 🎨 Interfaz de Usuario

### Mensaje de Restricción
- **Icono**: Crown (corona)
- **Color**: Gradiente púrpura a azul
- **Mensaje**: Explicación clara de la restricción
- **Botón**: "Ver Planes Disponibles" que redirige a `/admin/monetization`

### Componente de Estado
- **Plan actual**: Nombre, precio, tipo
- **Estado**: Activo, expirado, pendiente, inactivo
- **Funcionalidades**: Lista con iconos de check/error
- **Fecha de expiración**: Si aplica
- **Botón de upgrade**: Si es necesario

## 🚀 Flujo de Usuario

### 1. **Usuario con Plan Básico**
1. Accede a `/store-manager/promotions`
2. Ve mensaje de restricción
3. Hace clic en "Ver Planes Disponibles"
4. Es redirigido a la página de monetización
5. Puede actualizar su plan

### 2. **Usuario con Plan Pro/Elite**
1. Accede a `/store-manager/promotions`
2. Ve la interfaz completa de promociones
3. Puede crear, editar y gestionar promociones
4. Ve su estado de suscripción en el sidebar

### 3. **Usuario con Suscripción Expirada**
1. Accede a `/store-manager/promotions`
2. Ve mensaje de suscripción expirada
3. Debe renovar su plan para continuar

## 🔒 Seguridad

### Validaciones Implementadas
- ✅ **Backend**: Verificación en cada endpoint de promociones
- ✅ **Frontend**: Verificación al cargar la página
- ✅ **Estado de suscripción**: Verificación de activo/inactivo/expirado
- ✅ **Tipo de plan**: Verificación de funcionalidades por plan

### Prevención de Bypass
- ✅ **API**: Validación en controlador antes de cualquier operación
- ✅ **Middleware**: Verificación de permisos por rol
- ✅ **Base de datos**: Campos de suscripción en modelo Store

## 📈 Beneficios del Sistema

### Para la Plataforma
- 🎯 **Monetización**: Ingresos recurrentes por suscripciones
- 📊 **Segmentación**: Diferentes niveles de servicio
- 🔒 **Control**: Gestión granular de funcionalidades

### Para las Tiendas
- 🎯 **Flexibilidad**: Planes que se adaptan a sus necesidades
- 📈 **Crecimiento**: Upgrade progresivo según el negocio
- 💰 **ROI**: Funcionalidades premium que generan valor

## 🔄 Próximos Pasos

### Implementaciones Futuras
1. **Sistema de Pagos**: Integración con pasarelas de pago
2. **Facturación Automática**: Renovación automática de suscripciones
3. **Notificaciones**: Alertas de expiración y renovación
4. **Analytics de Uso**: Métricas de uso por plan
5. **Pruebas Gratuitas**: Períodos de prueba para nuevos usuarios

### Optimizaciones
1. **Cache**: Cachear información de suscripción
2. **Webhooks**: Notificaciones en tiempo real
3. **API Rate Limiting**: Límites por plan
4. **Backup**: Sistema de respaldo de suscripciones

---

**Estado**: ✅ **Implementado y Funcional**
**Última Actualización**: Agosto 2024
**Responsable**: Equipo de Desarrollo
