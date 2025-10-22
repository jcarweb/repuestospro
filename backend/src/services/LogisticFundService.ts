import LogisticFund from '../models/LogisticFund';
import FundTransaction from '../models/FundTransaction';
import LogisticSettings from '../models/LogisticSettings';
import LogisticLog from '../models/LogisticLog';
import DeliveryBonus from '../models/DeliveryBonus';

interface FundContribution {
  orderValue: number;
  marketplaceCommission: number;
  logisticFee: number;
  solidarityPool: number;
  totalContribution: number;
  distribution: {
    fromMarketplace: number;
    fromLogisticFee: number;
    fromSolidarity: number;
  };
}

interface GovernanceAdjustment {
  action: 'increase_fee' | 'decrease_fee' | 'distribute_bonus' | 'emergency_fund' | 'maintain';
  reason: string;
  oldValue?: number;
  newValue?: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export class LogisticFundService {
  private static instance: LogisticFundService;
  private settings: any;

  static getInstance(): LogisticFundService {
    if (!LogisticFundService.instance) {
      LogisticFundService.instance = new LogisticFundService();
    }
    return LogisticFundService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Cargar configuración
      this.settings = await LogisticSettings.findOne({ 'system.isActive': true });
      if (!this.settings) {
        throw new Error('Configuración del sistema logístico no encontrada');
      }

      // Verificar si existe un fondo activo
      let fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      
      if (!fund) {
        // Crear fondo inicial
        fund = new LogisticFund({
          currentBalance: 10000, // Fondo inicial de $10,000
          emergencyReserve: 500, // 5% de reserva
          status: 'active'
        });
        await fund.save();

        await this.logEvent('fund_created', 'Fondo logístico inicial creado', 'info', 'fund', {
          fundId: fund.fundId,
          initialBalance: 10000
        });
      }

      console.log('✅ LogisticFundService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando LogisticFundService:', error);
      throw error;
    }
  }

