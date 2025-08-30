# Solución al Error de Google OAuth: redirect_uri_mismatch

## 🔍 Diagnóstico del Problema

El error `Error 400: redirect_uri_mismatch` indica que la URL de redirección configurada en Google Cloud Console no coincide con la que está usando tu aplicación.

## 🛠️ Solución Paso a Paso

### 1. **Verificar Variables de Entorno**

Asegúrate de que tu archivo `.env` en el backend contenga:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 2. **Configurar Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Encuentra tu **OAuth 2.0 Client ID** y haz clic en él
5. En la sección **Authorized redirect URIs**, agrega estas URLs:

```
http://localhost:5000/api/auth/google/callback
http://localhost:3000/google-callback
```

### 3. **Verificar Configuración con Script**

Ejecuta el script de verificación:

```bash
cd backend
node scripts/verify-google-oauth.js
```

### 4. **Verificar Rutas del Backend**

Las rutas deben estar configuradas así:

```typescript
// backend/src/routes/authRoutes.ts
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }),
  AuthController.googleCallback
);
```

### 5. **Verificar Configuración de Passport**

```typescript
// backend/src/config/passport.ts
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL, // http://localhost:5000/api/auth/google/callback
      scope: ['profile', 'email'],
      passReqToCallback: true
    },
    // ... callback function
  )
);
```

## 🔧 Pasos de Verificación

### Paso 1: Verificar Variables de Entorno
```bash
cd backend
node scripts/verify-google-oauth.js
```

### Paso 2: Verificar URLs en Google Cloud Console
- **Authorized redirect URIs** debe contener:
  - `http://localhost:5000/api/auth/google/callback`
  - `http://localhost:3000/google-callback`

### Paso 3: Verificar que el Servidor Esté Corriendo
```bash
# Backend en puerto 5000
cd backend
npm run dev

# Frontend en puerto 3000
cd ..
npm run dev
```

### Paso 4: Probar el Flujo
1. Ve a `http://localhost:3000`
2. Haz clic en "Iniciar sesión con Google"
3. Deberías ser redirigido a Google
4. Después de autorizar, deberías volver a `http://localhost:3000/google-callback`

## 🚨 Errores Comunes y Soluciones

### Error 1: "redirect_uri_mismatch"
**Causa**: URL de redirección no coincide
**Solución**: 
- Verificar que la URL esté en Google Cloud Console
- Asegurar que coincida exactamente (incluyendo http/https)

### Error 2: "invalid_client"
**Causa**: Client ID o Secret incorrectos
**Solución**:
- Verificar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
- Asegurar que estén correctamente copiados

### Error 3: "access_denied"
**Causa**: Usuario canceló la autorización
**Solución**: Normal, el usuario puede intentar de nuevo

### Error 4: "invalid_request"
**Causa**: Parámetros faltantes o incorrectos
**Solución**:
- Verificar que todas las variables de entorno estén configuradas
- Reiniciar el servidor después de cambios

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env`
- [ ] URLs agregadas en Google Cloud Console
- [ ] Servidor backend corriendo en puerto 5000
- [ ] Servidor frontend corriendo en puerto 3000
- [ ] Script de verificación ejecutado sin errores
- [ ] Rutas de autenticación configuradas correctamente

## 🔄 Reinicio del Sistema

Después de hacer cambios:

1. **Detener servidores**:
   ```bash
   # Ctrl+C en ambos terminales
   ```

2. **Reiniciar backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Reiniciar frontend**:
   ```bash
   cd ..
   npm run dev
   ```

4. **Probar autenticación**:
   - Ir a `http://localhost:3000`
   - Intentar "Iniciar sesión con Google"

## 🆘 Si el Problema Persiste

### Verificar Logs del Backend
```bash
cd backend
npm run dev
# Revisar logs en la consola
```

### Verificar Logs del Frontend
```bash
# Abrir DevTools en el navegador
# Ir a Console y Network
# Intentar login y revisar errores
```

### Verificar Configuración de Google Cloud
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Verificar que el proyecto esté activo
3. Verificar que la API de Google+ esté habilitada
4. Verificar que las credenciales estén correctas

## 📞 Contacto para Soporte

Si el problema persiste después de seguir todos los pasos:

1. Ejecutar el script de verificación
2. Tomar captura de pantalla del error
3. Revisar logs del servidor
4. Verificar configuración en Google Cloud Console

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
