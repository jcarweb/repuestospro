import { Request, Response } from 'express';
import ExchangeRate from '../models/ExchangeRate';
import Commission from '../models/Commission';
import Subscription from '../models/Subscription';
import Tax from '../models/Tax';
import Store from '../models/Store';
import exchangeRateService from '../services/exchangeRateService';
import autoUpdateService from '../services/autoUpdateService';
import { notificationService } from '../services/notificationService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class MonetizationController {
  // ===== TASAS DE CAMBIO =====
  
  /**
   * Obtiene las tasas de cambio actuales (USD y EUR)
   */
  async getCurrentExchangeRate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Obtener tasas activas para USD y EUR
      const usdRate = await ExchangeRate.findOne({ currency: 'USD', isActive: true }).sort({ lastUpdated: -1 });
      const eurRate = await ExchangeRate.findOne({ currency: 'EUR', isActive: true }).sort({ lastUpdated: -1 });

      res.json({
        success: true,
        exchangeRates: {
          USD: usdRate ? {
            rate: usdRate.rate,
            source: usdRate.source,
            sourceUrl: usdRate.sourceUrl,
            lastUpdated: usdRate.lastUpdated,
            isActive: usdRate.isActive
          } : null,
          EUR: eurRate ? {
            rate: eurRate.rate,
            source: eurRate.source,
            sourceUrl: eurRate.sourceUrl,
            lastUpdated: eurRate.lastUpdated,
            isActive: eurRate.isActive
          } : null
        }
      });
    } catch (error) {
      console.error('Error al obtener tasas de cambio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza la configuración de la URL de fuente
   */
  async updateExchangeRateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sourceUrl } = req.body;
      
      if (!sourceUrl) {
        res.status(400).json({
          success: false,
          message: 'URL de fuente es requerida'
        });
      }

      // Guardar la configuración (podrías usar un modelo de configuración)
      // Por ahora, actualizamos la tasa actual con la nueva URL
      await ExchangeRate.updateMany(
        { currency: 'USD', isActive: true },
        { sourceUrl }
      );

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza las tasas de cambio automáticamente desde BCV (USD y EUR)
   */
  async updateExchangeRateFromBcv(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sourceUrl } = req.body;
      const results: {
        USD: any;
        EUR: any;
      } = {
        USD: null,
        EUR: null
      };

      // Actualizar USD
      try {
        const usdResult = await exchangeRateService.getBcvRate(sourceUrl, 'USD');
        if (usdResult.success) {
          results.USD = {
            rate: usdResult.rate,
            currency: 'USD',
            source: 'BCV',
            sourceUrl: sourceUrl,
            lastUpdated: new Date(),
            isActive: true
          };
        }
      } catch (error) {
        console.error('Error actualizando USD:', error);
      }

      // Actualizar EUR
      try {
        const eurResult = await exchangeRateService.getBcvRate(sourceUrl, 'EUR');
        if (eurResult.success) {
          results.EUR = {
            rate: eurResult.rate,
            currency: 'EUR',
            source: 'BCV',
            sourceUrl: sourceUrl,
            lastUpdated: new Date(),
            isActive: true
          };
        }
      } catch (error) {
        console.error('Error actualizando EUR:', error);
      }

      res.json({
        success: true,
        message: 'Tasas de cambio actualizadas',
        exchangeRates: results
      });
    } catch (error) {
      console.error('Error al actualizar tasas de cambio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene el historial de tasas de cambio para ambas monedas
   */
  async getExchangeRateHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Obtener historial para USD y EUR
      const [usdRates, eurRates] = await Promise.all([
        ExchangeRate.find({ currency: 'USD' })
          .sort({ lastUpdated: -1 })
          .skip(skip)
          .limit(Number(limit)),
        ExchangeRate.find({ currency: 'EUR' })
          .sort({ lastUpdated: -1 })
          .skip(skip)
          .limit(Number(limit))
      ]);

      const [usdTotal, eurTotal] = await Promise.all([
        ExchangeRate.countDocuments({ currency: 'USD' }),
        ExchangeRate.countDocuments({ currency: 'EUR' })
      ]);

      res.json({
        success: true,
        history: {
          USD: {
            rates: usdRates,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: usdTotal,
              pages: Math.ceil(usdTotal / Number(limit))
            }
          },
          EUR: {
            rates: eurRates,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: eurTotal,
              pages: Math.ceil(eurTotal / Number(limit))
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener historial de tasas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Inicia la actualización automática
   */
  async startAutoUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      autoUpdateService.startAutoUpdate();
      const status = autoUpdateService.getStatus();
      
      res.json({
        success: true,
        message: 'Actualización automática iniciada',
        status
      });
    } catch (error) {
      console.error('Error al iniciar actualización automática:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Detiene la actualización automática
   */
  async stopAutoUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      autoUpdateService.stopAutoUpdate();
      
      res.json({
        success: true,
        message: 'Actualización automática detenida'
      });
    } catch (error) {
      console.error('Error al detener actualización automática:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene el estado de la actualización automática
   */
  async getAutoUpdateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = autoUpdateService.getStatus();
      
      res.json({
        success: true,
        status
      });
    } catch (error) {
      console.error('Error al obtener estado de actualización automática:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Fuerza una actualización manual
   */
  async forceUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await autoUpdateService.forceUpdate();
      
      res.json({
        success: true,
        message: 'Actualización forzada completada'
      });
    } catch (error) {
      console.error('Error al forzar actualización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== COMISIONES =====

  /**
   * Obtiene todas las comisiones
   */
  async getCommissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeType, isActive } = req.query;
      const filter: any = {};

      if (storeType) filter.storeType = storeType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const commissions = await Commission.find(filter).sort({ createdAt: -1 });

      res.json({
        success: true,
        commissions
      });
    } catch (error) {
      console.error('Error al obtener comisiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crea una nueva comisión
   */
  async createCommission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const commissionData = req.body;
      
      // Validar datos requeridos
      if (!commissionData.name || commissionData.value === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nombre y valor son requeridos'
        });
      }

      const commission = await Commission.create(commissionData);

      res.status(201).json({
        success: true,
        message: 'Comisión creada exitosamente',
        commission
      });
    } catch (error) {
      console.error('Error al crear comisión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza una comisión
   */
  async updateCommission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const commission = await Commission.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!commission) {
        res.status(404).json({
          success: false,
          message: 'Comisión no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Comisión actualizada exitosamente',
        commission
      });
    } catch (error) {
      console.error('Error al actualizar comisión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina una comisión
   */
  async deleteCommission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const commission = await Commission.findByIdAndDelete(id);

      if (!commission) {
        res.status(404).json({
          success: false,
          message: 'Comisión no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Comisión eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar comisión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== SUSCRIPCIONES =====

  /**
   * Obtiene todos los planes de suscripción
   */
  async getSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, isActive } = req.query;
      const filter: any = {};

      if (type) filter.type = type;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const subscriptions = await Subscription.find(filter).sort({ price: 1 });

      res.json({
        success: true,
        subscriptions
      });
    } catch (error) {
      console.error('Error al obtener suscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crea un nuevo plan de suscripción
   */
  async createSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const subscriptionData = req.body;
      
      if (!subscriptionData.name || subscriptionData.price === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nombre y precio son requeridos'
        });
      }

      const subscription = await Subscription.create(subscriptionData);

      res.status(201).json({
        success: true,
        message: 'Plan de suscripción creado exitosamente',
        subscription
      });
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un plan de suscripción
   */
  async updateSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const subscription = await Subscription.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Plan de suscripción actualizado exitosamente',
        subscription
      });
    } catch (error) {
      console.error('Error al actualizar suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina un plan de suscripción
   */
  async deleteSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const subscription = await Subscription.findByIdAndDelete(id);

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Plan de suscripción eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== IMPUESTOS =====

  /**
   * Obtiene todos los impuestos
   */
  async getTaxes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, appliesTo, isActive } = req.query;
      const filter: any = {};

      if (type) filter.type = type;
      if (appliesTo) filter.appliesTo = appliesTo;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const taxes = await Tax.find(filter).sort({ createdAt: -1 });

      res.json({
        success: true,
        taxes
      });
    } catch (error) {
      console.error('Error al obtener impuestos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crea un nuevo impuesto
   */
  async createTax(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const taxData = req.body;
      
      if (!taxData.name || taxData.rate === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nombre y tasa son requeridos'
        });
      }

      const tax = await Tax.create(taxData);

      res.status(201).json({
        success: true,
        message: 'Impuesto creado exitosamente',
        tax
      });
    } catch (error) {
      console.error('Error al crear impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza un impuesto
   */
  async updateTax(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tax = await Tax.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!tax) {
        res.status(404).json({
          success: false,
          message: 'Impuesto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Impuesto actualizado exitosamente',
        tax
      });
    } catch (error) {
      console.error('Error al actualizar impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Elimina un impuesto
   */
  async deleteTax(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const tax = await Tax.findByIdAndDelete(id);

      if (!tax) {
        res.status(404).json({
          success: false,
          message: 'Impuesto no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Impuesto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar impuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== CONFIGURACIÓN DE TASA POR TIENDA =====

  /**
   * Obtiene la preferencia de tasa de cambio de una tienda
   */
  async getStoreExchangeRatePreference(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const user = req.user;

      // Verificar que el usuario tenga acceso a la tienda
      const store = await Store.findOne({
        _id: storeId,
        $or: [
          { owner: user._id },
          { managers: user._id }
        ]
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada o sin permisos'
        });
        return;
      }

      res.json({
        success: true,
        preferredExchangeRate: store.settings.preferredExchangeRate
      });
    } catch (error) {
      console.error('Error al obtener preferencia de tasa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza la preferencia de tasa de cambio de una tienda
   */
  async updateStoreExchangeRatePreference(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { preferredExchangeRate } = req.body;
      const user = req.user;

      // Validar que la tasa sea válida
      if (!['USD', 'EUR'].includes(preferredExchangeRate)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de tasa inválido. Debe ser USD o EUR'
        });
        return;
      }

      // Verificar que el usuario tenga acceso a la tienda
      const store = await Store.findOne({
        _id: storeId,
        $or: [
          { owner: user._id },
          { managers: user._id }
        ]
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada o sin permisos'
        });
        return;
      }

      // Actualizar la preferencia
      store.settings.preferredExchangeRate = preferredExchangeRate;
      await store.save();

      res.json({
        success: true,
        message: 'Preferencia de tasa actualizada exitosamente',
        preferredExchangeRate: store.settings.preferredExchangeRate
      });
    } catch (error) {
      console.error('Error al actualizar preferencia de tasa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene la tasa de cambio actual según la preferencia de la tienda
   */
  async getStoreExchangeRate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const user = req.user;

      // Verificar que el usuario tenga acceso a la tienda
      const store = await Store.findOne({
        _id: storeId,
        $or: [
          { owner: user._id },
          { managers: user._id }
        ]
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada o sin permisos'
        });
        return;
      }

      // Obtener la tasa según la preferencia de la tienda
      const rates = await exchangeRateService.getCurrentRates();
      const preferredRate = store.settings.preferredExchangeRate === 'USD' ? rates.usdToVes : rates.eurToVes;
      const result = { success: true, rate: preferredRate };
      
      if (!result.success) {
        res.status(404).json({
          success: false,
          message: 'No se pudo obtener la tasa de cambio'
        });
        return;
      }

      res.json({
        success: true,
        exchangeRate: {
          rate: result.rate,
          currency: store.settings.preferredExchangeRate,
          source: 'BCV',
          sourceUrl: 'https://www.bcv.org.ve',
          lastUpdated: new Date(),
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error al obtener tasa de cambio de tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== CÁLCULOS =====

  /**
   * Calculadora general de comisiones e impuestos
   */
  async calculateCommission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { saleAmount, storeType, exchangeRate } = req.body;

      if (!saleAmount || saleAmount <= 0) {
        res.status(400).json({
          success: false,
          message: 'El monto de venta debe ser positivo'
        });
      }

      // Obtener comisión activa para el tipo de tienda
      const commission = await Commission.findOne({
        storeType,
        isActive: true
      }).sort({ createdAt: -1 });

      // Obtener impuestos activos
      const taxes = await Tax.find({ isActive: true });

      // Calcular comisión
      let commissionAmount = 0;
      let commissionRate = 0;
      let commissionType = 'N/A';

      if (commission) {
        commissionRate = commission.baseRate;
        commissionType = commission.type;
        
        if (commission.type === 'percentage') {
          commissionAmount = (saleAmount * commission.baseRate) / 100;
        } else {
          commissionAmount = commission.baseRate;
        }
      }

      // Calcular impuestos
      const taxBreakdown = taxes.map(tax => {
        let taxAmount = 0;
        
        if (tax.isPercentage) {
          taxAmount = (saleAmount * tax.rate) / 100;
        } else {
          taxAmount = tax.rate;
        }
        
        return {
          name: tax.name,
          amount: taxAmount,
          rate: tax.rate,
          type: tax.type
        };
      });

      const totalTaxes = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);
      const total = saleAmount - commissionAmount + totalTaxes;

      res.json({
        success: true,
        result: {
          subtotal: saleAmount,
          commission: commissionAmount,
          taxes: totalTaxes,
          total,
          breakdown: {
            commission: {
              amount: commissionAmount,
              rate: commissionRate,
              type: commissionType
            },
            taxes: taxBreakdown
          }
        }
      });
    } catch (error) {
      console.error('Error al calcular:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new MonetizationController();
