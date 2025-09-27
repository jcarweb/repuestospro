import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import ExchangeRate from '../models/ExchangeRate';
import { sendNotificationToAdmin } from './notificationService';

export interface ExchangeRateResult {
  success: boolean;
  rate?: number;
  message?: string;
  source?: string;
  lastUpdated?: Date;
}

export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private defaultUrl = 'https://www.bcv.org.ve/';
  private retryAttempts = 3;
  private retryDelay = 5000; // 5 segundos

  public static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Obtiene la tasa de cambio del BCV mediante web scraping
   */
  async getBcvRate(url?: string): Promise<ExchangeRateResult> {
    const targetUrl = url || this.defaultUrl;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Intento ${attempt} de obtener tasa BCV desde: ${targetUrl}`);
        
        const response = await axios.get(targetUrl, {
          timeout: 10000,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.data) {
          throw new Error('Respuesta vacía del servidor');
        }

        const $ = cheerio.load(response.data);
        const rateElement = $('#dolar strong');
        
        if (!rateElement.length) {
          throw new Error('No se encontró el elemento de tasa en la página');
        }

        const rateText = rateElement.text().trim();
        if (!rateText) {
          throw new Error('El elemento de tasa está vacío');
        }

        // Limpiar y convertir el texto a número
        const cleanRate = rateText.replace(/[^\d,.-]/g, '').replace(',', '.');
        const rate = parseFloat(cleanRate);

        if (isNaN(rate) || rate <= 0) {
          throw new Error(`Tasa inválida: ${rateText}`);
        }

        console.log(`Tasa BCV obtenida exitosamente: ${rate}`);

        // Guardar en la base de datos
        await this.saveExchangeRate(rate, 'BCV', targetUrl);

        return {
          success: true,
          rate,
          source: 'BCV',
          lastUpdated: new Date()
        };

      } catch (error) {
        console.error(`Error en intento ${attempt}:`, error);
        
        if (attempt === this.retryAttempts) {
          // Último intento fallido, notificar al administrador
          await this.notifyAdminOfFailure(targetUrl, error);
          
          return {
            success: false,
            message: `Error al obtener tasa BCV después de ${this.retryAttempts} intentos: ${(error as Error).message}`
          };
        }

        // Esperar antes del siguiente intento
        await this.delay(this.retryDelay);
      }
    }

    return {
      success: false,
      message: 'Error desconocido al obtener tasa BCV'
    };
  }

  /**
   * Guarda la tasa de cambio en la base de datos
   */
  private async saveExchangeRate(rate: number, source: string, sourceUrl: string): Promise<void> {
    try {
      // Desactivar tasas anteriores
      await ExchangeRate.updateMany(
        { currency: 'USD', isActive: true },
        { isActive: false }
      );

      // Crear nueva tasa
      await ExchangeRate.create({
        currency: 'USD',
        rate,
        source,
        sourceUrl,
        lastUpdated: new Date(),
        isActive: true,
        manualOverride: false
      });

      console.log('Tasa de cambio guardada en la base de datos');
    } catch (error) {
      console.error('Error al guardar tasa de cambio:', error);
      throw error;
    }
  }

  /**
   * Notifica al administrador sobre el fallo en la obtención de la tasa
   */
  private async notifyAdminOfFailure(url: string, error: any): Promise<void> {
    try {
      const message = `⚠️ Error al obtener tasa BCV\n\nURL: ${url}\nError: ${(error as Error).message}\nFecha: ${new Date().toLocaleString()}\n\nPor favor, configure la tasa manualmente en el panel de administración.`;
      
      await sendNotificationToAdmin('Error en Tasa de Cambio BCV', message, 'error', 'high');

      console.log('Notificación enviada al administrador');
    } catch (notificationError) {
      console.error('Error al enviar notificación al administrador:', notificationError);
    }
  }

  /**
   * Obtiene la tasa actual desde la base de datos
   */
  async getCurrentRate(): Promise<ExchangeRateResult> {
    try {
      const rate = await ExchangeRate.findOne({ 
        currency: 'USD', 
        isActive: true 
      }).sort({ lastUpdated: -1 });

      if (!rate) {
        return {
          success: false,
          message: 'No hay tasa de cambio configurada'
        };
      }

      return {
        success: true,
        rate: rate.rate,
        source: rate.source,
        lastUpdated: rate.lastUpdated
      };
    } catch (error) {
      console.error('Error al obtener tasa actual:', error);
      return {
        success: false,
        message: 'Error al obtener tasa actual de la base de datos'
      };
    }
  }

  /**
   * Actualiza la URL de la fuente de tasas
   */
  async updateSourceUrl(newUrl: string): Promise<void> {
    this.defaultUrl = newUrl;
    console.log(`URL de fuente de tasas actualizada a: ${newUrl}`);
  }

  /**
   * Función de delay para reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ExchangeRateService.getInstance();
