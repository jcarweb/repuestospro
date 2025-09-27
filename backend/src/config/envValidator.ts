/**
 * Validador seguro de variables de entorno
 * Previene exposición de información sensible y valida variables críticas
 */

interface EnvValidationRule {
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  defaultValue?: any;
  sensitive: boolean;
  description: string;
}

interface EnvConfig {
  [key: string]: EnvValidationRule;
}

const ENV_VALIDATION_RULES: EnvConfig = {
  // Variables críticas de seguridad
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    maxLength: 256,
    sensitive: true,
    description: 'Secreto JWT para firmar tokens'
  },
  
  MONGODB_URI: {
    required: true,
    type: 'url',
    sensitive: true,
    description: 'URI de conexión a MongoDB'
  },
  
  // Variables de Cloudinary
  CLOUDINARY_CLOUD_NAME: {
    required: false,
    type: 'string',
    sensitive: false,
    description: 'Nombre de la cuenta de Cloudinary'
  },
  
  CLOUDINARY_API_KEY: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Clave API de Cloudinary'
  },
  
  CLOUDINARY_API_SECRET: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Secreto API de Cloudinary'
  },
  
  // Variables de email
  EMAIL_HOST: {
    required: false,
    type: 'string',
    sensitive: false,
    description: 'Host del servidor de email'
  },
  
  EMAIL_USER: {
    required: false,
    type: 'email',
    sensitive: true,
    description: 'Usuario de email'
  },
  
  EMAIL_PASS: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Contraseña de email'
  },
  
  // Variables de Google OAuth
  GOOGLE_CLIENT_ID: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'ID de cliente de Google OAuth'
  },
  
  GOOGLE_CLIENT_SECRET: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Secreto de cliente de Google OAuth'
  },
  
  // Variables de VAPID
  VAPID_PUBLIC_KEY: {
    required: false,
    type: 'string',
    sensitive: false,
    description: 'Clave pública VAPID para notificaciones push'
  },
  
  VAPID_PRIVATE_KEY: {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Clave privada VAPID para notificaciones push'
  },
  
  // Variables de configuración
  NODE_ENV: {
    required: true,
    type: 'string',
    pattern: /^(development|production|test)$/,
    defaultValue: 'development',
    sensitive: false,
    description: 'Ambiente de ejecución'
  },
  
  PORT: {
    required: false,
    type: 'number',
    defaultValue: 5000,
    sensitive: false,
    description: 'Puerto del servidor'
  },
  
  FRONTEND_URL: {
    required: false,
    type: 'url',
    defaultValue: 'http://localhost:3000',
    sensitive: false,
    description: 'URL del frontend'
  },
  
  CORS_ORIGIN: {
    required: false,
    type: 'string',
    defaultValue: '*',
    sensitive: false,
    description: 'Origen permitido para CORS'
  }
};

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private validatedEnv: Record<string, any> = {};

  /**
   * Valida todas las variables de entorno
   */
  validate(): { isValid: boolean; errors: string[]; warnings: string[]; env: Record<string, any> } {
    this.errors = [];
    this.warnings = [];
    this.validatedEnv = {};

    for (const [key, rule] of Object.entries(ENV_VALIDATION_RULES)) {
      this.validateVariable(key, rule);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      env: this.validatedEnv
    };
  }

  /**
   * Valida una variable específica
   */
  private validateVariable(key: string, rule: EnvValidationRule): void {
    const value = process.env[key];
    
    // Verificar si es requerida
    if (rule.required && !value) {
      this.errors.push(`Variable requerida faltante: ${key}`);
      return;
    }

    // Usar valor por defecto si no está definida
    const finalValue = value || rule.defaultValue;
    
    if (!finalValue) {
      this.validatedEnv[key] = undefined;
      return;
    }

    // Validar tipo
    if (!this.validateType(finalValue, rule.type)) {
      this.errors.push(`Tipo inválido para ${key}: esperado ${rule.type}, recibido ${typeof finalValue}`);
      return;
    }

    // Validar longitud
    if (rule.minLength && finalValue.length < rule.minLength) {
      this.errors.push(`${key} debe tener al menos ${rule.minLength} caracteres`);
      return;
    }

    if (rule.maxLength && finalValue.length > rule.maxLength) {
      this.errors.push(`${key} debe tener máximo ${rule.maxLength} caracteres`);
      return;
    }

    // Validar patrón
    if (rule.pattern && !rule.pattern.test(finalValue)) {
      this.errors.push(`${key} no cumple con el patrón requerido`);
      return;
    }

    // Verificar valores inseguros
    if (this.isInsecureValue(finalValue)) {
      this.warnings.push(`${key} tiene un valor inseguro por defecto`);
    }

    // Guardar valor validado
    this.validatedEnv[key] = finalValue;
  }

  /**
   * Valida el tipo de una variable
   */
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value === 'true' || value === 'false';
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }

  /**
   * Verifica si un valor es inseguro
   */
  private isInsecureValue(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const insecurePatterns = [
      'your_',
      'default_',
      'test_',
      'example_',
      'localhost',
      '127.0.0.1',
      'changeme',
      'password',
      'secret',
      'key',
      'token'
    ];

    return insecurePatterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Obtiene una variable de entorno de forma segura
   */
  getSecure(key: string): any {
    const rule = ENV_VALIDATION_RULES[key];
    if (!rule) {
      throw new Error(`Variable de entorno no definida: ${key}`);
    }

    const value = this.validatedEnv[key];
    
    if (rule.sensitive && value) {
      // Para variables sensibles, solo devolver si está configurada correctamente
      if (this.isInsecureValue(value)) {
        throw new Error(`Variable sensible con valor inseguro: ${key}`);
      }
    }

    return value;
  }

  /**
   * Genera un reporte de configuración (sin información sensible)
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('=== REPORTE DE CONFIGURACIÓN DE VARIABLES DE ENTORNO ===\n');
    
    for (const [key, rule] of Object.entries(ENV_VALIDATION_RULES)) {
      const value = this.validatedEnv[key];
      const status = value ? '✅ Configurada' : '❌ No configurada';
      const sensitive = rule.sensitive ? '🔒 Sensible' : '📝 Pública';
      
      report.push(`${key}: ${status} ${sensitive}`);
      report.push(`  Descripción: ${rule.description}`);
      
      if (rule.sensitive && value) {
        report.push(`  Valor: [REDACTED]`);
      } else if (value) {
        report.push(`  Valor: ${value}`);
      }
      
      report.push('');
    }
    
    if (this.warnings.length > 0) {
      report.push('⚠️ ADVERTENCIAS:');
      this.warnings.forEach(warning => report.push(`  - ${warning}`));
      report.push('');
    }
    
    if (this.errors.length > 0) {
      report.push('❌ ERRORES:');
      this.errors.forEach(error => report.push(`  - ${error}`));
      report.push('');
    }
    
    return report.join('\n');
  }
}

// Instancia singleton
export const envValidator = new EnvValidator();

// Función de conveniencia para obtener variables de entorno de forma segura
export function getSecureEnv(key: string): any {
  return envValidator.getSecure(key);
}

// Función para validar todas las variables al inicio
export function validateEnvironment(): boolean {
  const result = envValidator.validate();
  
  if (!result.isValid) {
    console.error('❌ Error en configuración de variables de entorno:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Advertencias en configuración:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  return true;
}

export { EnvValidator };
