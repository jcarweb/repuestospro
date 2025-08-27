# Generación de Datos de Prueba para Gestores de Tienda

## Resumen

Se ha implementado un sistema completo para generar datos de prueba específicos para gestores de tienda, permitiendo probar la funcionalidad del módulo de reportes de ventas del gestor de tienda.

## Funcionalidades Implementadas

### 1. Nuevo Método en SalesReportService
- **Método**: `generateStoreManagerTestData(userEmail: string)`
- **Ubicación**: `backend/src/services/SalesReportService.ts`
- **Propósito**: Genera órdenes de prueba específicas para las tiendas asociadas a un gestor de tienda

### 2. Nuevo Endpoint en el Controlador
- **Método**: `generateStoreManagerTestData`
- **Ubicación**: `backend/src/controllers/SalesReportController.ts`
- **Endpoint**: `POST /api/sales-reports/generate-store-manager-test-data`
- **Acceso**: Solo administradores

### 3. Nueva Ruta API
- **Ruta**: `/api/sales-reports/generate-store-manager-test-data`
- **Ubicación**: `backend/src/routes/salesReportRoutes.ts`
- **Método**: POST
- **Middleware**: Autenticación + Rol de administrador

### 4. Interfaz de Usuario
- **Botón**: "Generar Datos para Gestor de Tienda"
- **Ubicación**: `src/pages/AdminSalesReports.tsx`
- **Acción**: Genera datos específicos para `jucarl74@gmail.com`

## Características del Sistema

### Datos Generados
- **80 órdenes** distribuidas en los últimos 2 meses (60 días)
- **Órdenes específicas** para las tiendas del gestor
- **Datos realistas** con precios, impuestos, descuentos
- **Múltiples estados** de orden y pago
- **Clientes de prueba** si no existen
- **Mejor distribución temporal** para visualización de gráficos

### Configuración Automática
- **Búsqueda automática** del gestor de tienda por email
- **Identificación de tiendas** asociadas al gestor
- **Creación de clientes** de prueba si es necesario
- **Validación de productos** disponibles

### Estadísticas Generadas
- **Órdenes por tienda** con totales
- **Período de datos** (últimos 30 días)
- **Resumen detallado** de la generación

## Configuración del Gestor de Tienda

### Usuario Configurado
- **Email**: `jucarl74@gmail.com`
- **Rol**: `store_manager`
- **Tiendas asociadas**: 2
  1. "prueba de tienda" (Caracas)
  2. "sucursal 1" (Caracas)

### Verificación de Configuración
```bash
cd backend
node test-store-manager-setup.js
```

## Cómo Usar

### 1. Como Administrador
1. Ir a la página de Reportes de Ventas de Administrador
2. Hacer clic en "Generar Datos para Gestor de Tienda"
3. Los datos se generarán automáticamente para `jucarl74@gmail.com`

### 2. Como Gestor de Tienda
1. Iniciar sesión con `jucarl74@gmail.com`
2. Ir a la sección de Reportes de Ventas
3. Ver los datos generados en el dashboard

### 3. Via API Directa
```bash
curl -X POST http://localhost:3001/api/sales-reports/generate-store-manager-test-data \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "jucarl74@gmail.com"}'
```

## Estructura de Datos Generados

### Órdenes de Prueba
```javascript
{
  orderNumber: "ORD-TIE-1234567890-1",
  userId: "customer_id",
  storeId: "store_id",
  customerInfo: {
    name: "Cliente Test 1",
    email: "cliente1@test.com",
    phone: "+58123456789"
  },
  items: [
    {
      productId: "product_id",
      productName: "Producto Test",
      sku: "SKU-TEST",
      quantity: 2,
      unitPrice: 150.00,
      totalPrice: 300.00
    }
  ],
  subtotal: 300.00,
  taxAmount: 36.00,
  shippingCost: 5.00,
  totalAmount: 341.00,
  orderStatus: "delivered",
  paymentStatus: "paid",
  paymentMethod: "credit_card",
  createdAt: "2024-01-15T10:30:00Z"
}
```

### Estadísticas por Tienda
- **Órdenes generadas**: 30 total
- **Distribución**: Aleatoria entre las tiendas del gestor
- **Período**: Últimos 30 días
- **Estados**: Variados (pending, confirmed, processing, shipped, delivered)

## Archivos Modificados

### Backend
1. `backend/src/services/SalesReportService.ts`
   - Agregado método `generateStoreManagerTestData`

2. `backend/src/controllers/SalesReportController.ts`
   - Agregado método `generateStoreManagerTestData`

3. `backend/src/routes/salesReportRoutes.ts`
   - Agregada ruta `/generate-store-manager-test-data`

### Frontend
1. `src/pages/AdminSalesReports.tsx`
   - Agregado botón "Generar Datos para Gestor de Tienda"
   - Agregada función `handleGenerateStoreManagerTestData`

