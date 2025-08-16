# 🎁 Sistema de Promociones - Repuestos Automotrices

## 📋 Descripción General

El sistema de promociones permite a administradores y gestores de tienda crear y gestionar ofertas especiales para productos de repuestos automotrices. Cada promoción está asociada a una tienda específica, permitiendo un control granular de las ofertas por ubicación.

## 🏗️ Arquitectura del Sistema

### Roles y Permisos

- **Administrador (`admin`)**: Puede crear promociones para cualquier tienda del sistema
- **Gestor de Tienda (`store_manager`)**: Solo puede crear promociones para su tienda asignada

### Flujo de Trabajo

1. **Admin**: Selecciona una tienda específica al crear promociones
2. **Store Manager**: Las promociones se asocian automáticamente a su tienda
3. **Validación**: El sistema verifica permisos y existencia de tiendas/productos
4. **Filtrado**: Los usuarios solo ven promociones de sus tiendas autorizadas

## 📊 Modelo de Datos

### Promoción (Promotion)

```typescript
interface IPromotion {
  name: string;                    // Nombre de la promoción
  description: string;             // Descripción detallada
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;     // Porcentaje de descuento (0-100)
  discountAmount?: number;         // Monto fijo de descuento
  buyQuantity?: number;            // Cantidad a comprar (buy_x_get_y)
  getQuantity?: number;            // Cantidad a obtener (buy_x_get_y)
  customText?: string;             // Texto personalizado
  products: ObjectId[];            // Productos incluidos
  categories?: ObjectId[];         // Categorías incluidas
  store: ObjectId;                 // Tienda asociada (REQUERIDO)
  startDate: Date;                 // Fecha de inicio
  startTime: string;               // Hora de inicio (HH:mm)
  endDate: Date;                   // Fecha de fin
  endTime: string;                 // Hora de fin (HH:mm)
  isActive: boolean;               // Estado activo/inactivo
  createdBy: ObjectId;             // Usuario creador
  ribbonText: string;              // Texto del ribbon
  ribbonPosition: string;          // Posición del ribbon
  showOriginalPrice: boolean;      // Mostrar precio original
  showDiscountAmount: boolean;     // Mostrar monto de descuento
  maxUses?: number;                // Máximo de usos
  currentUses: number;             // Usos actuales
  createdAt: Date;                 // Fecha de creación
  updatedAt: Date;                 // Fecha de actualización
}
```

## 🔧 Funcionalidades Implementadas

### 1. Gestión de Promociones

#### Crear Promoción
- **Admin**: Debe seleccionar una tienda específica
- **Store Manager**: Tienda asignada automáticamente
- Validación de campos obligatorios
- Verificación de existencia de tienda y productos

#### Listar Promociones
- **Admin**: Ve todas las promociones o filtra por tienda
- **Store Manager**: Solo ve promociones de su tienda
- Filtros por: tipo, estado, tienda, fechas
- Búsqueda por nombre y descripción

#### Editar Promoción
- Validación de permisos por tienda
- Actualización de productos y categorías
- Modificación de fechas y condiciones

#### Eliminar Promoción
- Verificación de permisos
- Eliminación lógica con confirmación

### 2. Tipos de Promociones

#### Porcentaje (`percentage`)
- Descuento basado en porcentaje del precio original
- Rango: 0-100%
- Ejemplo: 15% de descuento

#### Monto Fijo (`fixed`)
- Descuento de cantidad específica
- Ejemplo: $5,000 de descuento

#### Compra X Obtén Y (`buy_x_get_y`)
- Ofertas de cantidad
- Ejemplo: Compra 2, lleva 3

#### Personalizada (`custom`)
- Texto personalizado para condiciones especiales
- Flexibilidad total en la descripción

### 3. Filtros y Búsqueda

#### Filtros Disponibles
- **Tienda**: Solo para administradores
- **Tipo**: percentage, fixed, buy_x_get_y, custom
- **Estado**: Activa, Inactiva
- **Fechas**: Por rango de fechas
- **Búsqueda**: Por nombre y descripción

#### Estadísticas
- Total de promociones
- Promociones activas/inactivas
- Por tipo de promoción
- Por tienda
- Próximas a expirar

### 4. Validaciones

#### Frontend
- Campos obligatorios: nombre, descripción, tipo, tienda (admin)
- Validación de fechas (fin > inicio)
- Validación de porcentajes (0-100)
- Validación de montos (positivos)

#### Backend
- Verificación de permisos por rol
- Validación de existencia de tienda
- Validación de productos asociados
- Verificación de fechas y horarios

## 🛠️ API Endpoints

### Rutas Públicas
```
GET /api/promotions - Listar promociones (con filtros)
GET /api/promotions/:id - Obtener promoción específica
```

### Rutas Protegidas (Admin/Store Manager)
```
POST /api/promotions - Crear promoción
PUT /api/promotions/:id - Actualizar promoción
DELETE /api/promotions/:id - Eliminar promoción
PATCH /api/promotions/:id/toggle - Activar/Desactivar
GET /api/promotions/stats/overview - Estadísticas
GET /api/promotions/products/available - Productos disponibles
GET /api/promotions/stores/available - Tiendas disponibles (solo admin)
GET /api/promotions/categories/available - Categorías disponibles
```

### Parámetros de Consulta
```
?search=texto - Búsqueda por nombre/descripción
?store=storeId - Filtrar por tienda
?type=percentage - Filtrar por tipo
?isActive=true - Filtrar por estado
?startDate=2024-01-01 - Filtrar por fecha inicio
?endDate=2024-12-31 - Filtrar por fecha fin
```

