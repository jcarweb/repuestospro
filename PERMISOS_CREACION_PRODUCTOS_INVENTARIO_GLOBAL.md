# Permisos de Creación de Productos con Inventario Global

## 🎯 **Problema Identificado**

El usuario preguntó sobre los permisos de creación de productos cuando hay inventario global configurado:

> "¿Solo la tienda que tiene el dominio del inventario puede subir productos, o cualquier tienda puede subir un producto sin importar que tienda sea la que lleve el dominio?"

## 🔍 **Análisis del Problema**

### **Situación Actual (Problemática)**
- ✅ **Store Manager**: Puede crear productos en cualquier tienda donde sea manager
- ❌ **No hay validación** de configuración de inventario global
- ❌ **Sucursales pueden crear productos** incluso con inventario global configurado
- ❌ **Posible duplicación** y confusión de productos

### **Problemas Potenciales**
1. **Duplicación de productos**: Sucursales crean productos que ya existen en la tienda principal
2. **Confusión de inventario**: Productos creados en sucursales no se sincronizan con inventario global
3. **Gestión compleja**: Difícil controlar qué productos están disponibles en cada tienda
4. **Inconsistencia de datos**: Productos pueden tener diferentes precios, descripciones, etc.

## ✅ **Solución Implementada**

### **Lógica de Permisos por Tipo de Inventario**

#### **1. Inventario Global** ⚠️ **RESTRICCIÓN APLICA**
```typescript
if (inventoryConfig?.inventoryType === 'global') {
  if (inventoryConfig.parentStore) {
    // SUCURSAL con inventario global → NO puede crear productos
    return res.status(403).json({
      success: false,
      message: 'No puedes crear productos en esta sucursal. Los productos deben crearse en la tienda principal que maneja el inventario global.'
    });
  }
  // TIENDA PRINCIPAL con inventario global → SÍ puede crear productos
}
```

#### **2. Inventario Separado** ✅ **SIN RESTRICCIONES**
```typescript
// Cualquier tienda puede crear productos
// No hay restricciones adicionales
```

#### **3. Inventario Híbrido** ✅ **SIN RESTRICCIONES**
```typescript
// Cualquier tienda puede crear productos
// Se maneja stock local y global por separado
```

## 🚀 **Flujo de Permisos Implementado**

### **Para Store Managers:**

1. **Verificar acceso a tienda**:
   - Debe ser owner o manager de la tienda
   - La tienda debe estar activa

2. **Verificar configuración de inventario**:
   - Si es **inventario global**:
     - **Sucursal**: ❌ NO puede crear productos
     - **Tienda Principal**: ✅ SÍ puede crear productos
   - Si es **inventario separado**: ✅ SÍ puede crear productos (sin restricciones)
   - Si es **inventario híbrido**: ✅ SÍ puede crear productos (sin restricciones)

3. **Verificar SKU único**:
   - El SKU no debe existir en la tienda

### **Para Admins:**
- ✅ Pueden crear productos en cualquier tienda
- ✅ No hay restricciones de inventario global
- ✅ Control total del sistema

## 📋 **Casos de Uso**

### **Caso 1: Tienda Principal con Inventario Global**
```
Configuración:
- Tienda A: inventoryType = 'global', parentStore = null
- Tienda B: inventoryType = 'global', parentStore = TiendaA
- Tienda C: inventoryType = 'global', parentStore = TiendaA

Permisos:
- Store Manager Tienda A: ✅ Puede crear productos
- Store Manager Tienda B: ❌ NO puede crear productos
- Store Manager Tienda C: ❌ NO puede crear productos
```

### **Caso 2: Tiendas con Inventario Separado**
```
Configuración:
- Tienda A: inventoryType = 'separate'
- Tienda B: inventoryType = 'separate'

Permisos:
- Store Manager Tienda A: ✅ Puede crear productos
- Store Manager Tienda B: ✅ Puede crear productos
```

### **Caso 3: Inventario Híbrido**
```
Configuración:
- Tienda A: inventoryType = 'hybrid', allowLocalStock = true
- Tienda B: inventoryType = 'hybrid', allowLocalStock = true

Permisos:
- Store Manager Tienda A: ✅ Puede crear productos
- Store Manager Tienda B: ✅ Puede crear productos
```

## 🎯 **Beneficios de la Implementación**

### **1. Control Centralizado**
- Solo la tienda principal puede crear productos con inventario global
- Evita duplicación y confusión

### **2. Consistencia de Datos**
- Productos creados en la tienda principal se distribuyen automáticamente
- Precios, descripciones y especificaciones consistentes

### **3. Gestión Simplificada**
- Una sola fuente de verdad para productos
- Fácil mantenimiento y actualización

### **4. Escalabilidad**
- Fácil agregar nuevas sucursales sin duplicar productos
- Control granular sobre qué productos están disponibles

## 🔧 **Implementación Técnica**

### **Archivo Modificado**: `backend/src/controllers/productController.ts`

**Validación agregada**:
```typescript
// Verificar configuración de inventario global
const inventoryConfig = await InventoryConfig.findOne({ store: storeId });

if (inventoryConfig?.inventoryType === 'global') {
  if (inventoryConfig.parentStore) {
    // Es una sucursal con inventario global → NO puede crear productos
    return res.status(403).json({
      success: false,
      message: 'No puedes crear productos en esta sucursal. Los productos deben crearse en la tienda principal que maneja el inventario global.'
    });
  }
  // Es la tienda principal con inventario global → SÍ puede crear productos
}
```

### **Import Agregado**:
```typescript
import InventoryConfig from '../models/InventoryConfig';
```

## 📝 **Mensajes de Error**

### **Para Sucursales con Inventario Global**:
```
"No puedes crear productos en esta sucursal. Los productos deben crearse en la tienda principal que maneja el inventario global."
```

### **Para Tiendas sin Permisos**:
```
"No tiene permisos para crear productos en esta tienda"
```

### **Para SKU Duplicado**:
```
"El SKU ya existe en esta tienda"
```

## 🎯 **Resultado Final**

### **Respuesta a la Pregunta del Usuario**:

**Con inventario global**: Solo la **tienda principal** que tiene el dominio del inventario puede crear productos. Las sucursales NO pueden crear productos.

**Con inventario separado**: ✅ **Cualquier tienda puede crear productos** independientemente (sin restricciones).

**Con inventario híbrido**: ✅ **Cualquier tienda puede crear productos** (sin restricciones), pero se maneja stock local y global por separado.

### **Resumen de Restricciones**:
- ⚠️ **Inventario Global**: Solo tienda principal puede crear productos
- ✅ **Inventario Separado**: Sin restricciones, cada tienda maneja su inventario
- ✅ **Inventario Híbrido**: Sin restricciones, cada tienda puede crear productos

Esta implementación asegura un control adecuado **solo cuando es necesario** (inventario global) y permite flexibilidad en los otros casos.
