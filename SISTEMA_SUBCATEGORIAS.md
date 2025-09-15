# 🗂️ Sistema de Subcategorías - Repuestos Automotrices

## 📋 Descripción General

El sistema de subcategorías permite organizar los productos de repuestos automotrices en una estructura más granular y específica, facilitando la navegación y búsqueda de productos para los clientes. Cada subcategoría está asociada a una categoría principal y puede ser específica para diferentes tipos de vehículos.

## 🏗️ Estructura del Sistema

### Modelo de Datos

```typescript
interface Subcategory {
  _id: string;
  name: string;                    // Nombre de la subcategoría
  description?: string;            // Descripción detallada (opcional)
  categoryId: {                    // Categoría padre
    _id: string;
    name: string;
  };
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bus';  // Tipo de vehículo
  isActive: boolean;               // Estado activo/inactivo
  order: number;                   // Orden de visualización
  icon?: string;                   // Icono (opcional)
  image?: string;                  // URL de imagen (opcional)
  productCount?: number;           // Número de productos (calculado)
  createdAt: string;
  updatedAt: string;
}
```

### Jerarquía de Subcategorías

```
📁 Categorías Principales
├── 🔧 Motor
│   ├── 🚗 Aceite de Motor (Automóvil)
│   ├── 🚗 Filtros de Aceite (Automóvil)
│   ├── 🚗 Bujías (Automóvil)
│   ├── 🏍️ Aceite de Motor (Motocicleta)
│   └── 🚛 Aceite de Motor (Camión)
├── 🛑 Frenos
│   ├── 🚗 Pastillas de Freno (Automóvil)
│   ├── 🚗 Discos de Freno (Automóvil)
│   ├── 🏍️ Pastillas de Freno (Motocicleta)
│   └── 🚛 Sistemas de Freno de Aire (Camión)
└── ... (11 categorías principales)
```

## 🚀 Funcionalidades Implementadas

### 1. **Gestión Completa de Subcategorías**
- ✅ Crear subcategorías específicas por tipo de vehículo
- ✅ Editar información de subcategorías
- ✅ Eliminar subcategorías (con validaciones)
- ✅ Activar/desactivar subcategorías
- ✅ Visualizar detalles completos

### 2. **Organización por Tipo de Vehículo**
- ✅ Automóviles (car)
- ✅ Motocicletas (motorcycle)
- ✅ Camiones (truck)
- ✅ Autobuses (bus)
- ✅ Filtros por tipo de vehículo

### 3. **Jerarquía y Organización**
- ✅ Asociación con categorías principales
- ✅ Ordenamiento personalizable
- ✅ Visualización en árbol expandible
- ✅ Validación de referencias

### 4. **Búsqueda y Filtros**
- ✅ Búsqueda por nombre y descripción
- ✅ Filtro por categoría padre
- ✅ Filtro por tipo de vehículo
- ✅ Filtro por estado (activo/inactivo)
- ✅ Búsqueda en tiempo real

### 5. **Estadísticas y Métricas**
- ✅ Total de subcategorías
- ✅ Subcategorías activas/inactivas
- ✅ Subcategorías con productos
- ✅ Distribución por tipo de vehículo

### 6. **Validaciones de Seguridad**
- ✅ Prevención de eliminación con productos asociados
- ✅ Validación de nombres únicos por categoría
- ✅ Verificación de existencia de categoría padre
- ✅ Validación de tipos de vehículo

## 🛠️ API Endpoints

### Rutas Públicas
```http
GET /api/subcategories              # Obtener todas las subcategorías
GET /api/subcategories/:id          # Obtener subcategoría por ID
```

### Rutas Protegidas (Admin)
```http
POST /api/subcategories             # Crear nueva subcategoría
PUT /api/subcategories/:id          # Actualizar subcategoría
DELETE /api/subcategories/:id       # Eliminar subcategoría
PATCH /api/subcategories/:id/toggle-status  # Cambiar estado
GET /api/admin/subcategories/stats  # Obtener estadísticas
```

## 📱 Interfaz de Usuario

### Panel de Administración
- **Dashboard con estadísticas** en tiempo real
- **Lista jerárquica** organizada por categorías
- **Vista expandible** de categorías y subcategorías
- **Modales intuitivos** para crear/editar
- **Acciones rápidas** (ver, editar, activar, eliminar)
- **Búsqueda y filtros** avanzados