  /**
   * Procesa un aporte al fondo desde un pedido
   */
  async processOrderContribution(orderData: {
    orderId: string;
    orderValue: number;
    customerId: string;
    storeId: string;
    zone: string;
    peakHours: boolean;
    priority: 'normal' | 'high' | 'urgent';
  }): Promise<FundContribution> {
    try {
      const { orderValue, orderId, zone, peakHours, priority } = orderData;
      
      // Calcular comisión del marketplace (12% por defecto)
      const marketplaceCommission = orderValue * (this.settings.rates.marketplaceCommissionRate / 100);
      
      // Calcular fee logístico (base + ajustes por zona/demanda)
      const baseLogisticFee = this.settings.rates.logisticFeeBase;
      const zoneMultiplier = this.getZoneMultiplier(zone);
      const demandMultiplier = this.getDemandMultiplier(zone);
      const logisticFee = Math.min(
        baseLogisticFee * zoneMultiplier * demandMultiplier,
        this.settings.rates.logisticFeeMax
      );
      
      // Calcular fondo solidario (15% de la comisión)
      const solidarityPool = marketplaceCommission * (this.settings.rates.solidarityPoolRate / 100);
      
      // Distribuir aportes al fondo
      const distribution = {
        fromMarketplace: marketplaceCommission * 0.6, // 60% de la comisión
        fromLogisticFee: logisticFee * 0.25, // 25% del fee
        fromSolidarity: solidarityPool * 0.15 // 15% del pool
      };
      
      const totalContribution = distribution.fromMarketplace + distribution.fromLogisticFee + distribution.fromSolidarity;
      
      // Actualizar fondo
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }
      
      await LogisticFund.findByIdAndUpdate(fund._id, {
        $inc: {
          currentBalance: totalContribution,
          totalContributions: totalContribution
        },
        $set: {
          'revenueSources.marketplaceCommission.total': fund.revenueSources.marketplaceCommission.total + distribution.fromMarketplace,
          'revenueSources.logisticFee.total': fund.revenueSources.logisticFee.total + distribution.fromLogisticFee,
          'revenueSources.solidarityPool.total': fund.revenueSources.solidarityPool.total + distribution.fromSolidarity
        }
      });
      
      // Crear transacción de aporte
      const transaction = new FundTransaction({
        fundId: fund.fundId,
        orderId,
        type: 'contribution',
        amount: totalContribution,
        description: `Aporte al fondo desde pedido ${orderId}`,
        contributionDetails: {
          orderValue,
          marketplaceCommission,
          logisticFee,
          solidarityPool,
          totalContribution,
          distribution
        },
        metadata: {
          zone,
          peakHours,
          priority
        },
        status: 'completed',
        processedAt: new Date()
      });
      
      await transaction.save();
      
      // Log del evento
      await this.logEvent('fund_contribution', `Aporte procesado: $${totalContribution}`, 'info', 'fund', {
        fundId: fund.fundId,
        orderId,
        orderValue,
        totalContribution,
        newBalance: fund.currentBalance + totalContribution
      });
      
      return {
        orderValue,
        marketplaceCommission,
        logisticFee,
        solidarityPool,
        totalContribution,
        distribution
      };
      
    } catch (error) {
      console.error('Error procesando aporte al fondo:', error);
      await this.logEvent('fund_contribution_error', `Error procesando aporte: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error', 'fund', {
        orderId: orderData.orderId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Procesa un pago a un delivery desde el fondo
   */
  async processDeliveryPayment(paymentData: {
    deliveryId: string;
    orderId: string;
    basePayment: number;
    bonusAmount: number;
    deliveryLevel: 'bronze' | 'silver' | 'gold' | 'elite';
    performance: {
      rating: number;
      deliveryTime: number;
      distance: number;
      onTime: boolean;
    };
  }): Promise<number> {
    try {
      const { deliveryId, orderId, basePayment, bonusAmount, deliveryLevel, performance } = paymentData;
      
      const totalPayment = basePayment + bonusAmount;
      
      // Verificar saldo del fondo
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }
      
      if (fund.currentBalance < totalPayment) {
        // Activar modo de emergencia si el saldo es insuficiente
        await this.activateEmergencyMode(fund._id, totalPayment);
        throw new Error('Saldo insuficiente en el fondo logístico');
      }
      
      // Debitar del fondo
      await LogisticFund.findByIdAndUpdate(fund._id, {
        $inc: {
          currentBalance: -totalPayment,
          totalPayments: totalPayment
        }
      });
      
      // Crear transacción de pago
      const transaction = new FundTransaction({
        fundId: fund.fundId,
        orderId,
        deliveryId,
        type: 'payment',
        amount: -totalPayment,
        description: `Pago a delivery ${deliveryId} por entrega`,
        paymentDetails: {
          basePayment,
          bonusAmount,
          totalPayment,
          deliveryLevel,
          performanceBonus: bonusAmount * 0.5, // 50% del bono por rendimiento
          loyaltyBonus: bonusAmount * 0.5 // 50% del bono por fidelidad
        },
        metadata: {
          rating: performance.rating,
          deliveryTime: performance.deliveryTime,
          distance: performance.distance,
          onTime: performance.onTime
        },
        status: 'completed',
        processedAt: new Date()
      });
      
      await transaction.save();
      
      // Log del evento
      await this.logEvent('delivery_payment', `Pago procesado: $${totalPayment}`, 'info', 'payment', {
        fundId: fund.fundId,
        deliveryId,
        orderId,
        totalPayment,
        newBalance: fund.currentBalance - totalPayment
      });
      
      return totalPayment;
      
    } catch (error) {
      console.error('Error procesando pago al delivery:', error);
      await this.logEvent('delivery_payment_error', `Error procesando pago: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error', 'payment', {
        deliveryId: paymentData.deliveryId,
        orderId: paymentData.orderId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Ejecuta la gobernanza automática del fondo
   */
  async executeGovernance(): Promise<GovernanceAdjustment> {
    try {
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }
      
      // Calcular métricas de rentabilidad
      const profitability = await this.calculateProfitability(fund._id);
      const fundHealth = await this.assessFundHealth(fund);
      
      let adjustment: GovernanceAdjustment;
      
      if (profitability < this.settings.governance.minProfitability) {
        // Rentabilidad baja - aumentar tasas
        adjustment = await this.increaseRates(fund);
      } else if (profitability > this.settings.governance.surplusThreshold) {
        // Superávit - distribuir bonos
        adjustment = await this.distributeSurplus(fund);
      } else if (fundHealth === 'emergency') {
        // Emergencia - activar modo de emergencia
        adjustment = await this.activateEmergencyMode(fund._id);
      } else {
        // Estado óptimo - mantener
        adjustment = {
          action: 'maintain',
          reason: 'Rentabilidad óptima',
          impact: 'neutral'
        };
      }
      
      // Registrar ajuste en el historial
      if (adjustment.action !== 'maintain') {
        await LogisticFund.findByIdAndUpdate(fund._id, {
          $push: {
            'governance.adjustmentHistory': {
              date: new Date(),
              type: adjustment.action,
              reason: adjustment.reason,
              oldValue: adjustment.oldValue,
              newValue: adjustment.newValue
            }
          },
          $set: {
            'governance.lastAdjustment': new Date()
          }
        });
      }
      
      // Log del evento
      await this.logEvent('governance_execution', `Gobernanza ejecutada: ${adjustment.action}`, 'info', 'governance', {
        fundId: fund.fundId,
        profitability,
        fundHealth,
        adjustment
      });
      
      return adjustment;
      
    } catch (error) {
      console.error('Error ejecutando gobernanza:', error);
      await this.logEvent('governance_error', `Error en gobernanza: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error', 'governance', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Calcula y distribuye bonos semanales
   */
  async calculateWeeklyBonuses(): Promise<void> {
    try {
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }
      
      // Obtener deliverys activos
      const activeDeliverys = await this.getActiveDeliverys();
      
      for (const delivery of activeDeliverys) {
        const weeklyStats = await this.getWeeklyStats(delivery._id);
        const bonus = await this.calculateDeliveryBonus(delivery._id, weeklyStats);
        
        if (bonus.amount > 0) {
          // Crear bono
          const deliveryBonus = new DeliveryBonus({
            deliveryId: delivery._id,
            fundId: fund.fundId,
            bonusType: 'weekly',
            amount: bonus.amount,
            description: `Bono semanal nivel ${bonus.level}`,
            period: bonus.period,
            eligibilityCriteria: bonus.eligibility,
            bonusRules: bonus.rules,
            status: 'approved'
          });
          
          await deliveryBonus.save();
          
          // Procesar pago del bono
          await this.processDeliveryPayment({
            deliveryId: delivery._id,
            orderId: `bonus_${delivery._id}_${Date.now()}`,
            basePayment: 0,
            bonusAmount: bonus.amount,
            deliveryLevel: bonus.level,
            performance: weeklyStats.performance
          });
        }
      }
      
      await this.logEvent('weekly_bonuses_calculated', 'Bonos semanales calculados', 'info', 'bonus', {
        fundId: fund.fundId,
        totalDeliverys: activeDeliverys.length
      });
      
    } catch (error) {
      console.error('Error calculando bonos semanales:', error);
      await this.logEvent('weekly_bonuses_error', `Error calculando bonos: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error', 'bonus', {
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }

  /**
   * Obtiene el estado actual del fondo
   */
  async getFundStatus(): Promise<any> {
    try {
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }
      
      // Calcular métricas adicionales
      const profitability = await this.calculateProfitability(fund._id);
      const fundHealth = await this.assessFundHealth(fund);
      const recentTransactions = await FundTransaction
        .find({ fundId: fund.fundId })
        .sort({ createdAt: -1 })
        .limit(10);
      
      return {
        fund,
        profitability,
        fundHealth,
        recentTransactions,
        settings: this.settings
      };
      
    } catch (error) {
      console.error('Error obteniendo estado del fondo:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares
  private getZoneMultiplier(zone: string): number {
    const zoneConfig = this.settings.zones.get(zone);
    return zoneConfig?.multiplier || 1.0;
  }

  private getDemandMultiplier(zone: string): number {
    const zoneConfig = this.settings.zones.get(zone);
    const demandLevel = zoneConfig?.demandLevel || 'medium';
    
    const multipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.2,
      critical: 1.5
    };
    
    return (multipliers as any)[demandLevel] || 1.0;
  }

  private async calculateProfitability(fundId: string): Promise<number> {
    // Implementar cálculo de rentabilidad
    const fund = await LogisticFund.findById(fundId);
    if (!fund) return 0;
    
    const weeklyContributions = fund.revenueSources.marketplaceCommission.total + 
                              fund.revenueSources.logisticFee.total + 
                              fund.revenueSources.solidarityPool.total;
    
    const weeklyPayments = fund.totalPayments;
    const profitability = ((weeklyContributions - weeklyPayments) / weeklyContributions) * 100;
    
    return Math.max(0, profitability);
  }

  private async assessFundHealth(fund: any): Promise<'healthy' | 'warning' | 'emergency'> {
    const balanceRatio = fund.currentBalance / fund.totalContributions;
    
    if (balanceRatio < 0.1) return 'emergency';
    if (balanceRatio < 0.2) return 'warning';
    return 'healthy';
  }

  private async increaseRates(fund: any): Promise<GovernanceAdjustment> {
    const currentFee = this.settings.rates.logisticFeeBase;
    const newFee = Math.min(currentFee * 1.1, this.settings.rates.logisticFeeMax);
    
    // Actualizar configuración
    await LogisticSettings.findByIdAndUpdate(this.settings._id, {
      'rates.logisticFeeBase': newFee
    });
    
    return {
      action: 'increase_fee',
      reason: 'Rentabilidad baja detectada',
      oldValue: currentFee,
      newValue: newFee,
      impact: 'positive'
    };
  }

  private async distributeSurplus(fund: any): Promise<GovernanceAdjustment> {
    const surplusAmount = fund.currentBalance * 0.1; // 10% del superávit
    
    // Distribuir bonos globales
    await this.distributeGlobalBonuses(surplusAmount);
    
    return {
      action: 'distribute_bonus',
      reason: 'Superávit detectado - distribuyendo bonos',
      newValue: surplusAmount,
      impact: 'positive'
    };
  }

  private async activateEmergencyMode(fundId: string, requiredAmount?: number): Promise<GovernanceAdjustment> {
    // Implementar modo de emergencia
    await LogisticFund.findByIdAndUpdate(fundId, {
      status: 'emergency'
    });
    
    return {
      action: 'emergency_fund',
      reason: 'Modo de emergencia activado',
      impact: 'negative'
    };
  }

  private async getActiveDeliverys(): Promise<any[]> {
    // Implementar consulta de deliverys activos
    return [];
  }

  private async getWeeklyStats(deliveryId: string): Promise<any> {
    // Implementar estadísticas semanales del delivery
    return { performance: { rating: 4.5, deliveryTime: 30, distance: 5, onTime: true } };
  }

  private async calculateDeliveryBonus(deliveryId: string, stats: any): Promise<any> {
    // Implementar cálculo de bono del delivery
    return {
      amount: 10,
      level: 'bronze',
      period: { startDate: new Date(), endDate: new Date(), weekNumber: 1, year: 2024 },
      eligibility: { weeklyDeliveries: 20, totalDeliveries: 100, averageRating: 4.5, onTimeDeliveries: 18, completedDeliveries: 20, cancelledDeliveries: 0, level: 'bronze' },
      rules: { level: 'bronze', threshold: 20, baseBonus: 10, multiplier: 1.0, ratingBonus: 0, speedBonus: 0, loyaltyBonus: 0, totalCalculated: 10 }
    };
  }

  private async distributeGlobalBonuses(amount: number): Promise<void> {
    // Implementar distribución de bonos globales
  }

  private async logEvent(action: string, description: string, level: string, category: string, data: any): Promise<void> {
    try {
      const log = new LogisticLog({
        action,
        description,
        level: level as any,
        category: category as any,
        eventData: data,
        systemInfo: {
          version: '1.0.0',
          environment: process.env['NODE_ENV'] as any || 'development',
          serverId: process.env['SERVER_ID'] || 'server-1'
        },
        timestamp: new Date()
      });
      
      await log.save();
    } catch (error) {
      console.error('Error guardando log:', error);
    }
  }
  // Métodos adicionales requeridos por los controladores
  async getFundTransactions(fundId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const transactions = await FundTransaction.find({ fundId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
      
      return transactions;
    } catch (error) {
      console.error('Error obteniendo transacciones del fondo:', error);
      return [];
    }
  }

  async getFundMetrics(fundId: string): Promise<any> {
    try {
      const fund = await LogisticFund.findById(fundId);
      if (!fund) {
        throw new Error('Fondo no encontrado');
      }

      const totalContributions = await FundTransaction.aggregate([
        { $match: { fundId, type: 'contribution' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalPayments = await FundTransaction.aggregate([
        { $match: { fundId, type: 'payment' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        fundBalance: (fund as any).balance || 0,
        totalContributions: totalContributions[0]?.total || 0,
        totalPayments: totalPayments[0]?.total || 0,
        netBalance: (fund as any).balance || 0,
        lastUpdated: fund.updatedAt
      };
    } catch (error) {
      console.error('Error obteniendo métricas del fondo:', error);
      return {
        fundBalance: 0,
        totalContributions: 0,
        totalPayments: 0,
        netBalance: 0,
        lastUpdated: new Date()
      };
    }
  }
}

export default LogisticFundService;
