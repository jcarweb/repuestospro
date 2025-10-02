import cron from 'node-cron';
import exchangeRateService from './exchangeRateService';
import ExchangeRate from '../models/ExchangeRate';

export class AutoUpdateService {
  private static instance: AutoUpdateService;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): AutoUpdateService {
    if (!AutoUpdateService.instance) {
      AutoUpdateService.instance = new AutoUpdateService();
    }
    return AutoUpdateService.instance;
  }

  /**
   * Inicia la actualización automática diaria a las 9:20 AM
   */
  public startAutoUpdate(): void {
    if (this.isRunning) {
      console.log('Auto-update ya está ejecutándose');
      return;
    }

    console.log('Iniciando actualización automática de tasas de cambio...');
    
    // Actualizar inmediatamente al iniciar
    this.updateRates();

    // Programar actualización diaria a las 9:20 AM usando cron
    cron.schedule('20 9 * * *', () => {
      console.log('🕘 Ejecutando actualización automática programada (9:20 AM)');
      this.updateRates();
    }, {
      timezone: "America/Caracas"
    });

    this.isRunning = true;
    console.log('Actualización automática iniciada (diaria a las 9:20 AM)');
  }

  /**
   * Detiene la actualización automática
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Actualización automática detenida');
  }

  /**
   * Actualiza las tasas de cambio
   */
  private async updateRates(): Promise<void> {
    try {
      console.log('Actualizando tasas de cambio automáticamente...');
      
      const sourceUrl = 'https://www.bcv.org.ve/';
      
      // Actualizar USD
      try {
        const usdResult = await exchangeRateService.getBcvRate(sourceUrl, 'USD');
        if (usdResult.success) {
          console.log(`USD actualizado: ${usdResult.rate} VES`);
        }
      } catch (error) {
        console.error('Error actualizando USD automáticamente:', error);
      }

      // Actualizar EUR
      try {
        const eurResult = await exchangeRateService.getBcvRate(sourceUrl, 'EUR');
        if (eurResult.success) {
          console.log(`EUR actualizado: ${eurResult.rate} VES`);
        }
      } catch (error) {
        console.error('Error actualizando EUR automáticamente:', error);
      }

      console.log('Actualización automática completada');
    } catch (error) {
      console.error('Error en actualización automática:', error);
    }
  }

  /**
   * Obtiene el estado de la actualización automática
   */
  public getStatus(): { isRunning: boolean; nextUpdate?: Date } {
    if (!this.isRunning) {
      return { isRunning: false };
    }

    // Calcular la próxima actualización a las 9:20 AM
    const now = new Date();
    const nextUpdate = new Date();
    nextUpdate.setHours(9, 20, 0, 0);
    
    // Si ya pasaron las 9:20 AM hoy, programar para mañana
    if (now > nextUpdate) {
      nextUpdate.setDate(nextUpdate.getDate() + 1);
    }

    return {
      isRunning: this.isRunning,
      nextUpdate
    };
  }

  /**
   * Fuerza una actualización manual
   */
  public async forceUpdate(): Promise<void> {
    console.log('Forzando actualización manual de tasas...');
    await this.updateRates();
  }
}

export default AutoUpdateService.getInstance();
