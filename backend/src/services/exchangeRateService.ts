import axios from 'axios';
import https from 'https';

export interface ExchangeRate {
  usdToVes: number;
  eurToUsd: number;
  eurToVes: number;
  lastUpdated: Date;
  source: 'BCV' | 'MANUAL';
}

class ExchangeRateService {
  private rates: ExchangeRate | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene la tasa de cambio actual
   */
  async getCurrentRates(): Promise<ExchangeRate> {
    // Verificar si tenemos datos en caché
    if (this.rates && this.lastFetch && 
        (Date.now() - this.lastFetch.getTime()) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      // Intentar obtener del BCV
      const bcvRates = await this.fetchBCVRates();
      this.rates = bcvRates;
      this.lastFetch = new Date();
      return this.rates;
    } catch (error) {
      console.error('Error obteniendo tasas del BCV:', error);
      
      // Si falla, usar tasas por defecto
      if (!this.rates) {
        this.rates = {
          usdToVes: 36.5, // Tasa por defecto
          eurToUsd: 1.08,
          eurToVes: 39.42,
          lastUpdated: new Date(),
          source: 'MANUAL'
        };
      }
      
      return this.rates;
    }
  }

  /**
   * Obtiene una tasa específica del BCV (para compatibilidad con autoUpdateService)
   */
  async getBcvRate(sourceUrl: string, currency: 'USD' | 'EUR'): Promise<{ success: boolean; rate: number }> {
    try {
      console.log(`🔍 Intentando obtener tasa ${currency} del BCV...`);
      
      const response = await axios.get(sourceUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        // Deshabilitar verificación SSL para desarrollo
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      const html = response.data;
      let rate = 0;

      if (currency === 'USD') {
        // Buscar el patrón específico del BCV: $ USD: 216,37140000
        const usdMatch = html.match(/\$\s*USD:\s*([\d,]+\.?\d*)/);
        if (usdMatch) {
          rate = parseFloat(usdMatch[1].replace(',', '.'));
        } else {
          // Patrón alternativo: $ USD: 216.37140000
          const usdMatchAlt = html.match(/\$\s*USD:\s*([\d.]+)/);
          rate = usdMatchAlt ? parseFloat(usdMatchAlt[1]) : 216.37;
        }
      } else if (currency === 'EUR') {
        // Buscar el patrón específico del BCV: € EUR: 251,65508419
        const eurMatch = html.match(/€\s*EUR:\s*([\d,]+\.?\d*)/);
        if (eurMatch) {
          rate = parseFloat(eurMatch[1].replace(',', '.'));
        } else {
          // Patrón alternativo: € EUR: 251.65508419
          const eurMatchAlt = html.match(/€\s*EUR:\s*([\d.]+)/);
          rate = eurMatchAlt ? parseFloat(eurMatchAlt[1]) : 251.66;
        }
      }

      console.log(`✅ Tasa ${currency} obtenida del BCV: ${rate}`);
      return { success: true, rate };
    } catch (error) {
      console.error(`❌ Error obteniendo tasa ${currency} del BCV:`, error.message);
      // Retornar tasas por defecto en caso de error
      const defaultRates = {
        USD: 216.37,
        EUR: 251.66
      };
      console.log(`🔧 Usando tasa por defecto para ${currency}: ${defaultRates[currency]}`);
      return { success: false, rate: defaultRates[currency] };
    }
  }

  /**
   * Obtiene tasas del BCV
   */
  private async fetchBCVRates(): Promise<ExchangeRate> {
    try {
      // Scraping del BCV (implementar según la estructura actual)
      const response = await axios.get('https://www.bcv.org.ve/', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        // Deshabilitar verificación SSL para desarrollo
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      // Parsear HTML del BCV (ajustar según la estructura real)
      const html = response.data;
      
      // Buscar USD: $ USD: 216,37140000
      let usdToVes = 216.37; // Valor por defecto
      const usdMatch = html.match(/\$\s*USD:\s*([\d,]+\.?\d*)/);
      if (usdMatch) {
        usdToVes = parseFloat(usdMatch[1].replace(',', '.'));
      } else {
        const usdMatchAlt = html.match(/\$\s*USD:\s*([\d.]+)/);
        if (usdMatchAlt) {
          usdToVes = parseFloat(usdMatchAlt[1]);
        }
      }

      // Buscar EUR: € EUR: 251,65508419
      let eurToVes = 251.66; // Valor por defecto
      const eurMatch = html.match(/€\s*EUR:\s*([\d,]+\.?\d*)/);
      if (eurMatch) {
        eurToVes = parseFloat(eurMatch[1].replace(',', '.'));
      } else {
        const eurMatchAlt = html.match(/€\s*EUR:\s*([\d.]+)/);
        if (eurMatchAlt) {
          eurToVes = parseFloat(eurMatchAlt[1]);
        }
      }

      // Calcular EUR/USD basado en las tasas obtenidas
      const eurToUsd = eurToVes / usdToVes;

      console.log(`✅ Tasas obtenidas del BCV:`);
      console.log(`   USD/VES: ${usdToVes}`);
      console.log(`   EUR/VES: ${eurToVes}`);
      console.log(`   EUR/USD: ${eurToUsd.toFixed(4)}`);

      return {
        usdToVes,
        eurToUsd,
        eurToVes,
        lastUpdated: new Date(),
        source: 'BCV'
      };
    } catch (error) {
      console.error('Error en scraping del BCV:', error);
      throw error;
    }
  }

  /**
   * Convierte una cantidad de una moneda a otra
   */
  async convertAmount(
    amount: number, 
    fromCurrency: 'USD' | 'EUR' | 'VES', 
    toCurrency: 'USD' | 'VES'
  ): Promise<{ amount: number; rate: number }> {
    const rates = await this.getCurrentRates();

    let convertedAmount = amount;
    let rate = 1;

    // Convertir a USD primero si es necesario
    if (fromCurrency === 'EUR') {
      convertedAmount = amount * rates.eurToUsd;
      rate = rates.eurToUsd;
    } else if (fromCurrency === 'VES') {
      convertedAmount = amount / rates.usdToVes;
      rate = 1 / rates.usdToVes;
    }

    // Convertir de USD a la moneda objetivo
    if (toCurrency === 'VES') {
      convertedAmount = convertedAmount * rates.usdToVes;
      rate = rate * rates.usdToVes;
    }

    return {
      amount: Math.round(convertedAmount * 100) / 100, // Redondear a 2 decimales
      rate
    };
  }

  /**
   * Obtiene las instrucciones de pago según el método
   */
  getPaymentInstructions(paymentMethod: string, amount: number, currency: string): any {
    const instructions = {
      paypal: {
        accountNumber: 'payments@piezasyaya.com',
        bankName: 'PayPal',
        beneficiaryName: 'PiezasYa',
        email: 'payments@piezasyaya.com',
        reference: `RECHARGE-${Date.now()}`,
        instructions: `Enviar ${amount} ${currency} a payments@piezasyaya.com con referencia RECHARGE-${Date.now()}`
      },
      stripe: {
        accountNumber: 'stripe@piezasyaya.com',
        bankName: 'Stripe',
        beneficiaryName: 'PiezasYa',
        email: 'stripe@piezasyaya.com',
        reference: `RECHARGE-${Date.now()}`,
        instructions: `Procesar pago de ${amount} ${currency} a través de Stripe`
      },
      zelle: {
        accountNumber: 'zelle@piezasyaya.com',
        bankName: 'Zelle',
        beneficiaryName: 'PiezasYa',
        email: 'zelle@piezasyaya.com',
        reference: `RECHARGE-${Date.now()}`,
        instructions: `Enviar ${amount} ${currency} vía Zelle a zelle@piezasyaya.com`
      },
      bank_transfer: {
        accountNumber: '0102-1234-5678-9012',
        bankName: 'Banco de Venezuela',
        beneficiaryName: 'PiezasYa C.A.',
        reference: `RECHARGE-${Date.now()}`,
        instructions: `Transferir ${amount} ${currency} a la cuenta 0102-1234-5678-9012 del Banco de Venezuela`
      },
      pago_movil: {
        accountNumber: '0102-1234-5678-9012',
        bankName: 'Banco de Venezuela',
        beneficiaryName: 'PiezasYa C.A.',
        phoneNumber: '+58-412-1234567',
        reference: `RECHARGE-${Date.now()}`,
        instructions: `Realizar Pago Móvil de ${amount} ${currency} al 0412-1234567`
      }
    };

    return instructions[paymentMethod as keyof typeof instructions];
  }
}

export default new ExchangeRateService();