### Scripts de Verificación
1. `backend/test-store-manager-setup.js`
   - Script para verificar la configuración del gestor

2. `backend/test-2months-data.js`
   - Script para probar la generación de datos de 2 meses
   - Análisis detallado de los datos generados
   - Verificación de distribución temporal y estadísticas

## Logs y Monitoreo

### Logs del Servidor
```
Generando datos de prueba para gestor de tienda: jucarl74@gmail.com
Usuario encontrado: Juan Carlos (jucarl74@gmail.com)
Tiendas asociadas: 2
  - prueba de tienda (Caracas)
  - sucursal 1 (Caracas)
✅ Generados 30 órdenes de prueba para las tiendas del gestor jucarl74@gmail.com
📊 Resumen:
   - Tiendas: 2
   - Órdenes generadas: 30
   - Período: 15/12/2023 - 15/01/2024
   - prueba de tienda: 18 órdenes, $2,847.50
   - sucursal 1: 12 órdenes, $1,892.30
```

### Respuesta de la API
```json
{
  "success": true,
  "message": "Datos de prueba generados exitosamente para el gestor de tienda jucarl74@gmail.com"
}
```

## Beneficios

### Para Desarrollo
- **Pruebas rápidas** del módulo de reportes
- **Datos realistas** para demostraciones
- **Configuración automática** sin intervención manual

### Para Gestores de Tienda
- **Dashboard funcional** con datos de ejemplo
- **Prueba de filtros** y visualizaciones
- **Entendimiento** de las capacidades del sistema

### Para Administradores
- **Generación controlada** de datos de prueba
- **Monitoreo** de la funcionalidad del gestor
- **Soporte** para demostraciones

## Próximos Pasos

### Mejoras Futuras
1. **Generación masiva** para múltiples gestores
2. **Configuración de parámetros** (cantidad, período, etc.)
3. **Plantillas de datos** personalizables
4. **Exportación** de datos generados
5. **Limpieza automática** de datos de prueba

### Integración
1. **Sistema de notificaciones** para gestores
2. **Reportes automáticos** con datos de prueba
3. **Dashboard en tiempo real** con datos simulados
4. **Comparación** entre datos reales y de prueba

## Troubleshooting

### Problemas Comunes

#### 1. Usuario no encontrado
```
Error: Usuario gestor de tienda no encontrado
Solución: Ejecutar create-store-manager.js primero
```

#### 2. Sin tiendas asociadas
```
Error: No se encontraron tiendas asociadas al usuario
Solución: Verificar la configuración con test-store-manager-setup.js
```

#### 3. Sin productos disponibles
```
Error: No hay productos disponibles para generar órdenes
Solución: Crear productos de prueba o usar productos existentes
```

### Verificación de Estado
```bash
# Verificar configuración
node test-store-manager-setup.js

# Verificar datos generados
db.orders.find({}).count()

# Verificar tiendas del gestor
db.users.findOne({email: "jucarl74@gmail.com"}).stores
```

## Conclusión

El sistema de generación de datos de prueba para gestores de tienda proporciona una solución completa y robusta para probar la funcionalidad del módulo de reportes. Permite a los gestores de tienda experimentar con datos realistas y a los administradores verificar el funcionamiento del sistema de manera eficiente.

## Mejoras para Visualización de Gráficos

### Características Optimizadas
- **Período extendido**: 2 meses (60 días) en lugar de 30 días
- **Más datos**: 80 órdenes en lugar de 30 para mejor densidad
- **Distribución semanal**: Análisis detallado por semanas
- **Rangos de precios ampliados**: $25-$325 para mayor variabilidad
- **Más productos por orden**: 1-4 productos en lugar de 1-3
- **Cantidades variables**: 1-5 unidades por producto

### Beneficios para Gráficos
- **Tendencias más claras**: 2 meses permiten ver patrones temporales
- **Datos más densos**: 80 órdenes proporcionan mejor resolución
- **Variabilidad realista**: Rangos de precios y cantidades más amplios
- **Análisis semanal**: Permite ver fluctuaciones semanales
- **Mejor distribución**: Datos distribuidos en 8-10 semanas

### Visualizaciones Mejoradas
- **Gráficos de líneas**: Tendencias de ventas más suaves
- **Gráficos de barras**: Comparaciones semanales más claras
- **Gráficos de área**: Volumen de ventas más detallado
- **Heatmaps**: Patrones temporales más visibles
- **Dashboards**: Métricas más representativas

### Script de Prueba
Para verificar la generación de datos de 2 meses:
```bash
cd backend
node test-2months-data.js
```

Este script generará los datos y mostrará un análisis detallado incluyendo:
- Distribución temporal de órdenes
- Estadísticas por tienda
- Análisis de precios
- Estados de orden
- Distribución semanal
