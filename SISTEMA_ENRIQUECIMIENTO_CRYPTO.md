# Sistema de Enriquecimiento de Datos con Criptografía

## 🎯 Descripción

Sistema completo para que administradores capturen fotos de locales con GPS, las suban a Cloudinary y automaticamente se enriquezcan con datos de fuentes gratuitas usando OCR, MercadoLibre API, DuckDuckGo y más.

## 🔐 Características de Seguridad

### Backend (Node.js + Express)
- **Autenticación Crypto**: Tokens JWT-like firmados con HMAC-SHA256
- **Hash de Contraseñas**: PBKDF2 con salt para máxima seguridad
- **Middleware de Autorización**: Solo admins pueden acceder a funcionalidades de enriquecimiento
- **Almacenamiento Seguro**: Fotos subidas directamente a Cloudinary

### Frontend (React Native + Expo)
- **SecureStore**: Almacenamiento seguro de tokens en dispositivo
- **Navegación Condicional**: Solo admins ven pantallas de enriquecimiento
- **Captura GPS**: Ubicación precisa con permisos de usuario

## 🏗️ Arquitectura

### Backend
```
backend/src/
├── models/StorePhoto.ts          # Modelo MongoDB para fotos
├── utils/cryptoAuth.ts           # Utilidades de criptografía
├── middleware/cryptoAuthMiddleware.ts  # Middleware de autenticación
├── controllers/
│   ├── cryptoAuthController.ts   # Controlador de autenticación
│   └── storePhotoController.ts   # Controlador de fotos
├── services/enrichmentWorker.ts  # Worker de enriquecimiento
├── routes/
│   ├── cryptoAuthRoutes.ts       # Rutas de autenticación
│   └── storePhotoRoutes.ts       # Rutas de fotos
└── config/cloudinary.ts          # Configuración Cloudinary
```

### Frontend
```
mobile/src/
├── contexts/CryptoAuthContext.tsx    # Contexto de autenticación
├── services/cryptoAuthService.ts     # Servicio de API
├── screens/
│   ├── auth/CryptoLoginScreen.tsx    # Login crypto
│   └── admin/
│       ├── StorePhotoCaptureScreen.tsx  # Captura de fotos
│       └── StorePhotosListScreen.tsx    # Lista de fotos
└── navigation/CryptoAppNavigator.tsx # Navegación crypto
```

## 🚀 Instalación y Configuración

### 1. Backend

```bash
cd backend
npm install tesseract.js
```

### 2. Variables de Entorno (.env)

