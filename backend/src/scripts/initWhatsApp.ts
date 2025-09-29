import { BaileysWhatsAppService } from '../services/baileysWhatsAppService';
import { UnifiedWhatsAppService } from '../services/unifiedWhatsAppService';

/**
 * Script de inicialización de WhatsApp para Venezuela
 * Este script configura automáticamente WhatsApp usando Baileys
 */
export class WhatsAppInitializer {
  private static instance: WhatsAppInitializer;
  private unifiedService: UnifiedWhatsAppService;
  private baileysService: BaileysWhatsAppService;

  constructor() {
    this.unifiedService = UnifiedWhatsAppService.getInstance();
    this.baileysService = BaileysWhatsAppService.getInstance();
  }

  static getInstance(): WhatsAppInitializer {
    if (!WhatsAppInitializer.instance) {
      WhatsAppInitializer.instance = new WhatsAppInitializer();
    }
    return WhatsAppInitializer.instance;
  }

  /**
   * Inicializar WhatsApp para Venezuela
   */
  async initializeForVenezuela(): Promise<void> {
    console.log('🇻🇪 Inicializando WhatsApp para Venezuela...');
    
    try {
      // Configurar método preferido
      process.env.WHATSAPP_METHOD = 'baileys';
      
      console.log('📱 Configurando Baileys WhatsApp...');
      
      // Verificar estado cada 5 segundos
      const checkStatus = setInterval(() => {
        const status = this.unifiedService.getStatus();
        console.log(`📊 Estado WhatsApp: ${status.method} - Conectado: ${status.connected}`);
        
        if (status.connected) {
          console.log('✅ WhatsApp conectado exitosamente!');
          console.log('📋 Funcionalidades disponibles:');
          console.log('   • Envío de mensajes de texto');
          console.log('   • Envío de documentos PDF');
          console.log('   • Envío de cotizaciones completas');
          console.log('   • Formateo automático de números venezolanos (+58)');
          clearInterval(checkStatus);
        }
      }, 5000);

      // Timeout después de 2 minutos
      setTimeout(() => {
        clearInterval(checkStatus);
        console.log('⏰ Timeout: Si WhatsApp no se conectó, verifica el QR');
      }, 120000);

    } catch (error) {
      console.error('❌ Error inicializando WhatsApp:', error);
      console.log('💡 Solución: Verifica que las dependencias estén instaladas');
      console.log('   npm install @whiskeysockets/baileys @hapi/boom pino');
    }
  }

  /**
   * Probar funcionalidad de WhatsApp
   */
  async testWhatsApp(): Promise<void> {
    console.log('🧪 Probando funcionalidad de WhatsApp...');
    
    const status = this.unifiedService.getStatus();
    
    if (!status.connected) {
      console.log('❌ WhatsApp no está conectado');
      console.log('💡 Solución: Ejecuta initializeForVenezuela() primero');
      return;
    }

    // Probar envío de mensaje de prueba
    const testNumber = '+584121234567'; // Número de prueba
    const testMessage = '🧪 Mensaje de prueba desde PiezasYA - Sistema de Cotizaciones';
    
    console.log(`📤 Enviando mensaje de prueba a ${testNumber}...`);
    
    try {
      const result = await this.unifiedService.sendTextMessage(testNumber, testMessage);
      
      if (result) {
        console.log('✅ Mensaje de prueba enviado exitosamente!');
        console.log('🎉 WhatsApp está funcionando correctamente');
      } else {
        console.log('❌ Error enviando mensaje de prueba');
      }
    } catch (error) {
      console.error('❌ Error en prueba:', error);
    }
  }

  /**
   * Obtener estado del sistema
   */
  getSystemStatus(): {
    whatsapp: any;
    recommendations: string[];
  } {
    const whatsappStatus = this.unifiedService.getStatus();
    
    const recommendations: string[] = [];
    
    if (!whatsappStatus.connected) {
      recommendations.push('🔧 Configurar WhatsApp usando Baileys');
      recommendations.push('📱 Escanear código QR con WhatsApp');
    }
    
    if (whatsappStatus.method === 'none') {
      recommendations.push('⚙️ Configurar WHATSAPP_METHOD=baileys en .env');
    }
    
    return {
      whatsapp: whatsappStatus,
      recommendations
    };
  }

  /**
   * Configurar para producción
   */
  async setupForProduction(): Promise<void> {
    console.log('🏭 Configurando WhatsApp para producción...');
    
    // Configuraciones específicas para producción
    process.env.NODE_ENV = 'production';
    process.env.WHATSAPP_METHOD = 'baileys';
    
    console.log('✅ Configuración de producción aplicada');
    console.log('📋 Configuraciones:');
    console.log('   • Método: Baileys');
    console.log('   • Entorno: Producción');
    console.log('   • Formateo automático: +58 para Venezuela');
    console.log('   • Fallback: Email si WhatsApp falla');
  }
}

// Función de utilidad para inicializar desde el servidor principal
export const initializeWhatsAppForVenezuela = async (): Promise<void> => {
  const initializer = WhatsAppInitializer.getInstance();
  await initializer.initializeForVenezuela();
};

// Función de utilidad para probar WhatsApp
export const testWhatsAppFunctionality = async (): Promise<void> => {
  const initializer = WhatsAppInitializer.getInstance();
  await initializer.testWhatsApp();
};
