# 🗂️ Sistema de Categorías - Repuestos Automotrices

## 📋 Descripción General

El sistema de categorías permite organizar los productos de repuestos automotrices en una estructura jerárquica, facilitando la navegación y búsqueda de productos para los clientes.

## 🏗️ Estructura del Sistema

### Modelo de Datos

```typescript
interface Category {
  _id: string;
  name: string;                    // Nombre de la categoría
  description: string;             // Descripción detallada
  image?: string;                  // URL de imagen (opcional)
  parentCategory?: {               // Categoría padre (para subcategorías)
    _id: string;
    name: string;
  };
  isActive: boolean;               // Estado activo/inactivo
  order: number;                   // Orden de visualización
  productCount?: number;           // Número de productos (calculado)
  createdAt: string;
  updatedAt: string;
}
```

### Jerarquía de Categorías

```
📁 Categorías Principales
├── 🔧 Motor
│   ├── Aceite de Motor
│   ├── Filtros de Aceite
│   ├── Bujías
│   └── ...
├── 🛑 Frenos
│   ├── Pastillas de Freno
│   ├── Discos de Freno
│   └── ...
├── 🚗 Suspensión
│   ├── Amortiguadores
│   ├── Resortes
│   └── ...
└── ... (11 categorías principales)
```

## 🚀 Funcionalidades Implementadas

### 1. **Gestión Completa de Categorías**
- ✅ Crear categorías principales y subcategorías
- ✅ Editar información de categorías
- ✅ Eliminar categorías (con validaciones)
- ✅ Activar/desactivar categorías
- ✅ Visualizar detalles completos

### 2. **Jerarquía y Organización**
- ✅ Sistema de categorías padre-hijo
- ✅ Ordenamiento personalizable
- ✅ Visualización en árbol expandible
- ✅ Validación de referencias circulares

### 3. **Búsqueda y Filtros**
- ✅ Búsqueda por nombre y descripción
- ✅ Filtro por estado (activo/inactivo)
- ✅ Búsqueda en tiempo real

### 4. **Estadísticas y Métricas**
- ✅ Total de categorías
- ✅ Categorías activas/inactivas
- ✅ Categorías con productos
- ✅ Conteo de productos por categoría

### 5. **Validaciones de Seguridad**
- ✅ Prevención de eliminación con productos asociados
- ✅ Prevención de eliminación con subcategorías
- ✅ Validación de nombres únicos
- ✅ Prevención de referencias circulares

## 🛠️ API Endpoints

### Rutas Públicas
```http
GET /api/categories              # Obtener todas las categorías
GET /api/categories/:id          # Obtener categoría por ID
```

### Rutas Protegidas (Admin)
```http
POST /api/categories             # Crear nueva categoría
PUT /api/categories/:id          # Actualizar categoría
DELETE /api/categories/:id       # Eliminar categoría
PATCH /api/categories/:id/toggle-status  # Cambiar estado
GET /api/admin/categories/stats  # Obtener estadísticas
```

## 📱 Interfaz de Usuario

### Panel de Administración
- **Dashboard con estadísticas** en tiempo real
- **Lista jerárquica** con expansión/colapso
- **Modales intuitivos** para crear/editar
- **Acciones rápidas** (ver, editar, activar, eliminar)
- **Búsqueda y filtros** avanzados

### Características de UX
- ✅ Diseño responsive
- ✅ Iconos intuitivos
- ✅ Estados visuales claros
- ✅ Confirmaciones de acciones críticas
- ✅ Mensajes de error descriptivos

## 🗄️ Base de Datos

### Índices Optimizados
```javascript
CategorySchema.index({ name: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ order: 1 });
```

### Relaciones
- **Categorías padre-hijo**: Referencia circular en el mismo modelo
- **Productos**: Referencia desde productos hacia categorías
- **Actividades**: Log de todas las operaciones administrativas

## 🌱 Datos de Ejemplo

### Categorías Principales (11)
1. **Motor** - Repuestos del motor
2. **Frenos** - Sistema de frenado
3. **Suspensión** - Componentes de suspensión
4. **Eléctrico** - Sistema eléctrico
5. **Transmisión** - Sistema de transmisión
6. **Refrigeración** - Sistema de refrigeración
7. **Combustible** - Sistema de combustible
8. **Escape** - Sistema de escape
9. **Dirección** - Sistema de dirección
10. **Iluminación** - Sistema de iluminación
11. **Accesorios** - Accesorios varios

### Subcategorías (50+)
Cada categoría principal tiene 4-6 subcategorías específicas, totalizando más de 50 subcategorías organizadas.

## 🔧 Instalación y Configuración

### 1. Ejecutar Script de Siembra
```bash
cd backend
node seed-categories.js
```

### 2. Verificar Instalación
- Acceder al panel de administración
- Navegar a "Gestión de Categorías"
- Verificar que aparezcan las categorías sembradas

## 📊 Monitoreo y Mantenimiento

### Logs de Actividad
Todas las operaciones se registran en la colección `Activity`:
- `category_created` - Creación de categorías
- `category_updated` - Actualización de categorías
- `category_deleted` - Eliminación de categorías
- `category_status_changed` - Cambio de estado

### Métricas Importantes
- **Total de categorías**: Monitorear crecimiento
- **Categorías activas**: Mantener proporción alta
- **Categorías con productos**: Identificar categorías vacías
- **Uso de subcategorías**: Optimizar estructura

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Importación masiva** desde CSV/Excel
- [ ] **Exportación** de estructura de categorías
- [ ] **Drag & Drop** para reordenar
- [ ] **Bulk operations** (activar/desactivar múltiples)
- [ ] **Historial de cambios** detallado
- [ ] **Categorías por marca** de vehículo
- [ ] **Sugerencias automáticas** de categorías

### Optimizaciones Técnicas
- [ ] **Caché** de estructura de categorías
- [ ] **Paginación** para grandes volúmenes
- [ ] **Búsqueda full-text** avanzada
- [ ] **API GraphQL** para consultas complejas

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error al eliminar categoría**
   - Verificar que no tenga productos asociados
   - Verificar que no tenga subcategorías

2. **Categoría no aparece**
   - Verificar estado activo/inactivo
   - Verificar permisos de administrador

3. **Error de validación**
   - Verificar nombres únicos
   - Verificar campos obligatorios

### Comandos de Diagnóstico
```bash
# Verificar conexión a BD
node backend/test-db.js

# Verificar categorías existentes
node backend/scripts/check-categories.js

# Recrear categorías de ejemplo
node backend/seed-categories.js
```

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Revisar la documentación completa
2. Verificar logs de actividad
3. Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Mantenido por**: Equipo de Desarrollo RepuestosPro
