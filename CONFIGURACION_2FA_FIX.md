# Configuración para Solucionar Problemas de 2FA y 404

## Problemas Solucionados

### 1. 2FA no se mostraba
**Causa**: El backend en Vercel estaba usando un controlador de autenticación simplificado que no implementaba 2FA.

**Solución aplicada**:
- Actualizado `backend/build-working.js` para simular 2FA habilitado para el usuario admin
- Agregado endpoint `/api/auth/login/2fa/complete` para completar la verificación 2FA
- Actualizado el componente `TwoFactorVerification.tsx` para usar la URL correcta del backend

### 2. Error 404 en admin dashboard
**Causa**: Configuración incorrecta de rutas en Vercel.

**Solución aplicada**:
- Creado archivo `vercel.json` con configuración correcta de rutas
- Configurado redirección de todas las rutas a `index.html` para SPA

### 3. Error de módulos JavaScript (MIME type)
**Causa**: Vercel estaba sirviendo HTML en lugar de JavaScript para archivos de módulos.

**Solución aplicada**:
- Actualizado `vercel.json` con configuración específica para archivos estáticos
- Mejorado `vite.config.ts` para mejor generación de chunks
- Creado archivo `public/_redirects` como alternativa
- Creado `vercel-simple.json` como configuración alternativa

## Archivos Modificados

1. `backend/build-working.js` - Agregado soporte para 2FA
2. `src/components/TwoFactorVerification.tsx` - Actualizada URL del backend
3. `vercel.json` - Configuración de rutas para Vercel
4. `vite.config.ts` - Mejorada configuración de build
5. `public/_redirects` - Archivo de redirección alternativo
6. `vercel-simple.json` - Configuración alternativa de Vercel
7. `env.example` - Actualizada URL del backend

## Configuración Requerida

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
# URL del Backend en Producción
VITE_API_URL=https://piezasya-back.onrender.com/api

# Google Maps API Key (necesitas obtener esta clave)
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Cloudinary (REEMPLAZAR CON TUS CREDENCIALES)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset

# Notificaciones Push (REEMPLAZAR CON TU CLAVE)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

## Cómo Probar

1. **Para 2FA**:
   - Usa las credenciales: `admin@repuestospro.com` / `Test123!`
   - Ahora debería aparecer el modal de 2FA
   - Ingresa cualquier código (para testing, acepta cualquier código)

2. **Para Admin Dashboard**:
   - Después de completar el 2FA, debería redirigir correctamente a `/admin/dashboard`
   - Ya no debería aparecer el error 404

## Despliegue

1. Ejecuta `npm run build` para construir el frontend
2. Ejecuta `cd backend && node build-working.js` para construir el backend
3. Despliega ambos en sus respectivos servicios

## Solución para Error de MIME Type

Si sigues viendo el error de MIME type, prueba estas opciones:

### Opción 1: Usar vercel-simple.json
1. Renombra `vercel.json` a `vercel-complex.json`
2. Renombra `vercel-simple.json` a `vercel.json`
3. Redespliega

### Opción 2: Verificar configuración de Vercel
1. En el dashboard de Vercel, ve a Settings > Functions
2. Asegúrate de que "Serverless Functions" esté habilitado
3. Verifica que el "Build Command" sea `npm run build`
4. Verifica que el "Output Directory" sea `dist`

### Opción 3: Limpiar cache
1. En Vercel, ve a Settings > General
2. Haz clic en "Clear Build Cache"
3. Redespliega el proyecto

## Notas Importantes

- El 2FA está configurado para testing y acepta cualquier código
- En producción, necesitarás implementar un sistema real de 2FA con códigos TOTP
- La URL del backend está configurada para `https://piezasya-back.onrender.com/api`
- Asegúrate de que el backend esté desplegado y funcionando antes de probar
