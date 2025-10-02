import { UnifiedWhatsAppService } from './unifiedWhatsAppService';
import axios from 'axios';

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

export class WhatsAppService {
  private static instance: WhatsAppService;
  private unifiedService: UnifiedWhatsAppService;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.unifiedService = UnifiedWhatsAppService.getInstance();
    this.apiUrl = process.env['WHATSAPP_API_URL'] || 'https://api.whatsapp.com';
    this.apiKey = process.env['WHATSAPP_API_KEY'] || '';
  }

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    return await this.unifiedService.sendTextMessage(to, message);
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    return await this.unifiedService.sendDocument(to, document, filename, caption);
  }

  // Enviar cotización por WhatsApp
  async sendQuotationMessage(to: string, message: string, pdfBuffer: Buffer, quotationNumber: string): Promise<boolean> {
    return await this.unifiedService.sendQuotationMessage(to, message, pdfBuffer, quotationNumber);
  }

  // Método estático para enviar cotización (compatibilidad)
  static async sendQuotationMessage(to: string, message: string, pdfBuffer: Buffer, quotationNumber: string): Promise<boolean> {
    const instance = WhatsAppService.getInstance();
    return await instance.sendQuotationMessage(to, message, pdfBuffer, quotationNumber);
  }

  // Verificar si un número de teléfono es válido para WhatsApp
  async verifyPhoneNumber(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const response = await axios.get(`${this.apiUrl}/verify-phone`, {
        params: { phone: formattedPhone },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data.isValid;
    } catch (error) {
      console.error('Error verificando número de WhatsApp:', error);
      return false;
    }
  }

  // Formatear número de teléfono para WhatsApp
  private formatPhoneNumber(phone: string): string {
    // Remover todos los caracteres no numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Si no tiene código de país, agregar +58 (Venezuela)
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      cleaned = '58' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      cleaned = '58' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Obtener estado de entrega de un mensaje
  async getMessageStatus(messageId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/message-status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data.status;
    } catch (error) {
      console.error('Error obteniendo estado del mensaje:', error);
      return 'unknown';
    }
  }

  // Enviar mensaje de bienvenida a un nuevo cliente
  async sendWelcomeMessage(to: string, customerName: string, storeName: string): Promise<boolean> {
    const message = `¡Hola ${customerName}! 👋\n\nBienvenido/a a ${storeName}. Estamos aquí para ayudarte con todos tus repuestos automotrices.\n\n¿En qué podemos asistirte hoy?`;
    
    return await this.sendTextMessage(to, message);
  }

  // Enviar recordatorio de cotización
  async sendQuotationReminder(to: string, customerName: string, quotationNumber: string, validUntil: Date): Promise<boolean> {
    const message = `Hola ${customerName}, te recordamos que tu presupuesto ${quotationNumber} vence el ${validUntil.toLocaleDateString()}. ¿Te interesa proceder con la compra?`;
    
    return await this.sendTextMessage(to, message);
  }

  // Enviar notificación de cotización expirada
  async sendQuotationExpiredNotification(to: string, customerName: string, quotationNumber: string): Promise<boolean> {
    const message = `Hola ${customerName}, tu presupuesto ${quotationNumber} ha expirado. Si aún estás interesado/a, podemos generar uno nuevo. ¿Te gustaría que te preparemos una nueva cotización?`;
    
    return await this.sendTextMessage(to, message);
  }
}
