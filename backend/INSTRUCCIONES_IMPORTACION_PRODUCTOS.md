            # Instrucciones para Importación de Productos

## Descripción
Este documento explica cómo importar productos por lotes usando archivos CSV en el sistema de gestión de productos de PiezasYA.

## Sistema de Tiendas

### Gestión por Roles
- **Administrador**: Puede gestionar productos de todas las tiendas del sistema
- **Gestor de Tienda**: Solo puede gestionar productos de las tiendas a las que tiene acceso

### Diferencias en la Interfaz
- **Panel de Administrador**: Muestra columna "Tienda" para identificar a qué tienda pertenece cada producto
- **Panel de Gestor de Tienda**: No muestra columna de tienda, ya que solo ve sus propias tiendas

## Formato del Archivo CSV

### Campos Obligatorios
- **name**: Nombre del producto
- **description**: Descripción detallada del producto
- **price**: Precio del producto (número decimal)
- **category**: Categoría principal del producto
- **sku**: Código SKU interno (debe ser único por tienda)

### Campos Opcionales
- **brand**: Marca del producto
- **subcategory**: Subcategoría del producto
- **originalPartCode**: Código original de la pieza
- **stock**: Cantidad en stock (número entero, por defecto 0)
- **isFeatured**: Si es producto destacado (true/false, por defecto false)
- **tags**: Etiquetas separadas por comas
- **specifications**: Especificaciones en formato JSON
- **images**: URLs de imágenes separadas por comas

## Ejemplo de Archivo CSV

```csv
name,description,price,category,brand,subcategory,sku,originalPartCode,stock,isFeatured,tags,specifications,images
Filtro de Aceite Motor Premium,Filtro de aceite de alta calidad para motores modernos,25.99,Motor,Toyota,Aceite de Motor,SKU-TOY-MOT-001,90915-YZZJ1,45,true,"filtro,aceite,motor","{\"material\":\"papel sintético\",\"eficiencia\":\"99%\",\"vida_util\":\"10000km\"}","https://example.com/filtro1.jpg,https://example.com/filtro2.jpg"
Pastillas de Freno Delanteras,Pastillas de freno cerámicas para mejor rendimiento,89.50,Frenos,Honda,Pastillas de Freno,SKU-HON-FRE-001,45022-S5A-003,12,false,"frenos,pastillas,ceramicas","{\"material\":\"cerámico\",\"temperatura_max\":\"800°C\",\"duracion\":\"50000km\"}","https://example.com/pastillas1.jpg"
```

## Categorías Disponibles

### Categorías Principales
- Motor
- Frenos
- Suspensión
- Eléctrico
- Transmisión
- Refrigeración
- Combustible
- Escape
- Dirección
- Iluminación
- Accesorios

### Subcategorías por Categoría

#### Motor
- Aceite de Motor
- Filtros de Aceite
- Bujías
- Correas
- Bombas de Aceite
- Juntas

#### Frenos
- Pastillas de Freno
- Discos de Freno
- Líquido de Frenos
- Cilindros
- Cables

#### Suspensión
- Amortiguadores
- Resortes
- Brazos de Control
- Bujes
- Rótulas

#### Eléctrico
- Baterías
- Alternadores
- Arrancadores
- Cables
- Fusibles

#### Transmisión
- Aceite de Transmisión
- Embragues
- Diferenciales
- Juntas

#### Refrigeración
- Radiadores
- Bombas de Agua
- Termostatos
- Mangueras
- Anticongelante

#### Combustible
- Bombas de Combustible
- Filtros de Combustible
- Inyectores
- Carburadores

#### Escape
- Silenciadores
- Catalizadores
- Tubos de Escape
- Soportes

#### Dirección
- Cremalleras
- Bombas de Dirección
- Aceite de Dirección
- Juntas

#### Iluminación
- Bombillas
- Faros
- Pilotos
- Cables de Iluminación

#### Accesorios
- Alfombras
- Cubiertas
- Organizadores
- Cargadores

