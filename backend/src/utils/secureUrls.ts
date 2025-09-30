/**
 * Utilidad para manejar URLs y direcciones IP de forma segura
 * Previene exposición de información de red y proporciona configuración segura
 */

interface NetworkConfig {
  frontendUrl: string;
  backendUrl: string;
  allowedOrigins: string[];
  isProduction: boolean;
}

class SecureUrlManager {
  private config: NetworkConfig;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env['NODE_ENV'] === 'production';
    this.config = this.buildNetworkConfig();
  }

  /**
   * Construye la configuración de red segura
   */
  private buildNetworkConfig(): NetworkConfig {
    return {
      frontendUrl: this.getSecureFrontendUrl(),
      backendUrl: this.getSecureBackendUrl(),
      allowedOrigins: this.getAllowedOrigins(),
      isProduction: this.isProduction
    };
  }

  /**
   * Obtiene la URL del frontend de forma segura
   */
  private getSecureFrontendUrl(): string {
    const envUrl = process.env['FRONTEND_URL'];
    
    if (envUrl && !this.isInsecureUrl(envUrl)) {
      return envUrl;
    }
    
    // URL por defecto segura para desarrollo
    return 'http://localhost:3000';
  }

  /**
   * Obtiene la URL del backend de forma segura
   */
  private getSecureBackendUrl(): string {
    const envUrl = process.env['BACKEND_URL'];
    
    if (envUrl && !this.isInsecureUrl(envUrl)) {
      return envUrl;
    }
    
    // URL por defecto segura para desarrollo
    return 'http://localhost:5000';
  }

  /**
   * Obtiene los orígenes permitidos de forma segura
   */
  getAllowedOrigins(): string[] {
    const corsOrigin = process.env['CORS_ORIGIN'];
    
    if (corsOrigin && corsOrigin !== '*') {
      return corsOrigin.split(',').map(origin => origin.trim());
    }
    
    if (this.isProduction) {
      throw new Error('CORS_ORIGIN debe estar configurado en producción');
    }
    
    // Orígenes por defecto seguros para desarrollo
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
  }

  /**
   * Verifica si una URL es insegura
   */
  private isInsecureUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return true;
    
    const insecurePatterns = [
      'localhost',
      '127.0.0.1',
      '192.168.',
      '10.0.',
      '172.16.',
      '0.0.0.0'
    ];
    
    return insecurePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Obtiene la configuración de red
   */
  getNetworkConfig(): NetworkConfig {
    return this.config;
  }

  /**
   * Obtiene la URL del frontend
   */
  getFrontendUrl(): string {
    return this.config.frontendUrl;
  }

  /**
   * Obtiene la URL del backend
   */
  getBackendUrl(): string {
    return this.config.backendUrl;
  }



  /**
   * Verifica si un origen está permitido
   */
  isOriginAllowed(origin: string): boolean {
    if (this.config.allowedOrigins.includes('*')) {
      return true;
    }
    
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Obtiene la configuración de CORS segura
   */
  getCorsConfig(): { origin: string | string[]; credentials: boolean } {
    if (this.isProduction) {
      return {
        origin: this.config.allowedOrigins,
        credentials: true
      };
    }
    
    return {
      origin: this.config.allowedOrigins,
      credentials: true
    };
  }

  /**
   * Genera URLs seguras para diferentes entornos
   */
  generateSecureUrls(): {
    frontend: string;
    backend: string;
    api: string;
    websocket: string;
  } {
    const frontend = this.config.frontendUrl;
    const backend = this.config.backendUrl;
    
    return {
      frontend,
      backend,
      api: `${backend}/api`,
      websocket: backend.replace('http', 'ws')
    };
  }

  /**
   * Valida que la configuración de red esté lista para producción
   */
  validateNetworkConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar URLs
    if (this.isInsecureUrl(this.config.frontendUrl)) {
      errors.push('FRONTEND_URL no puede ser localhost en producción');
    }

    if (this.isInsecureUrl(this.config.backendUrl)) {
      errors.push('BACKEND_URL no puede ser localhost en producción');
    }

    // Validar orígenes CORS
    if (this.config.allowedOrigins.includes('*')) {
      errors.push('CORS_ORIGIN no puede ser "*" en producción');
    }

    // Verificar que las URLs sean HTTPS en producción
    if (this.isProduction) {
      if (!this.config.frontendUrl.startsWith('https://')) {
        errors.push('FRONTEND_URL debe usar HTTPS en producción');
      }
      
      if (!this.config.backendUrl.startsWith('https://')) {
        errors.push('BACKEND_URL debe usar HTTPS en producción');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Genera un reporte de configuración de red
   */
  generateNetworkReport(): string {
    const report: string[] = [];
    const validation = this.validateNetworkConfig();
    
    report.push('=== REPORTE DE CONFIGURACIÓN DE RED ===\n');
    
    // URLs principales
    report.push('🌐 URLs PRINCIPALES:');
    report.push(`Frontend: ${this.config.frontendUrl}`);
    report.push(`Backend: ${this.config.backendUrl}`);
    report.push(`API: ${this.config.backendUrl}/api\n`);
    
    // Orígenes permitidos
    report.push('🔒 ORÍGENES PERMITIDOS:');
    this.config.allowedOrigins.forEach(origin => {
      report.push(`  - ${origin}`);
    });
    report.push('');
    
    // Estado de seguridad
    report.push('🛡️ ESTADO DE SEGURIDAD:');
    report.push(`HTTPS: ${this.config.frontendUrl.startsWith('https://') ? '✅' : '❌'}`);
    report.push(`Producción: ${this.isProduction ? '✅' : '❌'}`);
    report.push(`CORS Seguro: ${!this.config.allowedOrigins.includes('*') ? '✅' : '❌'}\n`);
    
    // Errores y advertencias
    if (validation.errors.length > 0) {
      report.push('❌ ERRORES:');
      validation.errors.forEach(error => report.push(`  - ${error}`));
      report.push('');
    }
    
    if (validation.warnings.length > 0) {
      report.push('⚠️ ADVERTENCIAS:');
      validation.warnings.forEach(warning => report.push(`  - ${warning}`));
      report.push('');
    }
    
    return report.join('\n');
  }
}

// Instancia singleton
export const secureUrls = new SecureUrlManager();

// Exportar también la clase para testing
export { SecureUrlManager };
