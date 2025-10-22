import LogisticFund from '../models/LogisticFund';
import LogisticSettings from '../models/LogisticSettings';
import FundTransaction from '../models/FundTransaction';
import LogisticLog from '../models/LogisticLog';

interface GovernanceMetrics {
  profitability: number;
  fundHealth: 'healthy' | 'warning' | 'emergency';
  balanceRatio: number;
  weeklyROI: number;
  monthlyROI: number;
  breakEvenPoint: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface GovernanceDecision {
  action: 'maintain' | 'increase_fee' | 'decrease_fee' | 'distribute_bonus' | 'emergency_fund' | 'adjust_rates';
  reason: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100%
  expectedOutcome: string;
  implementation: {
    immediate: boolean;
    gradual: boolean;
    duration: number; // días
  };
}

export class GovernanceService {
  private static instance: GovernanceService;
  private settings: any;

  static getInstance(): GovernanceService {
    if (!GovernanceService.instance) {
      GovernanceService.instance = new GovernanceService();
    }
    return GovernanceService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.settings = await LogisticSettings.findOne({ 'system.isActive': true });
      if (!this.settings) {
        throw new Error('Configuración del sistema no encontrada');
      }
      console.log('✅ GovernanceService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando GovernanceService:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el análisis de gobernanza completo
   */
  async executeGovernanceAnalysis(): Promise<GovernanceDecision> {
    try {
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }

      // Calcular métricas
      const metrics = await this.calculateGovernanceMetrics(fund);
      
      // Analizar tendencias
      const trends = await this.analyzeTrends(fund);
      
      // Tomar decisión
      const decision = await this.makeGovernanceDecision(metrics, trends);
      
      // Registrar decisión
      await this.recordGovernanceDecision(decision, metrics);
      
      return decision;
      
    } catch (error) {
      console.error('Error en análisis de gobernanza:', error);
      throw error;
    }
  }

  /**
   * Calcula métricas de gobernanza
   */
  private async calculateGovernanceMetrics(fund: any): Promise<GovernanceMetrics> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calcular rentabilidad semanal
    const weeklyContributions = await this.getContributionsInPeriod(fund.fundId, oneWeekAgo, now);
    const weeklyPayments = await this.getPaymentsInPeriod(fund.fundId, oneWeekAgo, now);
    const profitability = weeklyContributions > 0 ? 
      ((weeklyContributions - weeklyPayments) / weeklyContributions) * 100 : 0;

    // Calcular ROI
    const weeklyROI = this.calculateROI(weeklyContributions, weeklyPayments);
    const monthlyROI = await this.calculateMonthlyROI(fund.fundId);

    // Evaluar salud del fondo
    const balanceRatio = fund.currentBalance / Math.max(fund.totalContributions, 1);
    const fundHealth = this.assessFundHealth(balanceRatio, profitability);

    // Calcular punto de equilibrio
    const breakEvenPoint = this.calculateBreakEvenPoint(fund);

    // Evaluar nivel de riesgo
    const riskLevel = this.assessRiskLevel(fund, profitability, balanceRatio);

    return {
      profitability,
      fundHealth,
      balanceRatio,
      weeklyROI,
      monthlyROI,
      breakEvenPoint,
      riskLevel
    };
  }

  /**
   * Analiza tendencias del fondo
   */
  private async analyzeTrends(fund: any): Promise<any> {
    const now = new Date();
    const periods = [
      { name: 'last_24h', days: 1 },
      { name: 'last_week', days: 7 },
      { name: 'last_month', days: 30 }
    ];

    const trends = {};
    
    for (const period of periods) {
      const startDate = new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000);
      
      const contributions = await this.getContributionsInPeriod(fund.fundId, startDate, now);
      const payments = await this.getPaymentsInPeriod(fund.fundId, startDate, now);
      
      (trends as any)[period.name] = {
        contributions,
        payments,
        netFlow: contributions - payments,
        efficiency: contributions > 0 ? (contributions - payments) / contributions : 0
      };
    }

    return trends;
  }