## 🎨 Interfaz de Usuario

### Página de Administración (`/admin/promotions`)

#### Características
- **Dashboard con estadísticas**: Total, activas, inactivas, por expirar
- **Filtros avanzados**: Tienda, tipo, estado, búsqueda
- **Lista de promociones**: Vista detallada con acciones
- **Modal de creación**: Formulario completo con validaciones
- **Acciones por promoción**: Ver, editar, activar/desactivar, eliminar

#### Componentes Principales
- **Estadísticas Cards**: Métricas visuales
- **Barra de Filtros**: Búsqueda y filtros
- **Lista de Promociones**: Vista tabular con acciones
- **Modal de Formulario**: Creación/edición de promociones

### Responsive Design
- **Desktop**: Vista completa con todos los filtros
- **Tablet**: Filtros apilados, lista adaptada
- **Mobile**: Navegación optimizada, modales adaptados

## 🗄️ Base de Datos

### Índices Optimizados
```javascript
// Índices para consultas eficientes
{ isActive: 1, startDate: 1, endDate: 1 }     // Filtros por estado y fechas
{ products: 1 }                               // Búsqueda por productos
{ categories: 1 }                             // Búsqueda por categorías
{ createdBy: 1 }                              // Promociones por usuario
{ store: 1 }                                  // Promociones por tienda
{ store: 1, isActive: 1 }                     // Promociones activas por tienda
```

### Relaciones
- **Promotion → Store**: Una promoción pertenece a una tienda
- **Promotion → Products**: Una promoción puede incluir múltiples productos
- **Promotion → Categories**: Una promoción puede incluir múltiples categorías
- **Promotion → User**: Una promoción es creada por un usuario

## 🚀 Instalación y Configuración

### 1. Sembrar Datos de Prueba
```bash
# Sembrar promociones de prueba
node seed-promotions.js

# Verificar datos
node test-promotions.js
```

### 2. Verificar Configuración
```bash
# Probar conexión a la base de datos
node test-promotions.js

# Verificar API endpoints
node test-api-promotions.js
```

### 3. Estructura de Archivos
```
backend/
├── src/
│   ├── models/
│   │   └── Promotion.ts          # Modelo de promociones
│   ├── controllers/
│   │   └── promotionController.ts # Controlador con lógica de tiendas
│   ├── services/
│   │   └── promotionService.ts   # Servicios de promociones
│   ├── routes/
│   │   └── promotionRoutes.ts    # Rutas de la API
│   └── scripts/
│       └── seedPromotions.ts     # Script de datos de prueba
├── seed-promotions.js            # Runner del script
└── test-promotions.js            # Script de prueba
```

## 📈 Monitoreo y Métricas

### Estadísticas Disponibles
- **Total de promociones**: Conteo general
- **Promociones activas**: En vigencia actual
- **Promociones inactivas**: Desactivadas manualmente
- **Por expirar**: Próximas a vencer (7 días)
- **Por tipo**: Distribución por tipo de promoción
- **Por tienda**: Promociones por ubicación

### Logs y Debugging
```javascript
// Logs en el controlador
console.log('🔍 getAllPromotions llamado');
console.log('📋 Query params:', { search, store, type, isActive });
console.log('📊 Promociones encontradas:', promotions.length);
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. "No tienes una tienda asignada"
**Causa**: Store manager sin tienda asignada
**Solución**: Asignar tienda al usuario o crear una

#### 2. "La tienda es requerida para administradores"
**Causa**: Admin no seleccionó tienda al crear promoción
**Solución**: Seleccionar tienda en el formulario

#### 3. "No tienes permisos para ver promociones"
**Causa**: Usuario sin rol admin o store_manager
**Solución**: Verificar rol del usuario

#### 4. Promociones no aparecen
**Causa**: Filtros aplicados incorrectamente
**Solución**: Verificar filtros y permisos de tienda

### Debugging
```bash
# Verificar datos en BD
node test-promotions.js

# Probar API directamente
node test-api-promotions.js

# Verificar logs del servidor
tail -f backend/logs/app.log
```

## 🔮 Mejoras Futuras

### Funcionalidades Planificadas
1. **Promociones por ubicación geográfica**
2. **Sistema de cupones y códigos**
3. **Promociones automáticas por temporada**
4. **Notificaciones de promociones próximas a expirar**
5. **Reportes de efectividad de promociones**
6. **Integración con sistema de lealtad**
7. **Promociones por categoría de cliente**
8. **Sistema de aprobación de promociones**

### Optimizaciones Técnicas
1. **Caché de promociones activas**
2. **Índices compuestos adicionales**
3. **Paginación en listas grandes**
4. **Validación en tiempo real**
5. **Sistema de versionado de promociones**

## 📚 Recursos Adicionales

### Documentación Relacionada
- [Sistema de Tiendas](./SISTEMA_TIENDAS.md)
- [Sistema de Productos](./SISTEMA_PRODUCTOS.md)
- [Sistema de Usuarios](./SISTEMA_USUARIOS.md)
- [API Documentation](./API_DOCUMENTATION.md)

### Scripts Útiles
```bash
# Sembrar todo el sistema
npm run seed:all

# Probar todo el sistema
npm run test:all

# Limpiar datos de prueba
npm run clean:test
```

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Mantenido por**: Equipo de Desarrollo RepuestosPro
