import DeliveryBonus from '../models/DeliveryBonus';
import LogisticSettings from '../models/LogisticSettings';
import LogisticLog from '../models/LogisticLog';

interface DeliveryStats {
  weeklyDeliveries: number;
  totalDeliveries: number;
  averageRating: number;
  onTimeDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
  performance: {
    speed: number; // minutos promedio por entrega
    distance: number; // km promedio por entrega
    customerSatisfaction: number; // rating promedio
    reliability: number; // % de entregas a tiempo
  };
}

interface BonusCalculation {
  amount: number;
  level: 'bronze' | 'silver' | 'gold' | 'elite';
  breakdown: {
    baseBonus: number;
    performanceBonus: number;
    loyaltyBonus: number;
    speedBonus: number;
    volumeBonus: number;
    specialBonus: number;
  };
  eligibility: {
    meetsThreshold: boolean;
    meetsRating: boolean;
    meetsReliability: boolean;
    meetsVolume: boolean;
  };
  period: {
    startDate: Date;
    endDate: Date;
    weekNumber: number;
    year: number;
  };
}

export class BonusCalculationService {
  private static instance: BonusCalculationService;
  private settings: any;

  static getInstance(): BonusCalculationService {
    if (!BonusCalculationService.instance) {
      BonusCalculationService.instance = new BonusCalculationService();
    }
    return BonusCalculationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.settings = await LogisticSettings.findOne({ 'system.isActive': true });
      if (!this.settings) {
        throw new Error('Configuración del sistema no encontrada');
      }
      console.log('✅ BonusCalculationService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando BonusCalculationService:', error);
      throw error;
    }
  }

  /**
   * Calcula el bono semanal para un delivery
   */
  async calculateWeeklyBonus(deliveryId: string, stats: DeliveryStats): Promise<BonusCalculation> {
    try {
      // Determinar nivel del delivery
      const level = this.determineDeliveryLevel(stats.weeklyDeliveries);
      
      // Verificar elegibilidad
      const eligibility = this.checkEligibility(stats, level);
      
      if (!eligibility.meetsThreshold) {
        return {
          amount: 0,
          level,
          breakdown: {
            baseBonus: 0,
            performanceBonus: 0,
            loyaltyBonus: 0,
            speedBonus: 0,
            volumeBonus: 0,
            specialBonus: 0
          },
          eligibility,
          period: this.getCurrentWeekPeriod()
        };
      }

      // Calcular componentes del bono
      const breakdown = await this.calculateBonusBreakdown(stats, level);
      
      const totalBonus = Object.values(breakdown).reduce((sum: number, amount: any) => sum + (amount || 0), 0);

      return {
        amount: totalBonus,
        level,
        breakdown,
        eligibility,
        period: this.getCurrentWeekPeriod()
      };

    } catch (error) {
      console.error('Error calculando bono semanal:', error);
      throw error;
    }
  }

  /**
   * Procesa todos los bonos semanales
   */
  async processWeeklyBonuses(): Promise<void> {
    try {
      const activeDeliverys = await this.getActiveDeliverys();
      const currentWeek = this.getCurrentWeekPeriod();
      
      let totalBonuses = 0;
      let processedCount = 0;

      for (const delivery of activeDeliverys) {
        try {
          // Obtener estadísticas del delivery
          const stats = await this.getDeliveryStats(delivery._id, currentWeek);
          
          // Calcular bono
          const bonus = await this.calculateWeeklyBonus(delivery._id, stats);
          
          if (bonus.amount > 0) {
            // Crear registro de bono
            const deliveryBonus = new DeliveryBonus({
              deliveryId: delivery._id,
              fundId: 'main_fund', // ID del fondo principal
              bonusType: 'weekly',
              amount: bonus.amount,
              description: `Bono semanal nivel ${bonus.level} - ${currentWeek.weekNumber}/${currentWeek.year}`,
              period: bonus.period,
              eligibilityCriteria: {
                weeklyDeliveries: stats.weeklyDeliveries,
                totalDeliveries: stats.totalDeliveries,
                averageRating: stats.averageRating,
                onTimeDeliveries: stats.onTimeDeliveries,
                completedDeliveries: stats.completedDeliveries,
                cancelledDeliveries: stats.cancelledDeliveries,
                level: bonus.level
              },
              bonusRules: {
                level: bonus.level,
                threshold: this.getLevelThreshold(bonus.level),
                baseBonus: bonus.breakdown.baseBonus,
                multiplier: this.getLevelMultiplier(bonus.level),
                ratingBonus: bonus.breakdown.performanceBonus,
                speedBonus: bonus.breakdown.speedBonus,
                loyaltyBonus: bonus.breakdown.loyaltyBonus,
                totalCalculated: bonus.amount
              },
              status: 'approved'
            });

            await deliveryBonus.save();
            
            totalBonuses += bonus.amount;
            processedCount++;
            
            // Log del bono
            await this.logBonusEvent('weekly_bonus_created', delivery._id, bonus.amount, bonus.level);
          }
          
        } catch (error) {
          console.error(`Error procesando bono para delivery ${delivery._id}:`, error);
          await this.logBonusEvent('bonus_error', delivery._id, 0, 'error', error instanceof Error ? error.message : 'Error desconocido');
        }
      }

      // Log del procesamiento
      await this.logBonusEvent('weekly_bonuses_processed', 'system', totalBonuses, 'system', {
        processedCount,
        totalBonuses,
        week: currentWeek.weekNumber
      });

      console.log(`✅ Procesados ${processedCount} bonos semanales por un total de $${totalBonuses}`);

    } catch (error) {
      console.error('Error procesando bonos semanales:', error);
      throw error;
    }
  }

  /**
   * Calcula bonos especiales por rendimiento excepcional
   */
  async calculateSpecialBonuses(): Promise<void> {
    try {
      const activeDeliverys = await this.getActiveDeliverys();
      const currentWeek = this.getCurrentWeekPeriod();
      
      for (const delivery of activeDeliverys) {
        const stats = await this.getDeliveryStats(delivery._id, currentWeek);
        
        // Bono por velocidad excepcional
        if (stats.performance.speed < 20) { // Menos de 20 minutos promedio
          await this.createSpecialBonus(delivery._id, 'speed', 5, 'Entrega rápida excepcional');
        }
        
        // Bono por rating perfecto
        if (stats.averageRating >= 4.9) {
          await this.createSpecialBonus(delivery._id, 'rating', 10, 'Rating perfecto');
        }
        
        // Bono por volumen excepcional
        if (stats.weeklyDeliveries > 100) {
          await this.createSpecialBonus(delivery._id, 'volume', 20, 'Volumen excepcional');
        }
        
        // Bono por confiabilidad perfecta
        if (stats.performance.reliability >= 0.98) {
          await this.createSpecialBonus(delivery._id, 'reliability', 15, 'Confiabilidad perfecta');
        }
      }
      
    } catch (error) {
      console.error('Error calculando bonos especiales:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de bonos de un delivery
   */
  async getDeliveryBonusHistory(deliveryId: string, limit: number = 20): Promise<any[]> {
    try {
      return await DeliveryBonus.find({ deliveryId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('deliveryId', 'name email');
        
    } catch (error) {
      console.error('Error obteniendo historial de bonos:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de bonos del sistema
   */
  async getBonusStatistics(): Promise<any> {
    try {
      const currentWeek = this.getCurrentWeekPeriod();
      
      const weeklyBonuses = await DeliveryBonus.find({
        bonusType: 'weekly',
        'period.weekNumber': currentWeek.weekNumber,
        'period.year': currentWeek.year
      });
      
      const totalBonuses = weeklyBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const averageBonus = weeklyBonuses.length > 0 ? totalBonuses / weeklyBonuses.length : 0;
      
      const levelDistribution = {
        bronze: weeklyBonuses.filter(b => b.bonusRules.level === 'bronze').length,
        silver: weeklyBonuses.filter(b => b.bonusRules.level === 'silver').length,
        gold: weeklyBonuses.filter(b => b.bonusRules.level === 'gold').length,
        elite: weeklyBonuses.filter(b => b.bonusRules.level === 'elite').length
      };
      
      return {
        currentWeek,
        totalBonuses,
        averageBonus,
        bonusCount: weeklyBonuses.length,
        levelDistribution,
        topPerformers: await this.getTopPerformers(10)
      };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas de bonos:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares
  private determineDeliveryLevel(weeklyDeliveries: number): 'bronze' | 'silver' | 'gold' | 'elite' {
    if (weeklyDeliveries >= 80) return 'elite';
    if (weeklyDeliveries >= 60) return 'gold';
    if (weeklyDeliveries >= 40) return 'silver';
    return 'bronze';
  }

  private checkEligibility(stats: DeliveryStats, level: string): any {
    const levelConfig = this.settings.bonusLevels[level];
    
    return {
      meetsThreshold: stats.weeklyDeliveries >= levelConfig.threshold,
      meetsRating: stats.averageRating >= 4.0,
      meetsReliability: stats.performance.reliability >= 0.85,
      meetsVolume: stats.weeklyDeliveries >= 20
    };
  }

  private async calculateBonusBreakdown(stats: DeliveryStats, level: string): Promise<any> {
    const levelConfig = this.settings.bonusLevels[level];
    
    // Bono base del nivel
    const baseBonus = levelConfig.baseBonus;
    
    // Bono por rendimiento (rating)
    const performanceBonus = Math.max(0, (stats.averageRating - 4.0) * 5);
    
    // Bono por velocidad
    const speedBonus = stats.performance.speed < 25 ? 2 : 0;
    
    // Bono por fidelidad (entregas totales)
    const loyaltyBonus = Math.min(stats.totalDeliveries * 0.1, 10);
    
    // Bono por volumen (entregas semanales)
    const volumeBonus = Math.max(0, (stats.weeklyDeliveries - levelConfig.threshold) * 0.5);
    
    // Bono especial por confiabilidad
    const specialBonus = stats.performance.reliability >= 0.95 ? 5 : 0;
    
    return {
      baseBonus,
      performanceBonus,
      loyaltyBonus,
      speedBonus,
      volumeBonus,
      specialBonus
    };
  }

  private getCurrentWeekPeriod(): any {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      weekNumber,
      year: now.getFullYear()
    };
  }

  private getLevelThreshold(level: string): number {
    return this.settings.bonusLevels[level].threshold;
  }

  private getLevelMultiplier(level: string): number {
    return this.settings.bonusLevels[level].multiplier;
  }

  private async getActiveDeliverys(): Promise<any[]> {
    // Implementar consulta de deliverys activos
    // Por ahora retornamos un array vacío
    return [];
  }

  private async getDeliveryStats(deliveryId: string, period: any): Promise<DeliveryStats> {
    // Implementar consulta de estadísticas del delivery
    // Por ahora retornamos datos de ejemplo
    return {
      weeklyDeliveries: 25,
      totalDeliveries: 150,
      averageRating: 4.7,
      onTimeDeliveries: 23,
      completedDeliveries: 25,
      cancelledDeliveries: 0,
      level: 'bronze',
      performance: {
        speed: 22,
        distance: 5.2,
        customerSatisfaction: 4.7,
        reliability: 0.92
      }
    };
  }

  private async createSpecialBonus(deliveryId: string, type: string, amount: number, description: string): Promise<void> {
    const bonus = new DeliveryBonus({
      deliveryId,
      fundId: 'main_fund',
      bonusType: 'special',
      amount,
      description: `Bono especial: ${description}`,
      period: this.getCurrentWeekPeriod(),
      eligibilityCriteria: {
        weeklyDeliveries: 0,
        totalDeliveries: 0,
        averageRating: 0,
        onTimeDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        level: 'bronze'
      },
      bonusRules: {
        level: 'bronze',
        threshold: 0,
        baseBonus: amount,
        multiplier: 1.0,
        ratingBonus: 0,
        speedBonus: 0,
        loyaltyBonus: 0,
        totalCalculated: amount
      },
      status: 'approved'
    });
    
    await bonus.save();
  }

  private async getTopPerformers(limit: number): Promise<any[]> {
    return await DeliveryBonus.aggregate([
      { $match: { bonusType: 'weekly', status: 'approved' } },
      { $group: { _id: '$deliveryId', totalBonus: { $sum: '$amount' } } },
      { $sort: { totalBonus: -1 } },
      { $limit: limit }
    ]);
  }

  private async logBonusEvent(action: string, deliveryId: string, amount: number, level: string, details?: any): Promise<void> {
    try {
      const log = new LogisticLog({
        action,
        description: `Bono calculado: $${amount} para delivery ${deliveryId}`,
        level: 'info',
        category: 'bonus',
        context: { deliveryId },
        eventData: {
          bonusAmount: amount,
          deliveryLevel: level,
          ...details
        },
        systemInfo: {
          version: '1.0.0',
          environment: process.env['NODE_ENV'] as any || 'development',
          serverId: process.env['SERVER_ID'] || 'server-1'
        },
        timestamp: new Date()
      });
      
      await log.save();
    } catch (error) {
      console.error('Error guardando log de bono:', error);
    }
  }
}

export default BonusCalculationService;
