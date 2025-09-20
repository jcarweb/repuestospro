// Configuración de Google OAuth
// IMPORTANTE: Necesitas configurar estas credenciales en Google Cloud Console

export const GOOGLE_CONFIG = {
  // Obtén estas credenciales desde: https://console.cloud.google.com/
  CLIENT_ID: '85298102499-p19rfmi23b119lt2jqrllei7u129q6en.apps.googleusercontent.com', // Tu Client ID real
  
  // NOTA: Para aplicaciones móviles Android, Google NO proporciona Client Secret
  // El Client Secret solo se usa en aplicaciones web por seguridad
  
  // NOTA: Para Android NO necesitas configurar URIs de redirección
  // Google usa el package name y SHA-1 fingerprint para verificar la app
  REDIRECT_URI: 'piezasya://auth', // Solo para compatibilidad con el código
  
  // Scopes solicitados
  SCOPES: ['openid', 'profile', 'email'],
};

// Instrucciones para configurar Google OAuth:
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Habilita la API de Google+ 
// 4. Ve a "Credenciales" y crea una nueva credencial OAuth 2.0
// 5. Configura los URIs de redirección autorizados:
//    - piezasya://auth (para la app móvil)
//    - http://localhost:3000/auth/google/callback (para desarrollo web)
// 6. Copia el Client ID y Client Secret aquí

export default GOOGLE_CONFIG;
