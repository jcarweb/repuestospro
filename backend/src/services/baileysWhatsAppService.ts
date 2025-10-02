// Importaciones dinámicas para módulos ES
let makeWASocket: any;
let DisconnectReason: any;
let useMultiFileAuthState: any;
let Boom: any;
let P: any;

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

export class BaileysWhatsAppService {
  private static instance: BaileysWhatsAppService;
  private sock: any;
  private isReady: boolean = false;

  constructor() {
    this.initializeBaileys();
  }

  static getInstance(): BaileysWhatsAppService {
    if (!BaileysWhatsAppService.instance) {
      BaileysWhatsAppService.instance = new BaileysWhatsAppService();
    }
    return BaileysWhatsAppService.instance;
  }

  private async initializeBaileys() {
    try {
      // Importaciones dinámicas
      const baileys = await import('@whiskeysockets/baileys');
      const boom = await import('@hapi/boom');
      const pino = await import('pino');
      
      makeWASocket = baileys.makeWASocket;
      DisconnectReason = baileys.DisconnectReason;
      useMultiFileAuthState = baileys.useMultiFileAuthState;
      Boom = boom.Boom;
      P = pino.default;
      
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
      
      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' }),
        browser: ['PiezasYA', 'Chrome', '1.0.0']
      });

      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('Conexión cerrada debido a ', lastDisconnect?.error, ', reconectando ', shouldReconnect);
          
          if (shouldReconnect) {
            this.initializeBaileys();
          }
        } else if (connection === 'open') {
          console.log('WhatsApp conectado exitosamente');
          this.isReady = true;
        }
      });

      this.sock.ev.on('creds.update', saveCreds);
      
    } catch (error) {
      console.error('Error inicializando Baileys:', error);
    }
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady || !this.sock) {
        throw new Error('WhatsApp no está listo');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      await this.sock.sendMessage(`${formattedPhone}@s.whatsapp.net`, {
        text: message
      });

      return true;
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error);
      return false;
    }
  }

  // Enviar documento (PDF)
  async sendDocument(to: string, document: Buffer, filename: string, caption?: string): Promise<boolean> {
    try {
      if (!this.isReady || !this.sock) {
        throw new Error('WhatsApp no está listo');
      }

      const formattedPhone = this.formatPhoneNumber(to);
      
      await this.sock.sendMessage(`${formattedPhone}@s.whatsapp.net`, {
        document: document,
        fileName: filename,
        mimetype: 'application/pdf',
        caption: caption || `Documento: ${filename}`
      });

      return true;
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

  // Verificar si WhatsApp está listo
  isConnected(): boolean {
    return this.isReady;
  }
}
