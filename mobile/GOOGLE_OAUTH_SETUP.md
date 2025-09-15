# 🔐 Configuración de Google OAuth para PiezasYA Mobile

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud Console**
2. **Proyecto en Google Cloud**
3. **API de Google+ habilitada**

## 🚀 Pasos para Configurar Google OAuth

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** para usarlo más adelante

### 2. Habilitar APIs Necesarias

1. Ve a **APIs & Services** > **Library**
2. Busca y habilita las siguientes APIs:
   - **Google+ API**
   - **Google Identity API**

### 3. Configurar Credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Selecciona **Mobile application**
4. Configura los siguientes campos:

#### Para Android:
- **Package name**: `com.piezasya.mobile`
- **SHA-1 certificate fingerprint**: (Obtener con el comando de abajo)

#### Para iOS:
- **Bundle ID**: `com.piezasya.mobile`

### 4. Obtener SHA-1 Fingerprint (Android)

```bash
# Para desarrollo
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para producción (cuando tengas el keystore de producción)
keytool -list -v -keystore your-production-keystore.jks -alias your-alias
```

### 5. Configurar URIs de Redirección

En la configuración de OAuth 2.0, agrega estos URIs de redirección autorizados:

```
piezasya://auth
http://localhost:3000/auth/google/callback
https://your-domain.com/auth/google/callback
```

### 6. Actualizar Configuración en la App

1. Abre `mobile/src/config/google.ts`
2. Reemplaza las credenciales:

```typescript
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'TU_CLIENT_ID_AQUI',
  CLIENT_SECRET: 'TU_CLIENT_SECRET_AQUI',
  REDIRECT_URI: 'piezasya://auth',
  SCOPES: ['openid', 'profile', 'email'],
};
```

### 7. Configurar Backend (Opcional)

Si quieres que el backend también maneje Google OAuth:

1. Ve a **APIs & Services** > **Credentials**
2. Crea otra credencial OAuth 2.0 para **Web application**
3. Configura los URIs de redirección del backend

## 🔧 Verificación

### 1. Verificar Configuración

```bash
cd mobile
npx expo start
```

### 2. Probar Login con Google

1. Abre la app en el dispositivo/emulador
2. Ve a la pantalla de login
3. Toca el botón "Continuar con Google"
4. Deberías ver la pantalla de selección de cuenta de Google

## 🚨 Solución de Problemas

### Error: "Login con Google no disponible"

- Verifica que `GOOGLE_CLIENT_ID` esté configurado
- Asegúrate de que estés ejecutando en un dispositivo/emulador (no web)

### Error: "redirect_uri_mismatch"

- Verifica que el URI de redirección en Google Cloud Console coincida con `piezasya://auth`
- Asegúrate de que el scheme esté configurado en `app.json`

### Error: "invalid_client"

- Verifica que el Client ID sea correcto
- Asegúrate de que el package name/bundle ID coincida

## 📱 Configuración Adicional

### Para Producción

1. **Android**: Configura el keystore de producción
2. **iOS**: Configura el certificado de distribución
3. **Backend**: Usa variables de entorno para las credenciales

### Variables de Entorno

```bash
# .env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Google Cloud Console
- [ ] APIs habilitadas (Google+, Identity)
- [ ] Credenciales OAuth 2.0 configuradas
- [ ] URIs de redirección configurados
- [ ] SHA-1 fingerprint configurado (Android)
- [ ] Bundle ID configurado (iOS)
- [ ] Configuración actualizada en `google.ts`
- [ ] App probada en dispositivo/emulador
- [ ] Login con Google funcionando correctamente
