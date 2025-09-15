# 🚀 Configuración Rápida de Google OAuth

## ⚠️ Error Actual
El botón "Continuar con Google" muestra "Login con Google no disponible" porque las credenciales no están configuradas.

## 🔧 Solución Paso a Paso

### 1. Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### 2. Crear Credenciales OAuth 2.0
1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** > **ID de cliente de OAuth** (OAuth client ID)
3. En **"Tipo de aplicación"**, selecciona **"Android"**
4. Configura:
   - **Nombre**: `PiezasYA Mobile` (opcional)
   - **Package name**: `com.piezasya.mobile`
   - **SHA-1 certificate fingerprint**: (ver instrucciones abajo)

### 3. Obtener SHA-1 Fingerprint (Android)
```bash
# Para desarrollo
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# En Windows (si tienes Java instalado)
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 4. Configurar URIs de Redirección (OPCIONAL para Android)
**Nota:** Para aplicaciones Android, Google NO requiere configurar URIs de redirección.
Google usa el package name y SHA-1 fingerprint para verificar la autenticidad de la app.

**IMPORTANTE:** Si obtienes error 400, configura los URIs de redirección:

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en tu **OAuth 2.0 Client ID**
3. En la sección **"Authorized redirect URIs"**, agrega:
   ```
   piezasya://auth
   ```
4. Haz clic en **"Save"**

Si quieres configurar URIs de redirección (opcional), agrega:
```
piezasya://auth
```

### 5. Actualizar Configuración en la App
1. Abre `mobile/src/config/google.ts`
2. Reemplaza las credenciales:

```typescript
export const GOOGLE_CONFIG = {
  CLIENT_ID:'your_google_client_id_here', // Ejemplo: 123456789-abcdef.apps.googleusercontent.com
  CLIENT_SECRET: 'TU_CLIENT_SECRET_AQUI',
  REDIRECT_URI: 'piezasya://auth',
  SCOPES: ['openid', 'profile', 'email'],
};
```

### 6. Reactivar Google OAuth
1. Abre `mobile/src/screens/auth/LoginScreen.tsx`
2. Busca la función `handleGoogleLogin`
3. Reemplaza el código temporal con el código original (que está comentado)

## 🎯 Resultado
Después de configurar las credenciales, el botón "Continuar con Google" funcionará correctamente.

## 📱 Probar
1. Reinicia la aplicación: `npx expo start --clear`
2. Ve a la pantalla de login
3. Toca "Continuar con Google"
4. Deberías ver la pantalla de selección de cuenta de Google

## 🆘 Si tienes problemas
- Verifica que el SHA-1 fingerprint sea correcto
- Asegúrate de que el package name coincida
- Confirma que las APIs estén habilitadas
- Verifica que el URI de redirección esté configurado

## 📞 Soporte
Si necesitas ayuda, consulta la documentación completa en `mobile/GOOGLE_OAUTH_SETUP.md`
