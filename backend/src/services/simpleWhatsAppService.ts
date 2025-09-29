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

export class SimpleWhatsAppService {
  private static instance: SimpleWhatsAppService;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
  }

  static getInstance(): SimpleWhatsAppService {
    if (!SimpleWhatsAppService.instance) {
      SimpleWhatsAppService.instance = new SimpleWhatsAppService();
    }
    return SimpleWhatsAppService.instance;
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      // Para Venezuela, usar solo email como respaldo
      console.log(`📱 WhatsApp simulado: Enviando mensaje a ${to}`);
      console.log(`📝 Mensaje: ${message}`);
      console.log('💡 Nota: WhatsApp no está configurado, usando email como respaldo');
      
      return false; // Siempre retorna false para usar email como respaldo
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error);
      return false;
    }
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    try {
      // Para Venezuela, usar solo email como respaldo
      console.log(`📱 WhatsApp simulado: Enviando documento a ${to}`);
      console.log(`📄 Archivo: ${filename}`);
      console.log(`📝 Caption: ${caption || 'Sin descripción'}`);
      console.log('💡 Nota: WhatsApp no está configurado, usando email como respaldo');
      
      return false; // Siempre retorna false para usar email como respaldo
    } catch (error) {
      console.error('Error enviando documento por WhatsApp:', error);
      return false;
    }
  }

  // Enviar cotización por WhatsApp
  async sendQuotationMessage(to: string, message: string, pdfBuffer: Buffer, quotationNumber: string): Promise<boolean> {
    try {
      console.log(`📱 WhatsApp simulado: Enviando cotización ${quotationNumber} a ${to}`);
      console.log(`📝 Mensaje: ${message}`);
      console.log(`📄 PDF: ${pdfBuffer.length} bytes`);
      console.log('💡 Nota: WhatsApp no está configurado, usando email como respaldo');
      
      return false; // Siempre retorna false para usar email como respaldo
    } catch (error) {
      console.error('Error enviando cotización por WhatsApp:', error);
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
    
    return cleaned;
  }

  // Verificar si WhatsApp está listo
  isConnected(): boolean {
    return false; // Siempre false para usar email como respaldo
  }
}