```env
# Cloudinary (ya configurado)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# JWT Secret para crypto auth
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### 3. Frontend

```bash
cd mobile
npx expo install expo-secure-store
```

## 📱 Uso del Sistema

### 1. Iniciar Backend

```bash
cd backend
npm run dev
```

### 2. Iniciar App Móvil

```bash
cd mobile
npx expo start
```

### 3. Usar Sistema Crypto

- Ejecutar `CryptoApp.tsx` en lugar de `App.tsx`
- Login con credenciales de admin
- Capturar fotos con GPS
- Ver resultados de enriquecimiento

## 🔧 API Endpoints

### Autenticación Crypto
- `POST /api/crypto-auth/login` - Login con crypto
- `POST /api/crypto-auth/register` - Registro con crypto
- `GET /api/crypto-auth/verify` - Verificar token
- `GET /api/crypto-auth/profile` - Obtener perfil

### Fotos de Locales
- `POST /api/store-photos/upload` - Subir foto (admin)
- `GET /api/store-photos` - Listar fotos
- `GET /api/store-photos/:id` - Obtener foto específica
- `DELETE /api/store-photos/:id` - Eliminar foto

### Enriquecimiento (Solo Admin)
- `POST /api/store-photos/admin/enrichment/run` - Ejecutar enriquecimiento
- `GET /api/store-photos/admin/enrichment/stats` - Estadísticas
- `POST /api/store-photos/admin/worker/control` - Controlar worker

## 🤖 Worker de Enriquecimiento

### Procesamiento Automático
- **OCR**: Tesseract.js para extraer texto de carteles
- **MercadoLibre**: API gratuita para buscar referencias
- **DuckDuckGo**: Búsqueda web gratuita
- **Instagram**: Simulación de búsqueda (extensible)

### Estados de Procesamiento
- `pending` - Esperando procesamiento
- `processing` - En proceso de enriquecimiento
- `enriched` - Completado exitosamente
- `error` - Error en el procesamiento

## 📊 Modelo de Datos

```javascript
{
  name: String,           // Nombre del local
  phone: String,          // Teléfono (opcional)
  imageUrl: String,       // URL de Cloudinary
  lat: Number,           // Latitud GPS
  lng: Number,           // Longitud GPS
  ocrText: String,       // Texto extraído por OCR
  metrics: {
    mercadoLibre: {      // Resultados MercadoLibre
      found: Boolean,
      results: Array,
      searchTerm: String,
      lastUpdated: Date
    },
    duckduckgo: {        // Resultados DuckDuckGo
      found: Boolean,
      results: Object,
      searchTerm: String,
      lastUpdated: Date
    },
    instagram: {         // Resultados Instagram
      found: Boolean,
      followers: Number,
      username: String,
      lastUpdated: Date
    },
    whatsapp: {          // Información WhatsApp
      found: Boolean,
      businessInfo: Object,
      lastUpdated: Date
    }
  },
  status: String,        // Estado del procesamiento
  uploadedBy: ObjectId,  // Usuario que subió la foto
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Pruebas

### Script de Prueba Automática

```bash
node test-crypto-system.js
```

Este script prueba:
- Login con autenticación crypto
- Subida de foto a Cloudinary
- Ejecución de enriquecimiento
- Verificación de resultados

### Pruebas Manuales

1. **Login Admin**: Usar credenciales de administrador
2. **Capturar Foto**: Tomar foto con GPS habilitado
3. **Verificar Subida**: Confirmar que se sube a Cloudinary
4. **Ejecutar Enriquecimiento**: Disparar proceso manualmente
5. **Ver Resultados**: Revisar métricas obtenidas

## 🔒 Seguridad Implementada

### Criptografía
- **PBKDF2**: Hash de contraseñas con 100,000 iteraciones
- **HMAC-SHA256**: Firma de tokens JWT-like
- **Salt Aleatorio**: 16 bytes de salt por contraseña
- **Tokens Firmados**: Verificación de integridad

### Autorización
- **Middleware de Roles**: Solo admins acceden a enriquecimiento
- **Verificación de Token**: Validación en cada request
- **Permisos Granulares**: Control por funcionalidad

### Almacenamiento
- **SecureStore**: Tokens en almacenamiento seguro del dispositivo
- **Cloudinary**: Fotos en CDN seguro
- **MongoDB**: Datos encriptados en tránsito

## 📈 Monitoreo y Logs

### Logs del Worker
- Progreso de OCR
- Resultados de APIs externas
- Errores de procesamiento
- Estadísticas de rendimiento

### Métricas Disponibles
- Total de fotos procesadas
- Fotos por estado
- Tiempo de procesamiento
- Tasa de éxito

## 🚀 Próximas Mejoras

### Funcionalidades Adicionales
- [ ] Integración real con Instagram API
- [ ] Búsqueda en Google Maps API
- [ ] Análisis de sentimientos en reseñas
- [ ] Detección de objetos con IA
- [ ] Notificaciones push de resultados

### Optimizaciones
- [ ] Cache de resultados de APIs
- [ ] Procesamiento en lotes
- [ ] Compresión de imágenes
- [ ] CDN para imágenes optimizadas

## 🆘 Solución de Problemas

### Errores Comunes

1. **Error de Cloudinary**: Verificar credenciales en .env
2. **Token Inválido**: Verificar JWT_SECRET
3. **GPS No Disponible**: Verificar permisos de ubicación
4. **OCR Fallido**: Verificar calidad de imagen

### Logs de Debug

```bash
# Backend
cd backend && npm run dev

# Ver logs del worker
tail -f logs/enrichment.log
```

## 📞 Soporte

Para problemas o dudas:
1. Revisar logs del backend
2. Verificar configuración de Cloudinary
3. Comprobar permisos de la app móvil
4. Ejecutar script de pruebas

---

**Sistema desarrollado con tecnologías modernas y mejores prácticas de seguridad.**
