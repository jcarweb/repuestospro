import twilio from 'twilio';

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

export class TwilioWhatsAppService {
  private static instance: TwilioWhatsAppService;
  private client: any;

  constructor() {
    const accountSid = process.env['TWILIO_ACCOUNT_SID'];
    const authToken = process.env['TWILIO_AUTH_TOKEN'];
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  static getInstance(): TwilioWhatsAppService {
    if (!TwilioWhatsAppService.instance) {
      TwilioWhatsAppService.instance = new TwilioWhatsAppService();
    }
    return TwilioWhatsAppService.instance;
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('Twilio no está configurado');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      await this.client.messages.create({
        from: `whatsapp:${process.env['TWILIO_WHATSAPP_NUMBER']}`,
        to: `whatsapp:+${formattedPhone}`,
        body: message
      });

      return true;
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp con Twilio:', error);
      return false;
    }
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('Twilio no está configurado');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      // Convertir buffer a base64
      const base64Document = document.toString('base64');
      const mediaUrl = `data:application/pdf;base64,${base64Document}`;
      
      await this.client.messages.create({
        from: `whatsapp:${process.env['TWILIO_WHATSAPP_NUMBER']}`,
        to: `whatsapp:+${formattedPhone}`,
        body: caption || `Documento: ${filename}`,
        mediaUrl: [mediaUrl]
      });

      return true;
    } catch (error) {
      console.error('Error enviando documento por WhatsApp con Twilio:', error);
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
}