  /**
   * Toma decisión de gobernanza basada en métricas y tendencias
   */
  private async makeGovernanceDecision(metrics: GovernanceMetrics, trends: any): Promise<GovernanceDecision> {
    const { profitability, fundHealth, riskLevel, balanceRatio } = metrics;
    
    // Casos de emergencia
    if (fundHealth === 'emergency' || riskLevel === 'critical') {
      return {
        action: 'emergency_fund',
        reason: 'Situación crítica detectada - activando modo de emergencia',
        impact: 'negative',
        confidence: 95,
        expectedOutcome: 'Estabilización del fondo en 24-48 horas',
        implementation: {
          immediate: true,
          gradual: false,
          duration: 1
        }
      };
    }

    // Rentabilidad muy baja
    if (profitability < this.settings.governance.minProfitability * 0.5) {
      return {
        action: 'increase_fee',
        reason: `Rentabilidad crítica (${profitability.toFixed(2)}%) - aumentando tasas`,
        impact: 'positive',
        confidence: 85,
        expectedOutcome: 'Incremento del 15-20% en ingresos del fondo',
        implementation: {
          immediate: true,
          gradual: false,
          duration: 3
        }
      };
    }

    // Rentabilidad baja pero manejable
    if (profitability < this.settings.governance.minProfitability) {
      return {
        action: 'adjust_rates',
        reason: `Rentabilidad baja (${profitability.toFixed(2)}%) - ajustando tasas gradualmente`,
        impact: 'positive',
        confidence: 75,
        expectedOutcome: 'Mejora gradual de la rentabilidad en 1-2 semanas',
        implementation: {
          immediate: false,
          gradual: true,
          duration: 14
        }
      };
    }

    // Superávit significativo
    if (profitability > this.settings.governance.surplusThreshold) {
      return {
        action: 'distribute_bonus',
        reason: `Superávit detectado (${profitability.toFixed(2)}%) - distribuyendo bonos`,
        impact: 'positive',
        confidence: 90,
        expectedOutcome: 'Mejora en retención y motivación de deliverys',
        implementation: {
          immediate: true,
          gradual: false,
          duration: 1
        }
      };
    }

    // Estado óptimo
    return {
      action: 'maintain',
      reason: `Rentabilidad óptima (${profitability.toFixed(2)}%) - manteniendo configuración actual`,
      impact: 'neutral',
      confidence: 95,
      expectedOutcome: 'Continuidad del rendimiento actual',
      implementation: {
        immediate: false,
        gradual: false,
        duration: 0
      }
    };
  }

  /**
   * Implementa una decisión de gobernanza
   */
  async implementGovernanceDecision(decision: GovernanceDecision): Promise<void> {
    try {
      switch (decision.action) {
        case 'increase_fee':
          await this.increaseLogisticFee();
          break;
        case 'decrease_fee':
          await this.decreaseLogisticFee();
          break;
        case 'adjust_rates':
          await this.adjustRatesGradually();
          break;
        case 'distribute_bonus':
          await this.distributeSurplusBonuses();
          break;
        case 'emergency_fund':
          await this.activateEmergencyMode();
          break;
        case 'maintain':
          // No action needed
          break;
      }

      await this.logGovernanceAction(decision);
      
    } catch (error) {
      console.error('Error implementando decisión de gobernanza:', error);
      throw error;
    }
  }

