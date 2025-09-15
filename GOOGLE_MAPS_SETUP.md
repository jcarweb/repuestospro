# Configuración de Google Maps para Geolocalización

## 🗺️ Configuración Requerida

Para que el sistema de geolocalización funcione correctamente, necesitas configurar la API de Google Maps.

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Ve a "Credentials" y crea una nueva API Key
5. Restringe la API Key a tu dominio por seguridad

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto frontend con:

```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development
```

### 3. Funcionalidades Implementadas

#### 🏪 Registro de Tiendas con Mapa Interactivo
- **Componente:** `StoreLocationMap.tsx`
- **Funcionalidades:**
  - Mapa interactivo de Google Maps
  - Selección de ubicación por clic
  - Búsqueda de direcciones
  - Obtención de ubicación actual
  - Geocodificación automática
  - Validación de coordenadas

#### 🔍 Búsqueda por Proximidad GPS
- **Componente:** `LocationBasedSearch.tsx`
- **Funcionalidades:**
  - Búsqueda en rangos de 5-50 km (5-10 km recomendado)
  - Ordenamiento por distancia
  - Filtros por categoría y marca
  - Cálculo de distancias precisas
  - Información de tiendas cercanas

#### 📍 Importancia de las Coordenadas GPS

**¿Por qué son cruciales las coordenadas GPS?**

1. **Búsqueda Precisa:** Los clientes encuentran tiendas exactas
2. **Rangos Optimizados:** 5-10 km para búsquedas eficientes
3. **Comparación de Distancias:** Ordenamiento por proximidad
4. **Mejor Experiencia:** Reduce tiempo y costos de transporte
5. **Ubicación Exacta:** Coordenadas específicas vs. direcciones aproximadas

### 4. Estructura de Datos

#### Coordenadas de Tienda
```typescript
coordinates: {
  latitude: number;  // Ej: 10.4806
  longitude: number; // Ej: -66.9036
}
```

#### Búsqueda por Ubicación
```typescript
// Parámetros de búsqueda
{
  latitude: number;   // Ubicación del cliente
  longitude: number;  // Ubicación del cliente
  radius: number;     // Radio en km (5-50)
  category?: string;  // Filtro opcional
  brand?: string;     // Filtro opcional
}
```

### 5. Endpoints del Backend

#### Búsqueda de Productos por Ubicación
```
GET /api/products/nearby
Query params: latitude, longitude, radius, category, brand, limit
```

#### Registro de Tienda
```
POST /api/stores
Body: {
  name, description, address, city, state, zipCode,
  phone, email, coordinates, businessHours, settings
}
```

### 6. Optimizaciones Implementadas

1. **Índices Geográficos:** MongoDB con índices 2dsphere
2. **Cálculo de Distancias:** Fórmula de Haversine
3. **Caché de Ubicaciones:** Reducción de llamadas a API
4. **Rangos Inteligentes:** 5-10 km por defecto
5. **Ordenamiento Eficiente:** Por distancia y popularidad

### 7. Seguridad

- API Key restringida por dominio
- Validación de coordenadas en frontend y backend
- Sanitización de datos de entrada
- Límites en rangos de búsqueda

### 8. Próximos Pasos

1. Configurar API Key de Google Maps
2. Probar funcionalidad de registro de tiendas
3. Verificar búsqueda por proximidad
4. Optimizar índices de base de datos
5. Implementar caché de geocodificación

---

**Nota:** Sin la API Key de Google Maps, el mapa no se cargará y mostrará un error. Es esencial para el funcionamiento completo del sistema de geolocalización.
