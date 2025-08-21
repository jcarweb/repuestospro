import { Request, Response } from 'express';
import ExchangeRate from '../models/ExchangeRate';
import Commission from '../models/Commission';
import Subscription from '../models/Subscription';
import Tax from '../models/Tax';
import exchangeRateService from '../services/exchangeRateService';
import { sendNotificationToAdmin } from '../services/notificationService';

export class MonetizationController {
  // ===== TASAS DE CAMBIO =====
  
  /**
   * Obtiene la tasa de cambio actual
   */
  async getCurrentExchangeRate(req: Request, res: Response) {
    try {
      const result = await exchangeRateService.getCurrentRate();
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        exchangeRate: {
          rate: result.rate,
          source: result.source,
          sourceUrl: result.sourceUrl,
          lastUpdated: result.lastUpdated,
          isActive: result.isActive
        }
      });
    } catch (error) {
      console.error('Error al obtener tasa de cambio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza la configuración de la URL de fuente
   */
  async updateExchangeRateConfig(req: Request, res: Response) {
    try {
      const { sourceUrl } = req.body;
      
      if (!sourceUrl) {
        return res.status(400).json({
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
   * Actualiza la tasa de cambio automáticamente desde BCV
   */
  async updateExchangeRateFromBcv(req: Request, res: Response) {
    try {
      const { sourceUrl } = req.body;
      const result = await exchangeRateService.getBcvRate(sourceUrl);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Tasa de cambio actualizada exitosamente',
        exchangeRate: {
          rate: result.rate,
          source: result.source,
          sourceUrl: result.sourceUrl,
          lastUpdated: result.lastUpdated,
          isActive: result.isActive
        }
      });
    } catch (error) {
      console.error('Error al actualizar tasa de cambio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene el historial de tasas de cambio
   */
  async getExchangeRateHistory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const rates = await ExchangeRate.find({ currency: 'USD' })
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await ExchangeRate.countDocuments({ currency: 'USD' });

      res.json({
        success: true,
        rates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
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

  // ===== COMISIONES =====

  /**
   * Obtiene todas las comisiones
   */
  async getCommissions(req: Request, res: Response) {
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
  async createCommission(req: Request, res: Response) {
    try {
      const commissionData = req.body;
      
      // Validar datos requeridos
      if (!commissionData.name || commissionData.value === undefined) {
        return res.status(400).json({
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
  async updateCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const commission = await Commission.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!commission) {
        return res.status(404).json({
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
  async deleteCommission(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const commission = await Commission.findByIdAndDelete(id);

      if (!commission) {
        return res.status(404).json({
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
  async getSubscriptions(req: Request, res: Response) {
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
  async createSubscription(req: Request, res: Response) {
    try {
      const subscriptionData = req.body;
      
      if (!subscriptionData.name || subscriptionData.price === undefined) {
        return res.status(400).json({
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
  async updateSubscription(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const subscription = await Subscription.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!subscription) {
        return res.status(404).json({
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
  async deleteSubscription(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subscription = await Subscription.findByIdAndDelete(id);

      if (!subscription) {
        return res.status(404).json({
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
  async getTaxes(req: Request, res: Response) {
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
  async createTax(req: Request, res: Response) {
    try {
      const taxData = req.body;
      
      if (!taxData.name || taxData.rate === undefined) {
        return res.status(400).json({
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
  async updateTax(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tax = await Tax.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!tax) {
        return res.status(404).json({
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
  async deleteTax(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tax = await Tax.findByIdAndDelete(id);

      if (!tax) {
        return res.status(404).json({
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

  // ===== CÁLCULOS =====

  /**
   * Calculadora general de comisiones e impuestos
   */
  async calculateCommission(req: Request, res: Response) {
    try {
      const { saleAmount, storeType, exchangeRate } = req.body;

      if (!saleAmount || saleAmount <= 0) {
        return res.status(400).json({
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
        commissionRate = commission.value;
        commissionType = commission.type;
        
        if (commission.type === 'percentage') {
          commissionAmount = (saleAmount * commission.value) / 100;
        } else {
          commissionAmount = commission.value;
        }
      }

      // Calcular impuestos
      const taxBreakdown = taxes.map(tax => {
        let taxAmount = 0;
        
        if (tax.type === 'percentage') {
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