### Características de UX
- ✅ Diseño responsive
- ✅ Iconos específicos por tipo de vehículo
- ✅ Estados visuales claros
- ✅ Confirmaciones de acciones críticas
- ✅ Mensajes de error descriptivos

## 🗄️ Base de Datos

### Índices Optimizados
```javascript
SubcategorySchema.index({ categoryId: 1, vehicleType: 1, isActive: 1 });
SubcategorySchema.index({ order: 1 });
```

### Relaciones
- **Categorías**: Referencia desde subcategorías hacia categorías
- **Productos**: Referencia desde productos hacia subcategorías
- **Actividades**: Log de todas las operaciones administrativas

## 🌱 Datos de Ejemplo

### Subcategorías por Tipo de Vehículo

#### Automóviles (60+ subcategorías)
- **Motor**: Aceite de Motor, Filtros de Aceite, Bujías, Correas, etc.
- **Frenos**: Pastillas de Freno, Discos de Freno, Líquido de Frenos, etc.
- **Suspensión**: Amortiguadores, Resortes, Brazos de Control, etc.
- **Eléctrico**: Baterías, Alternadores, Arrancadores, etc.
- **Transmisión**: Aceite de Transmisión, Embragues, Diferenciales, etc.

#### Motocicletas (8+ subcategorías)
- **Motor**: Aceite de Motor, Filtros de Aire, Bujías, Cadenas, etc.
- **Frenos**: Pastillas de Freno, Discos de Freno, Líquido de Frenos, etc.

#### Camiones (6+ subcategorías)
- **Motor**: Aceite de Motor, Filtros de Combustible, Sistemas de Inyección, etc.
- **Frenos**: Sistemas de Freno de Aire, Compresores, Válvulas de Freno, etc.

## 🔧 Instalación y Configuración

### 1. Ejecutar Script de Siembra
```bash
cd backend
node seed-subcategories.js
```

### 2. Verificar Instalación
- Acceder al panel de administración
- Navegar a "Gestión de Subcategorías"
- Verificar que aparezcan las subcategorías sembradas

## 📊 Monitoreo y Mantenimiento

### Logs de Actividad
Todas las operaciones se registran en la colección `Activity`:
- `subcategory_created` - Creación de subcategorías
- `subcategory_updated` - Actualización de subcategorías
- `subcategory_deleted` - Eliminación de subcategorías
- `subcategory_status_changed` - Cambio de estado

### Métricas Importantes
- **Total de subcategorías**: Monitorear crecimiento
- **Subcategorías activas**: Mantener proporción alta
- **Subcategorías con productos**: Identificar subcategorías vacías
- **Distribución por tipo de vehículo**: Optimizar cobertura

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Importación masiva** desde CSV/Excel
- [ ] **Exportación** de estructura de subcategorías
- [ ] **Drag & Drop** para reordenar
- [ ] **Bulk operations** (activar/desactivar múltiples)
- [ ] **Historial de cambios** detallado
- [ ] **Subcategorías por marca** de vehículo
- [ ] **Sugerencias automáticas** de subcategorías
- [ ] **Filtros avanzados** por año/modelo de vehículo

### Optimizaciones Técnicas
- [ ] **Caché** de estructura de subcategorías
- [ ] **Paginación** para grandes volúmenes
- [ ] **Búsqueda full-text** avanzada
- [ ] **API GraphQL** para consultas complejas
- [ ] **Sincronización** con sistemas externos

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error al eliminar subcategoría**
   - Verificar que no tenga productos asociados
   - Verificar permisos de administrador

2. **Subcategoría no aparece**
   - Verificar estado activo/inactivo
   - Verificar permisos de administrador
   - Verificar filtros aplicados

3. **Error de validación**
   - Verificar nombres únicos por categoría
   - Verificar campos obligatorios
   - Verificar tipo de vehículo válido

### Comandos de Diagnóstico
```bash
# Verificar conexión a BD
node backend/test-db.js

# Verificar subcategorías existentes
node backend/scripts/check-subcategories.js

# Recrear subcategorías de ejemplo
node backend/seed-subcategories.js
```

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Revisar la documentación completa
2. Verificar logs de actividad
3. Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Mantenido por**: Equipo de Desarrollo PiezasYA
