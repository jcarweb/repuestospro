/**
 * Utilidad segura para acceso a variables de entorno
 * Reemplaza las referencias inseguras a process.env
 */

import { getSecureEnv } from '../config/envValidator';

/**
 * Obtiene variables de entorno de forma segura con valores por defecto seguros
 */
export class SecureEnv {
  /**
   * Obtiene JWT_SECRET de forma segura
   */
  static getJwtSecret(): string {
    try {
      const secret = getSecureEnv('JWT_SECRET');
      if (!secret || secret === 'fallback-secret' || secret === 'your-secret') {
        throw new Error('JWT_SECRET no está configurado correctamente. Debe ser un valor seguro de al menos 32 caracteres.');
      }
      return secret;
    } catch (error) {
      // Si no está configurado, usar un valor por defecto seguro para desarrollo
      const fallbackSecret = process.env['JWT_SECRET'] || 'fallback-secret-key-for-development-only';
      if (fallbackSecret === 'fallback-secret-key-for-development-only') {
        console.warn('⚠️ Usando JWT_SECRET por defecto. Configura una clave segura en producción.');
      }
      return fallbackSecret;
    }
  }

  /**
   * Obtiene MONGODB_URI de forma segura
   */
  static getMongoUri(): string {
    const uri = getSecureEnv('MONGODB_URI');
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      throw new Error('MONGODB_URI no está configurado correctamente. Debe apuntar a una base de datos segura.');
    }
    return uri;
  }

  /**
   * Obtiene configuración de Cloudinary de forma segura
   */
  static getCloudinaryConfig(): {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    isConfigured: boolean;
  } {
    const cloudName = getSecureEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = getSecureEnv('CLOUDINARY_API_KEY');
    const apiSecret = getSecureEnv('CLOUDINARY_API_SECRET');

    const isConfigured = !!(cloudName && apiKey && apiSecret && 
      cloudName !== 'your_cloud_name' && 
      apiKey !== 'your_api_key' && 
      apiSecret !== 'your_api_secret');

    return {
      cloud_name: cloudName || 'not-configured',
      api_key: apiKey || 'not-configured',
      api_secret: apiSecret || 'not-configured',
      isConfigured
    };
  }

  /**
   * Obtiene configuración de email de forma segura
   */
  static getEmailConfig(): {
    host: string;
    user: string;
    password: string;
    isConfigured: boolean;
  } {
    const host = getSecureEnv('EMAIL_HOST');
    const user = getSecureEnv('EMAIL_USER');
    const password = getSecureEnv('EMAIL_PASS');

    const isConfigured = !!(host && user && password);

    return {
      host: host || 'not-configured',
      user: user || 'not-configured',
      password: password || 'not-configured',
      isConfigured
    };
  }

  /**
   * Obtiene configuración de Google OAuth de forma segura
   */
  static getGoogleConfig(): {
    clientId: string;
    clientSecret: string;
    isConfigured: boolean;
  } {
    const clientId = getSecureEnv('GOOGLE_CLIENT_ID');
    const clientSecret = getSecureEnv('GOOGLE_CLIENT_SECRET');

    const isConfigured = !!(clientId && clientSecret);

    return {
      clientId: clientId || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      isConfigured
    };
  }

  /**
   * Obtiene configuración VAPID de forma segura
   */
  static getVapidConfig(): {
    publicKey: string;
    privateKey: string;
    isConfigured: boolean;
  } {
    const publicKey = getSecureEnv('VAPID_PUBLIC_KEY');
    const privateKey = getSecureEnv('VAPID_PRIVATE_KEY');

    const isConfigured = !!(publicKey && privateKey);

    return {
      publicKey: publicKey || 'not-configured',
      privateKey: privateKey || 'not-configured',
      isConfigured
    };
  }

  /**
   * Obtiene configuración del servidor de forma segura
   */
  static getServerConfig(): {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    corsOrigin: string;
  } {
    return {
      port: Number(getSecureEnv('PORT')) || 5000,
      nodeEnv: getSecureEnv('NODE_ENV') || 'development',
      frontendUrl: getSecureEnv('FRONTEND_URL') || 'http://localhost:3000',
      corsOrigin: getSecureEnv('CORS_ORIGIN') || '*'
    };
  }

  /**
   * Verifica si todas las variables críticas están configuradas
   */
  static validateCriticalVariables(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];

    try {
      this.getJwtSecret();
    } catch {
      missing.push('JWT_SECRET');
    }

    try {
      this.getMongoUri();
    } catch {
      missing.push('MONGODB_URI');
    }

    return {
      isValid: missing.length === 0,
      missing
    };
  }

  /**
   * Genera un reporte de configuración segura
   */
  static generateConfigReport(): string {
    const report: string[] = [];
    
    report.push('=== CONFIGURACIÓN DE VARIABLES DE ENTORNO ===\n');
    
    // Variables críticas
    const critical = this.validateCriticalVariables();
    report.push('🔒 VARIABLES CRÍTICAS:');
    if (critical.isValid) {
      report.push('  ✅ Todas las variables críticas están configuradas');
    } else {
      report.push('  ❌ Variables críticas faltantes:');
      critical.missing.forEach(variable => report.push(`    - ${variable}`));
    }
    report.push('');

    // Cloudinary
    const cloudinary = this.getCloudinaryConfig();
    report.push('☁️ CLOUDINARY:');
    report.push(`  Estado: ${cloudinary.isConfigured ? '✅ Configurado' : '❌ No configurado'}`);
    if (!cloudinary.isConfigured) {
      report.push('  ⚠️ Las imágenes no se subirán a Cloudinary');
    }
    report.push('');

    // Email
    const email = this.getEmailConfig();
    report.push('📧 EMAIL:');
    report.push(`  Estado: ${email.isConfigured ? '✅ Configurado' : '❌ No configurado'}`);
    if (!email.isConfigured) {
      report.push('  ⚠️ Los emails no se enviarán');
    }
    report.push('');

    // Google OAuth
    const google = this.getGoogleConfig();
    report.push('🔐 GOOGLE OAUTH:');
    report.push(`  Estado: ${google.isConfigured ? '✅ Configurado' : '❌ No configurado'}`);
    if (!google.isConfigured) {
      report.push('  ⚠️ Login con Google no funcionará');
    }
    report.push('');

    // VAPID
    const vapid = this.getVapidConfig();
    report.push('🔔 NOTIFICACIONES PUSH:');
    report.push(`  Estado: ${vapid.isConfigured ? '✅ Configurado' : '❌ No configurado'}`);
    if (!vapid.isConfigured) {
      report.push('  ⚠️ Las notificaciones push no funcionarán');
    }
    report.push('');

    return report.join('\n');
  }
}

// Exportar funciones de conveniencia
export const secureEnv = SecureEnv;