  /**
   * Obtiene reporte de gobernanza
   */
  async getGovernanceReport(): Promise<any> {
    try {
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        throw new Error('Fondo logístico no encontrado');
      }

      const metrics = await this.calculateGovernanceMetrics(fund);
      const trends = await this.analyzeTrends(fund);
      const recentDecisions = await this.getRecentGovernanceDecisions(fund.fundId);
      
      return {
        fund: {
          id: fund.fundId,
          balance: fund.currentBalance,
          status: fund.status,
          lastUpdate: fund.updatedAt
        },
        metrics,
        trends,
        recentDecisions,
        recommendations: await this.generateRecommendations(metrics, trends)
      };
      
    } catch (error) {
      console.error('Error generando reporte de gobernanza:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares
  private async getContributionsInPeriod(fundId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await FundTransaction.find({
      fundId,
      type: 'contribution',
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  private async getPaymentsInPeriod(fundId: string, startDate: Date, endDate: Date): Promise<number> {
    const transactions = await FundTransaction.find({
      fundId,
      type: 'payment',
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });
    
    return Math.abs(transactions.reduce((sum, tx) => sum + tx.amount, 0));
  }

  private calculateROI(contributions: number, payments: number): number {
    if (contributions === 0) return 0;
    return ((contributions - payments) / contributions) * 100;
  }

  private async calculateMonthlyROI(fundId: string): Promise<number> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const contributions = await this.getContributionsInPeriod(fundId, oneMonthAgo, now);
    const payments = await this.getPaymentsInPeriod(fundId, oneMonthAgo, now);
    
    return this.calculateROI(contributions, payments);
  }

  private assessFundHealth(balanceRatio: number, profitability: number): 'healthy' | 'warning' | 'emergency' {
    if (balanceRatio < 0.1 || profitability < 0) return 'emergency';
    if (balanceRatio < 0.2 || profitability < 5) return 'warning';
    return 'healthy';
  }

  private calculateBreakEvenPoint(fund: any): number {
    const avgDailyContributions = fund.totalContributions / 30; // Asumiendo 30 días
    const avgDailyPayments = fund.totalPayments / 30;
    return avgDailyContributions - avgDailyPayments;
  }

  private assessRiskLevel(fund: any, profitability: number, balanceRatio: number): 'low' | 'medium' | 'high' | 'critical' {
    if (balanceRatio < 0.05 || profitability < -10) return 'critical';
    if (balanceRatio < 0.15 || profitability < 0) return 'high';
    if (balanceRatio < 0.3 || profitability < 10) return 'medium';
    return 'low';
  }

  private async increaseLogisticFee(): Promise<void> {
    const currentFee = this.settings.rates.logisticFeeBase;
    const newFee = Math.min(currentFee * 1.15, this.settings.rates.logisticFeeMax);
    
    await LogisticSettings.findByIdAndUpdate(this.settings._id, {
      'rates.logisticFeeBase': newFee
    });
  }

  private async decreaseLogisticFee(): Promise<void> {
    const currentFee = this.settings.rates.logisticFeeBase;
    const newFee = Math.max(currentFee * 0.95, 0.3); // Mínimo $0.30
    
    await LogisticSettings.findByIdAndUpdate(this.settings._id, {
      'rates.logisticFeeBase': newFee
    });
  }

  private async adjustRatesGradually(): Promise<void> {
    // Implementar ajuste gradual de tasas
    const currentFee = this.settings.rates.logisticFeeBase;
    const newFee = Math.min(currentFee * 1.05, this.settings.rates.logisticFeeMax);
    
    await LogisticSettings.findByIdAndUpdate(this.settings._id, {
      'rates.logisticFeeBase': newFee
    });
  }

  private async distributeSurplusBonuses(): Promise<void> {
    // Implementar distribución de bonos por superávit
    const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
    if (fund) {
      const surplusAmount = fund.currentBalance * 0.1; // 10% del superávit
      // Lógica para distribuir bonos
    }
  }

  private async activateEmergencyMode(): Promise<void> {
    await LogisticFund.updateOne(
      { status: 'active' },
      { status: 'emergency' }
    );
  }

  private async getRecentGovernanceDecisions(fundId: string): Promise<any[]> {
    const fund = await LogisticFund.findOne({ fundId });
    return fund?.governance.adjustmentHistory.slice(-10) || [];
  }

  private async generateRecommendations(metrics: GovernanceMetrics, trends: any): Promise<string[]> {
    const recommendations = [];
    
    if (metrics.riskLevel === 'high' || metrics.riskLevel === 'critical') {
      recommendations.push('Considerar activación de modo de emergencia');
    }
    
    if (metrics.profitability < 10) {
      recommendations.push('Revisar estructura de tasas y comisiones');
    }
    
    if (metrics.balanceRatio < 0.2) {
      recommendations.push('Implementar estrategia de recarga del fondo');
    }
    
    return recommendations;
  }

  private async recordGovernanceDecision(decision: GovernanceDecision, metrics: GovernanceMetrics): Promise<void> {
    const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
    if (fund) {
      await LogisticFund.findByIdAndUpdate(fund._id, {
        $push: {
          'governance.adjustmentHistory': {
            date: new Date(),
            type: decision.action,
            reason: decision.reason,
            oldValue: metrics.profitability,
            newValue: decision.expectedOutcome
          }
        }
      });
    }
  }

  private async logGovernanceAction(decision: GovernanceDecision): Promise<void> {
    try {
      const log = new LogisticLog({
        action: 'governance_decision',
        description: `Decisión de gobernanza: ${decision.action} - ${decision.reason}`,
        level: 'info',
        category: 'governance',
        eventData: {
          governanceAction: decision.action,
          reason: decision.reason,
          impact: decision.impact,
          confidence: decision.confidence
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
      console.error('Error guardando log de gobernanza:', error);
    }
  }
}

export default GovernanceService;
