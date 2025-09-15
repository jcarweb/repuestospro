# 🚗 Marcas de Vehículos Específicas de Venezuela

## 📋 Descripción

Este documento describe el proceso implementado para agregar las marcas de vehículos específicas del mercado venezolano al sistema de repuestos automotrices PiezasYA.

## 🏷️ Marcas por Tipo de Vehículo

### 🚗 Automóviles
- **Marcas populares en Venezuela**: Toyota, Honda, Ford, Chevrolet, Nissan, BMW, Mercedes, Audi, Volkswagen, Hyundai, Kia, Mazda, Subaru, Mitsubishi, Lexus, Peugeot, Renault, Fiat, Seat, Skoda, Volvo, Jaguar, Land Rover
- **Marcas adicionales**: Datsun, Dongfeng, JAC Motors

### 🏍️ Motocicletas
- **Marcas específicas de Venezuela**: Bera, Empire Keeway, Suzuki, Yamaha, Kawasaki, Toro, MD, Skygo, AVA, Haojue, Vefase, Ducati, Benelli, TVS
- **Marcas adicionales populares**: Honda, Bajaj, Zontes, CFMoto, KTM, Aprilia, Harley-Davidson, Triumph

### 🚛 Camiones
- **Marcas de camiones populares en Venezuela**: Foton, Mack, Volvo, Iveco, Ford, Chevrolet, Dongfeng, Dina, JAC Motors, Mitsubishi Fuso, Datsun, Mercedes-Benz, Scania, MAN, Freightliner, Kenworth, International, Caterpillar

### 🚜 Maquinaria Agrícola
- **Marcas de maquinaria agrícola en Venezuela**: John Deere, New Holland, Massey Ferguson, Fendt, Kubota, Deutz-Fahr, Case IH, Claas, JCB, Iseki
- **Marcas adicionales**: Valtra, Landini, McCormick, Same, Lamborghini, Antonio Carraro, Goldoni, Arbos, Solis, Mahindra, Tafe

### 🏭 Maquinaria Industrial
- **Marcas de maquinaria industrial en Venezuela**: Foton, Mack, Volvo, Dina, Iveco, Dongfeng, JAC, Hino, Isuzu, Maxus, Mercedes-Benz, Scania, MAN, Freightliner, Kenworth, International, Caterpillar, Chevrolet
- **Maquinaria pesada adicional**: Cat, Komatsu, XCMG, John Deere, Sany, Volvo CE, Liebherr, Hitachi, Doosan, Hyundai, JCB, Bobcat, Case
- **Equipos de corte y soldadura**: Miller, Hypertherm, ESAB, Lincoln Electric, Fronius, Kemppi
- **Marcas locales venezolanas**: Agrometal, Bombagua, Induveca, INVEVAL, Metalúrgica Venezolana, Industrias Venoco, Maquinarias del Sur, Equipos Industriales CA

## 🚀 Proceso de Implementación

### 1. Archivos Actualizados

#### Frontend
- **`src/data/vehicleBrands.ts`**: Actualizado con las marcas específicas de Venezuela organizadas por tipo de vehículo.

#### Backend
- **`backend/src/controllers/productController.ts`**: Actualizado el controlador para incluir las nuevas marcas en la API.
- **`backend/src/scripts/seedVenezuelaBrands.ts`**: Script completo para poblar la base de datos con las marcas venezolanas.

### 2. Script de Población de Base de Datos

#### Ejecución del Script

```bash
# Desde el directorio backend
npm run seed:venezuela-brands

# O directamente con ts-node
npx ts-node src/scripts/seedVenezuelaBrands.ts

# O usando el script de Node.js
node seed-venezuela-brands.js
```

#### Características del Script

- **Conexión automática**: Se conecta automáticamente a MongoDB usando la variable de entorno `MONGODB_URI`
- **Verificación de tipos de vehículos**: Verifica que existan los tipos de vehículos en la base de datos
- **Creación/Actualización inteligente**: 
  - Crea nuevas marcas si no existen
  - Actualiza marcas existentes agregando nuevos tipos de vehículos
  - Evita duplicados
- **Información detallada**: Incluye país de origen y descripción para cada marca
- **Estadísticas**: Muestra estadísticas finales del proceso

### 3. Estructura de Datos

Cada marca se almacena con la siguiente información:
```typescript
{
  name: string;           // Nombre de la marca
  description: string;    // Descripción de la marca
  country: string;        // País de origen
  vehicleTypes: ObjectId[]; // Tipos de vehículos asociados
  isActive: boolean;      // Estado activo/inactivo
  createdAt: Date;        // Fecha de creación
  updatedAt: Date;        // Fecha de actualización
}
```

## 📊 Estadísticas de Marcas

### Total de Marcas por Tipo de Vehículo

- **Automóviles**: 26 marcas
- **Motocicletas**: 22 marcas
- **Camiones**: 18 marcas
- **Maquinaria Agrícola**: 20 marcas
- **Maquinaria Industrial**: 38 marcas

### Total General: 124 marcas únicas

## 🔧 Uso en el Sistema

### API Endpoints

```http
GET /api/products/brands/automovil
GET /api/products/brands/motocicleta
GET /api/products/brands/camion
GET /api/products/brands/maquinaria_agricola
GET /api/products/brands/maquinaria_industrial
```

### Frontend

```typescript
import { getBrandsByVehicleType } from './data/vehicleBrands';

// Obtener marcas para un tipo de vehículo específico
const motoBrands = getBrandsByVehicleType('motocicleta');
const carBrands = getBrandsByVehicleType('automovil');
```

## ✅ Verificación

Para verificar que el proceso funcionó correctamente:

1. **Ejecutar el script de población**:
   ```bash
   npm run seed:venezuela-brands
   ```

2. **Verificar en la base de datos**:
   ```javascript
   // En MongoDB
   db.brands.find().count() // Debe mostrar el total de marcas
   db.brands.find({vehicleTypes: ObjectId("...")}) // Por tipo de vehículo
   ```

3. **Probar la API**:
   ```bash
   curl http://localhost:5000/api/products/brands/motocicleta
   ```

## 🎯 Beneficios

- **Mercado local**: Marcas específicas del mercado venezolano
- **Cobertura completa**: Todos los tipos de vehículos relevantes
- **Información detallada**: País de origen y descripción de cada marca
- **Escalabilidad**: Fácil agregar nuevas marcas en el futuro
- **Consistencia**: Datos estructurados y normalizados

## 🔄 Mantenimiento

Para agregar nuevas marcas en el futuro:

1. Actualizar el archivo `src/data/vehicleBrands.ts`
2. Actualizar el controlador `backend/src/controllers/productController.ts`
3. Actualizar el script `backend/src/scripts/seedVenezuelaBrands.ts`
4. Ejecutar el script de población

## 📝 Notas Importantes

- Las marcas venezolanas (Bera, Vefase, Agrometal, etc.) están marcadas con país "Venezuela"
- Las marcas chinas populares en Venezuela están incluidas (Foton, Dongfeng, JAC, etc.)
- Se mantiene compatibilidad con marcas internacionales existentes
- El script es idempotente: se puede ejecutar múltiples veces sin problemas
