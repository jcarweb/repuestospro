import axios from 'axios';
import puppeteer from 'puppeteer';

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

export class WhatsAppWebService {
  private static instance: WhatsAppWebService;
  private browser: any;
  private page: any;
  private isReady: boolean = false;

  constructor() {
    this.initializeBrowser();
  }

  static getInstance(): WhatsAppWebService {
    if (!WhatsAppWebService.instance) {
      WhatsAppWebService.instance = new WhatsAppWebService();
    }
    return WhatsAppWebService.instance;
  }

  private async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Cambiar a true en producción
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navegar a WhatsApp Web
      await this.page.goto('https://web.whatsapp.com');
      
      // Esperar a que el usuario escanee el código QR
      await this.page.waitForSelector('[data-testid="chat-list"]', { timeout: 60000 });
      
      this.isReady = true;
      console.log('WhatsApp Web conectado exitosamente');
    } catch (error) {
      console.error('Error inicializando WhatsApp Web:', error);
    }
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp Web no está listo');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      // Navegar al chat
      await this.page.goto(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`);
      
      // Esperar a que cargue el chat
      await this.page.waitForSelector('[data-testid="conversation-compose-box-input"]', { timeout: 10000 });
      
      // Escribir el mensaje
      await this.page.type('[data-testid="conversation-compose-box-input"]', message);
      
      // Enviar el mensaje
      await this.page.click('[data-testid="send"]');
      
      // Esperar un momento para que se envíe
      await this.page.waitForTimeout(2000);
      
      return true;
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error);
      return false;
    }
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp Web no está listo');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      // Navegar al chat
      await this.page.goto(`https://web.whatsapp.com/send?phone=${formattedPhone}`);
      
      // Esperar a que cargue el chat
      await this.page.waitForSelector('[data-testid="conversation-compose-box-input"]', { timeout: 10000 });
      
      // Hacer clic en el botón de adjuntar
      await this.page.click('[data-testid="conversation-compose-box-input"]');
      await this.page.waitForTimeout(1000);
      
      // Hacer clic en el botón de documento
      await this.page.click('[data-testid="attach-document"]');
      
      // Crear un input de archivo temporal
      const fileInput = await this.page.$('input[type="file"]');
      if (fileInput) {
        // Guardar el archivo temporalmente
        const fs = require('fs');
        const path = require('path');
        const tempPath = path.join(__dirname, '../../temp', filename);
        
        // Crear directorio temp si no existe
        const tempDir = path.dirname(tempPath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        fs.writeFileSync(tempPath, document);
        
        // Subir el archivo
        await fileInput.uploadFile(tempPath);
        
        // Agregar caption si existe
        if (caption) {
          await this.page.type('[data-testid="conversation-compose-box-input"]', caption);
        }
        
        // Enviar el documento
        await this.page.click('[data-testid="send"]');
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPath);
        
        return true;
      }
      
      return false;
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

  // Cerrar el navegador
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
