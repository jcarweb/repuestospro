import { BaileysWhatsAppService } from './baileysWhatsAppService';
import { TwilioWhatsAppService } from './twilioWhatsAppService';
import { WhatsAppWebService } from './whatsappWebService';
import { SimpleWhatsAppService } from './simpleWhatsAppService';

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'text' | 'document';
  document?: {
    filename: string;
    data: Buffer;
    mimetype: string;
  };
}

export class UnifiedWhatsAppService {
  private static instance: UnifiedWhatsAppService;
  private baileysService: BaileysWhatsAppService;
  private twilioService: TwilioWhatsAppService;
  private webService: WhatsAppWebService;
  private simpleService: SimpleWhatsAppService;
  private preferredMethod: 'baileys' | 'twilio' | 'web' | 'simple' | 'none';

  constructor() {
    this.baileysService = BaileysWhatsAppService.getInstance();
    this.twilioService = TwilioWhatsAppService.getInstance();
    this.webService = WhatsAppWebService.getInstance();
    this.simpleService = SimpleWhatsAppService.getInstance();
    
    // Determinar el método preferido basado en la configuración
    this.preferredMethod = this.determinePreferredMethod();
  }

  static getInstance(): UnifiedWhatsAppService {
    if (!UnifiedWhatsAppService.instance) {
      UnifiedWhatsAppService.instance = new UnifiedWhatsAppService();
    }
    return UnifiedWhatsAppService.instance;
  }

  private determinePreferredMethod(): 'baileys' | 'twilio' | 'web' | 'simple' | 'none' {
    // Para Venezuela, usar Simple por defecto (solo email)
    return 'simple';
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      switch (this.preferredMethod) {
        case 'simple':
          return await this.simpleService.sendTextMessage(to, message);
          
        case 'baileys':
          if (this.baileysService.isConnected()) {
            return await this.baileysService.sendTextMessage(to, message);
          }
          // Fallback a Simple si Baileys no está disponible
          return await this.simpleService.sendTextMessage(to, message);
          
        case 'twilio':
          return await this.twilioService.sendTextMessage(to, message);
          
        case 'web':
          return await this.webService.sendTextMessage(to, message);
          
        default:
          console.log('Método de WhatsApp no configurado, enviando solo por email');
          return false;
      }
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error);
      return false;
    }
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    try {
      switch (this.preferredMethod) {
        case 'simple':
          return await this.simpleService.sendDocument(to, document, filename, caption);
          
        case 'baileys':
          if (this.baileysService.isConnected()) {
            return await this.baileysService.sendDocument(to, document, filename, caption);
          }
          // Fallback a Simple si Baileys no está disponible
          return await this.simpleService.sendDocument(to, document, filename, caption);
          
        case 'twilio':
          return await this.twilioService.sendDocument(to, document, filename, caption);
          
        case 'web':
          return await this.webService.sendDocument(to, document, filename, caption);
          
        default:
          console.log('Método de WhatsApp no configurado, enviando solo por email');
          return false;
      }
    } catch (error) {
      console.error('Error enviando documento por WhatsApp:', error);
      return false;
    }
  }

  // Enviar cotización por WhatsApp
  async sendQuotationMessage(to: string, message: string, pdfBuffer: Buffer, quotationNumber: string): Promise<boolean> {
    try {
      // Primero enviar el mensaje de texto
      const textSent = await this.sendTextMessage(to, message);
      
      if (!textSent) {
        console.error('Error enviando mensaje de texto de cotización');
        return false;
      }

      // Luego enviar el PDF
      const documentSent = await this.sendDocument(
        to,
        pdfBuffer,
        `cotizacion-${quotationNumber}.pdf`,
        `Presupuesto ${quotationNumber}`
      );

      return documentSent;
    } catch (error) {
      console.error('Error enviando cotización por WhatsApp:', error);
      return false;
    }
  }

  // Verificar estado de WhatsApp
  getStatus(): {
    method: string;
    connected: boolean;
    available: boolean;
  } {
    let connected = false;
    let available = false;

    switch (this.preferredMethod) {
      case 'baileys':
        connected = this.baileysService.isConnected();
        available = true;
        break;
      case 'twilio':
        connected = !!(process.env['TWILIO_ACCOUNT_SID'] && process.env['TWILIO_AUTH_TOKEN']);
        available = connected;
        break;
      case 'web':
        connected = (this.webService as any).isReady;
        available = true;
        break;
      default:
        connected = false;
        available = false;
    }

    return {
      method: this.preferredMethod,
      connected,
      available
    };
  }
}
