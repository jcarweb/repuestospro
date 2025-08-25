# Implementación: Sistema de Papelera para Productos (Estilo WooCommerce)

## 🎯 **Objetivo**

Implementar un sistema de papelera (trash) para productos similar a WooCommerce, donde:
- Los productos "eliminados" se mueven a una papelera
- Se pueden restaurar desde la papelera
- Se pueden eliminar permanentemente desde la papelera
- Los productos en papelera no aparecen en el catálogo público

## ✅ **Backend Implementado**

### **1. Modelo de Producto Actualizado**
- ✅ Agregado campo `deleted: boolean` (indica si está en papelera)
- ✅ Agregado campo `deletedAt: Date` (fecha de eliminación)
- ✅ Índices actualizados para filtrar productos eliminados

### **2. Nuevos Endpoints**
- ✅ `DELETE /api/products/store-manager/:id` - Mover a papelera
- ✅ `GET /api/products/store-manager/trash` - Obtener productos eliminados
- ✅ `PUT /api/products/store-manager/trash/:id/restore` - Restaurar producto
- ✅ `DELETE /api/products/store-manager/trash/:id/permanent` - Eliminación permanente

### **3. Filtros Actualizados**
- ✅ Todos los endpoints públicos filtran productos eliminados
- ✅ Solo productos con `deleted: false` aparecen en el catálogo

## 🎨 **Frontend a Implementar**

### **1. Modificar StoreManagerProducts.tsx**

#### **A. Agregar Estado para Pestañas**
```typescript
const [activeTab, setActiveTab] = useState<'products' | 'trash'>('products');
const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
const [deletedProductsLoading, setDeletedProductsLoading] = useState(false);
```

#### **B. Agregar Funciones para Papelera**
```typescript
// Cargar productos eliminados
const loadDeletedProducts = async () => {
  setDeletedProductsLoading(true);
  try {
    const response = await fetch('/api/products/store-manager/trash', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setDeletedProducts(data.data.products);
    }
  } catch (error) {
    console.error('Error cargando productos eliminados:', error);
  } finally {
    setDeletedProductsLoading(false);
  }
};

// Restaurar producto
const handleRestoreProduct = async (productId: string) => {
  try {
    const response = await fetch(`/api/products/store-manager/trash/${productId}/restore`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      loadProducts();
      loadDeletedProducts();
      loadStats();
    }
  } catch (error) {
    console.error('Error restaurando producto:', error);
  }
};

// Eliminar permanentemente
const handlePermanentlyDeleteProduct = async (productId: string) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto permanentemente? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const response = await fetch(`/api/products/store-manager/trash/${productId}/permanent`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      loadDeletedProducts();
      loadStats();
    }
  } catch (error) {
    console.error('Error eliminando producto permanentemente:', error);
  }
};
```

#### **C. Modificar handleDeleteProduct**
```typescript
// Cambiar el mensaje de confirmación
const handleDeleteProduct = async (productId: string) => {
  if (!confirm('¿Estás seguro de que quieres mover este producto a la papelera?')) return;
  
  // ... resto del código igual
};
```

### **2. Agregar Pestañas en la UI**

#### **A. Componente de Pestañas**
```tsx
<div className="mb-6">
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      <button
        onClick={() => setActiveTab('products')}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'products'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Productos Activos ({products.length})
      </button>
      <button
        onClick={() => setActiveTab('trash')}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'trash'
            ? 'border-red-500 text-red-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Papelera ({deletedProducts.length})
      </button>
    </nav>
  </div>
</div>
```

#### **B. Renderizado Condicional**
```tsx
{activeTab === 'products' ? (
  // Tabla de productos activos (existente)
  <div className="overflow-x-auto">
    {/* ... código existente ... */}
  </div>
) : (
  // Tabla de productos eliminados
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            PRODUCTO
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            CATEGORÍA
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            PRECIO
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ELIMINADO
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ACCIONES
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {deletedProducts.map((product) => (
          <tr key={product._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  {product.images && product.images.length > 0 ? (
                    <img
                      className="h-10 w-10 rounded-lg object-cover"
                      src={product.images[0]}
                      alt={product.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.brand}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {product.category}
              </div>
              <div className="text-sm text-gray-500">
                {product.subcategory}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {formatPrice(product.price)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {product.deletedAt ? formatDate(product.deletedAt) : 'N/A'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestoreProduct(product._id)}
                  className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-xs"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => handlePermanentlyDeleteProduct(product._id)}
                  className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

### **3. Efectos para Cargar Datos**

```typescript
useEffect(() => {
  loadProducts();
  loadStats();
}, []);

useEffect(() => {
  if (activeTab === 'trash') {
    loadDeletedProducts();
  }
}, [activeTab]);
```

## 🧪 **Cómo Probar**

### **1. Probar Mover a Papelera**
1. Ir a la pestaña "Productos Activos"
2. Hacer clic en el botón de papelera en cualquier producto
3. Confirmar la acción
4. El producto debe desaparecer de la lista activa

### **2. Probar Ver Papelera**
1. Cambiar a la pestaña "Papelera"
2. Verificar que el producto eliminado aparezca en la lista
3. Verificar que muestre la fecha de eliminación

### **3. Probar Restaurar**
1. En la pestaña "Papelera", hacer clic en "Restaurar"
2. El producto debe desaparecer de la papelera
3. Cambiar a "Productos Activos" y verificar que aparezca

### **4. Probar Eliminación Permanente**
1. En la pestaña "Papelera", hacer clic en "Eliminar"
2. Confirmar la eliminación permanente
3. El producto debe desaparecer completamente

## 📊 **Logs Esperados**

### **Mover a Papelera:**
```
🚀 deleteProduct iniciado - VERSIÓN SIMPLIFICADA
🗑️ Moviendo producto a papelera: [ID]
✅ Producto encontrado: [Nombre]
⚠️ Verificación de permisos temporalmente deshabilitada
✅ Producto movido a papelera exitosamente
```

### **Restaurar:**
```
🚀 restoreProduct iniciado - VERSIÓN SIMPLIFICADA
🔄 Restaurando producto: [ID]
✅ Producto encontrado en papelera: [Nombre]
⚠️ Verificación de permisos temporalmente deshabilitada
✅ Producto restaurado exitosamente
```

### **Eliminación Permanente:**
```
🚀 permanentlyDeleteProduct iniciado - VERSIÓN SIMPLIFICADA
💀 Eliminando producto permanentemente: [ID]
✅ Producto encontrado en papelera: [Nombre]
⚠️ Verificación de permisos temporalmente deshabilitada
✅ Producto eliminado permanentemente
```

## 🎯 **Próximos Pasos**

1. **Implementar el frontend** siguiendo las instrucciones
2. **Probar todas las funcionalidades**
3. **Agregar confirmaciones** más específicas
4. **Implementar búsqueda** en la papelera
5. **Agregar filtros** por fecha de eliminación

---

**Nota**: Este sistema proporciona una experiencia similar a WooCommerce, permitiendo recuperar productos eliminados accidentalmente y mantener un historial completo de productos.
