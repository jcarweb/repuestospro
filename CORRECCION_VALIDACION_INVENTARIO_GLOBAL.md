# Corrección: Validación de Inventario Global para Tienda Principal

## 🎯 **Problema Identificado**

El usuario reportó que al intentar crear un producto en la **tienda principal**, aparece el error:

> "No puedes crear productos en esta sucursal. Los productos deben crearse en la tienda principal que maneja el inventario global."

### **Diagnóstico del Problema**

**Causa raíz**: La lógica de validación estaba verificando solo `inventoryConfig.parentStore` para determinar si era una sucursal, pero **no consideraba** si la tienda era la principal (`store.isMainStore`).

**Lógica anterior (problemática)**:
```typescript
if (inventoryConfig.parentStore) {
  // ❌ Consideraba cualquier tienda con parentStore como sucursal
  return res.status(403).json({...});
}
```

**Problema**: Una tienda principal puede tener `parentStore` configurado incorrectamente, causando que se bloquee la creación de productos.

## ✅ **Solución Implementada**

### **Lógica Mejorada**

**Archivo**: `backend/src/controllers/productController.ts`

**Cambio realizado**:
```typescript
// ANTES (problemático)
if (inventoryConfig.parentStore) {
  // Es una sucursal → NO puede crear productos
}

// DESPUÉS (corregido)
const isBranch = inventoryConfig.parentStore && !store.isMainStore;

if (isBranch) {
  // Es una sucursal → NO puede crear productos
}
```

### **Validación Robusta**

La nueva lógica considera **ambos factores**:

1. **`inventoryConfig.parentStore`**: ¿Tiene una tienda padre configurada?
2. **`store.isMainStore`**: ¿Es la tienda principal?

**Combinación de condiciones**:
- ✅ **Tienda Principal + Sin parentStore**: Puede crear productos
- ✅ **Tienda Principal + Con parentStore**: Puede crear productos (corregido)
- ❌ **Sucursal + Con parentStore**: NO puede crear productos
- ✅ **Sucursal + Sin parentStore**: Puede crear productos (inventario separado)

### **Logs de Debug Agregados**

Para facilitar el diagnóstico futuro, se agregaron logs detallados:

```typescript
console.log('🔍 Debug inventario global:');
console.log('  - Store ID:', storeId);
console.log('  - Store isMainStore:', store.isMainStore);
console.log('  - Inventory config:', inventoryConfig ? {
  inventoryType: inventoryConfig.inventoryType,
  parentStore: inventoryConfig.parentStore,
  hasParentStore: !!inventoryConfig.parentStore
} : 'No config found');
console.log('  - Is branch:', isBranch);
console.log('  - Parent store exists:', !!inventoryConfig.parentStore);
console.log('  - Store is main store:', store.isMainStore);
```

## 🎯 **Resultados Esperados**

### **Después de la Corrección**:

1. **✅ Tienda Principal**: Puede crear productos sin restricciones
2. **✅ Sucursales con inventario separado**: Pueden crear productos
3. **❌ Sucursales con inventario global**: NO pueden crear productos (correcto)
4. **✅ Logs de debug**: Para diagnóstico futuro

### **Flujo de Validación**:

1. **Usuario intenta crear producto**
2. **Sistema verifica configuración de inventario**
3. **Si es inventario global**:
   - Verifica si es sucursal (`parentStore && !isMainStore`)
   - Si es sucursal → Bloquea creación
   - Si es tienda principal → Permite creación
4. **Si es inventario separado/híbrido** → Permite creación

## 📝 **Archivos Modificados**

### **Backend**:
- `backend/src/controllers/productController.ts` - ✅ Lógica corregida

### **Documentación**:
- `CORRECCION_VALIDACION_INVENTARIO_GLOBAL.md` - ✅ Documentación creada

## 🚀 **Próximos Pasos**

1. **Probar la corrección** - Verificar que la tienda principal puede crear productos
2. **Revisar logs** - Confirmar que la validación funciona correctamente
3. **Limpiar logs** - Remover logs de debug una vez confirmado
4. **Documentar** - Actualizar documentación de permisos

## 🔍 **Casos de Prueba**

### **Caso 1: Tienda Principal con Inventario Global**
- **Configuración**: `isMainStore: true`, `inventoryType: 'global'`
- **Resultado esperado**: ✅ Puede crear productos

### **Caso 2: Sucursal con Inventario Global**
- **Configuración**: `isMainStore: false`, `inventoryType: 'global'`, `parentStore: exists`
- **Resultado esperado**: ❌ NO puede crear productos

### **Caso 3: Tienda con Inventario Separado**
- **Configuración**: `inventoryType: 'separate'`
- **Resultado esperado**: ✅ Puede crear productos

### **Caso 4: Tienda Principal con Configuración Incorrecta**
- **Configuración**: `isMainStore: true`, `inventoryType: 'global'`, `parentStore: exists`
- **Resultado esperado**: ✅ Puede crear productos (corregido)