## Marcas Disponibles

- Toyota
- Honda
- Ford
- Chevrolet
- Nissan
- BMW
- Mercedes
- Audi
- Volkswagen
- Hyundai
- Kia
- Mazda
- Subaru
- Mitsubishi
- Lexus

## Reglas de Validación

1. **SKU Único por Tienda**: Cada producto debe tener un SKU único dentro de su tienda
2. **Precio Positivo**: El precio debe ser un número positivo
3. **Stock No Negativo**: El stock debe ser 0 o mayor
4. **Campos Obligatorios**: name, description, price, category y sku son obligatorios
5. **Formato JSON**: El campo specifications debe ser un JSON válido
6. **Tamaño de Archivo**: Máximo 5MB por archivo
7. **Permisos de Tienda**: Solo se pueden importar productos a tiendas donde el usuario tiene permisos

## Proceso de Importación

### Para Administradores
1. **Preparar el archivo CSV** con el formato correcto
2. **Acceder al panel de administración** → Productos
3. **Hacer clic en "Importar CSV"**
4. **Seleccionar la tienda** destino
5. **Seleccionar el archivo** CSV
6. **Revisar el formato** mostrado en el modal
7. **Hacer clic en "Importar"**
8. **Revisar los resultados** de la importación

### Para Gestores de Tienda
1. **Preparar el archivo CSV** con el formato correcto
2. **Acceder al panel de gestión de tienda** → Productos
3. **Hacer clic en "Importar CSV"**
4. **Seleccionar la tienda** (solo las tiendas a las que tiene acceso)
5. **Seleccionar el archivo** CSV
6. **Revisar el formato** mostrado en el modal
7. **Hacer clic en "Importar"**
8. **Revisar los resultados** de la importación

## Manejo de Errores

### Errores Comunes
- **SKU duplicado en tienda**: El SKU ya existe en la tienda seleccionada
- **Campos faltantes**: Faltan campos obligatorios
- **Formato inválido**: Precio o stock no son números válidos
- **JSON inválido**: El campo specifications no es un JSON válido
- **Sin permisos de tienda**: No tiene acceso a la tienda seleccionada

### Reporte de Errores
El sistema mostrará:
- Número total de productos procesados
- Número de productos importados exitosamente
- Número de errores encontrados
- Lista de los primeros 10 errores con detalles

## Gestión de Tiendas

### Crear Tienda
1. Acceder a **Gestión de Tiendas**
2. Hacer clic en **"Crear Tienda"**
3. Completar la información requerida:
   - Nombre de la tienda
   - Dirección completa
   - Información de contacto
   - Horarios de atención
   - Configuraciones de negocio

### Asignar Gestores
1. Desde la tienda creada, ir a **"Gestión de Managers"**
2. Agregar usuarios como managers de la tienda
3. Los managers podrán gestionar productos de esa tienda

### Permisos por Rol
- **Owner**: Propietario de la tienda, puede hacer todo
- **Manager**: Gestor de la tienda, puede gestionar productos
- **Admin**: Puede gestionar todas las tiendas y productos

## Recomendaciones

1. **Hacer una copia de seguridad** antes de importar grandes cantidades
2. **Probar con un archivo pequeño** primero
3. **Verificar el formato** del archivo CSV antes de importar
4. **Usar SKUs únicos por tienda** para evitar conflictos
5. **Revisar las especificaciones** JSON antes de importar
6. **Verificar permisos de tienda** antes de importar

## Limitaciones

- **Tamaño máximo**: 5MB por archivo
- **Formato**: Solo archivos CSV
- **Codificación**: UTF-8 recomendado
- **Líneas máximas**: Sin límite específico, pero se recomienda no más de 10,000 productos por archivo
- **SKU único**: Por tienda, no globalmente

## Soporte

Si tienes problemas con la importación:
1. Verifica el formato del archivo CSV
2. Revisa los errores mostrados en el reporte
3. Verifica que tienes permisos para la tienda seleccionada
4. Contacta al administrador del sistema
