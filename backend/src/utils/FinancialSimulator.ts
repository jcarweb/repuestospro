interface SimulationParameters {
  dailyOrders: number;
  averageOrderValue: number;
  marketplaceCommissionRate: number;
  logisticFeeBase: number;
  activeDeliverys: number;
  deliveriesPerDriver: number;
  simulationDays: number;
}

interface SimulationResult {
  day: number;
  orders: number;
  fundContributions: number;
  deliveryPayments: number;
  fundBalance: number;
  profitability: number;
  governanceAction?: string;
  adjustments?: any;
}

interface FinancialMetrics {
  totalContributions: number;
  totalPayments: number;
  netBalance: number;
  averageROI: number;
  breakEvenDay?: number;
  peakDeficit: number;
  peakSurplus: number;
}

export class FinancialSimulator {
  private parameters: SimulationParameters;
  private results: SimulationResult[] = [];
  private fundBalance: number = 10000; // Fondo inicial
  private governanceEnabled: boolean = true;

  constructor(parameters: SimulationParameters) {
    this.parameters = parameters;
  }

  /**
   * Ejecuta la simulación financiera completa
   */
  async runSimulation(): Promise<{
    results: SimulationResult[];
    metrics: FinancialMetrics;
    recommendations: string[];
  }> {
    console.log('🚀 Iniciando simulación financiera...');
    
    this.results = [];
    this.fundBalance = 10000; // Resetear fondo inicial

    for (let day = 1; day <= this.parameters.simulationDays; day++) {
      const result = await this.simulateDay(day);
      this.results.push(result);
      
      // Aplicar gobernanza si está habilitada
      if (this.governanceEnabled && result.fundBalance < 5000) {
        await this.applyGovernance(day);
      }
    }

    const metrics = this.calculateMetrics();
    const recommendations = this.generateRecommendations(metrics);

    console.log('✅ Simulación completada');
    
    return {
      results: this.results,
      metrics,
      recommendations
    };
  }

  /**
   * Simula un día específico del sistema
   */
  private async simulateDay(day: number): Promise<SimulationResult> {
    // Calcular variaciones diarias (ruido del mercado)
    const orderVariation = this.getDailyVariation();
    const dailyOrders = Math.max(1, Math.floor(this.parameters.dailyOrders * orderVariation));
    
    // Calcular aportes al fondo
    const fundContributions = this.calculateFundContributions(dailyOrders);
    
    // Calcular pagos a deliverys
    const deliveryPayments = this.calculateDeliveryPayments(dailyOrders);
    
    // Actualizar balance del fondo
    this.fundBalance += fundContributions - deliveryPayments;
    
    // Calcular rentabilidad
    const profitability = this.calculateProfitability(fundContributions, deliveryPayments);
    
    return {
      day,
      orders: dailyOrders,
      fundContributions,
      deliveryPayments,
      fundBalance: this.fundBalance,
      profitability
    };
  }

  /**
   * Calcula los aportes al fondo desde los pedidos
   */
  private calculateFundContributions(orders: number): number {
    const orderValue = this.parameters.averageOrderValue;
    const commissionRate = this.parameters.marketplaceCommissionRate / 100;
    const logisticFee = this.parameters.logisticFeeBase;
    
    // Comisión del marketplace
    const marketplaceCommission = orderValue * commissionRate;
    const marketplaceContribution = marketplaceCommission * 0.6; // 60% al fondo
    
    // Fee logístico
    const logisticContribution = logisticFee * 0.25; // 25% al fondo
    
    // Fondo solidario
    const solidarityPool = marketplaceCommission * 0.15; // 15% del pool
    const solidarityContribution = solidarityPool * 0.15; // 15% al fondo
    
    const totalContributionPerOrder = marketplaceContribution + logisticContribution + solidarityContribution;
    
    return totalContributionPerOrder * orders;
  }

  /**
   * Calcula los pagos a los deliverys
   */
  private calculateDeliveryPayments(orders: number): number {
    const deliveriesPerDriver = this.parameters.deliveriesPerDriver;
    const activeDrivers = Math.ceil(orders / deliveriesPerDriver);
    
    let totalPayments = 0;
    
    for (let i = 0; i < activeDrivers; i++) {
      const driverDeliveries = Math.min(deliveriesPerDriver, orders - (i * deliveriesPerDriver));
      
      // Pago base por entrega
      const basePayment = driverDeliveries * 5; // $5 por entrega
      
      // Calcular bono semanal (simplificado)
      const weeklyBonus = this.calculateWeeklyBonus(driverDeliveries * 7); // Proyección semanal
      
      // Bonos adicionales por rendimiento
      const performanceBonus = this.calculatePerformanceBonus(driverDeliveries);
      
      totalPayments += basePayment + weeklyBonus + performanceBonus;
    }
    
    return totalPayments;
  }

  /**
   * Calcula el bono semanal basado en entregas
   */
  private calculateWeeklyBonus(weeklyDeliveries: number): number {
    if (weeklyDeliveries >= 80) return 100; // Elite
    if (weeklyDeliveries >= 60) return 60;  // Gold
    if (weeklyDeliveries >= 40) return 30;  // Silver
    if (weeklyDeliveries >= 20) return 10;  // Bronze
    return 0;
  }

  /**
   * Calcula bonos por rendimiento
   */
  private calculatePerformanceBonus(deliveries: number): number {
    // Bono por velocidad (entregas rápidas)
    const speedBonus = deliveries * 0.5;
    
    // Bono por confiabilidad
    const reliabilityBonus = deliveries * 0.3;
    
    return speedBonus + reliabilityBonus;
  }

  /**
   * Calcula la rentabilidad del día
   */
  private calculateProfitability(contributions: number, payments: number): number {
    if (contributions === 0) return 0;
    return ((contributions - payments) / contributions) * 100;
  }

  /**
   * Aplica gobernanza automática cuando es necesario
   */
  private async applyGovernance(day: number): Promise<void> {
    const currentResult = this.results[this.results.length - 1];
    if (!currentResult) return;
    
    if (currentResult.fundBalance < 2000) {
      // Modo de emergencia - aumentar tasas significativamente
      this.parameters.logisticFeeBase *= 1.5;
      currentResult.governanceAction = 'emergency_rate_increase';
      currentResult.adjustments = {
        logisticFee: this.parameters.logisticFeeBase,
        reason: 'Emergency mode activated'
      };
    } else if (currentResult.fundBalance < 5000) {
      // Aumentar tasas moderadamente
      this.parameters.logisticFeeBase *= 1.2;
      currentResult.governanceAction = 'rate_increase';
      currentResult.adjustments = {
        logisticFee: this.parameters.logisticFeeBase,
        reason: 'Low balance detected'
      };
    }
  }

  /**
   * Obtiene variación diaria para simular ruido del mercado
   */
  private getDailyVariation(): number {
    // Distribución normal con desviación estándar del 20%
    const mean = 1.0;
    const stdDev = 0.2;
    
    // Generar número aleatorio con distribución normal
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return Math.max(0.5, Math.min(1.5, mean + stdDev * z0));
  }

  /**
   * Calcula métricas finales de la simulación
   */
  private calculateMetrics(): FinancialMetrics {
    const totalContributions = this.results.reduce((sum, r) => sum + r.fundContributions, 0);
    const totalPayments = this.results.reduce((sum, r) => sum + r.deliveryPayments, 0);
    const netBalance = totalContributions - totalPayments;
    const averageROI = totalContributions > 0 ? (netBalance / totalContributions) * 100 : 0;
    
    const breakEvenDay = this.results.findIndex(r => r.fundBalance >= 0);
    const peakDeficit = Math.min(...this.results.map(r => r.fundBalance));
    const peakSurplus = Math.max(...this.results.map(r => r.fundBalance));
    
    return {
      totalContributions,
      totalPayments,
      netBalance,
      averageROI,
      breakEvenDay: breakEvenDay >= 0 ? breakEvenDay + 1 : 0,
      peakDeficit,
      peakSurplus
    };
  }

  /**
   * Genera recomendaciones basadas en los resultados
   */
  private generateRecommendations(metrics: FinancialMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageROI < -20) {
      recommendations.push('🚨 CRÍTICO: Rentabilidad muy negativa. Revisar estructura de costos inmediatamente.');
    } else if (metrics.averageROI < 0) {
      recommendations.push('⚠️ ADVERTENCIA: Sistema en déficit. Considerar ajustes en tasas o bonos.');
    } else if (metrics.averageROI > 20) {
      recommendations.push('✅ EXCELENTE: Sistema altamente rentable. Considerar distribución de superávit.');
    }
    
    if (metrics.peakDeficit < -10000) {
      recommendations.push('💰 FONDO DE RESERVA: Se requiere fondo de emergencia de al menos $20,000.');
    }
    
    if (metrics.breakEvenDay && metrics.breakEvenDay > 30) {
      recommendations.push('⏰ TIEMPO DE EQUILIBRIO: El sistema tardará más de 30 días en alcanzar equilibrio.');
    }
    
    if (metrics.peakSurplus > 50000) {
      recommendations.push('🎁 DISTRIBUCIÓN: Considerar distribuir superávit como bonos adicionales.');
    }
    
    return recommendations;
  }

  /**
   * Genera reporte detallado de la simulación
   */
  generateReport(): string {
    const metrics = this.calculateMetrics();
    
    return `
# 📊 Reporte de Simulación Financiera

## 📈 Resumen Ejecutivo
- **Período simulado**: ${this.parameters.simulationDays} días
- **Pedidos diarios promedio**: ${this.parameters.dailyOrders}
- **Balance final del fondo**: $${this.fundBalance.toFixed(2)}
- **Rentabilidad promedio**: ${metrics.averageROI.toFixed(2)}%

## 💰 Métricas Financieras
- **Total aportes**: $${metrics.totalContributions.toFixed(2)}
- **Total pagos**: $${metrics.totalPayments.toFixed(2)}
- **Balance neto**: $${metrics.netBalance.toFixed(2)}
- **Déficit máximo**: $${metrics.peakDeficit.toFixed(2)}
- **Superávit máximo**: $${metrics.peakSurplus.toFixed(2)}

## 🎯 Punto de Equilibrio
${metrics.breakEvenDay ? 
  `- **Día de equilibrio**: ${metrics.breakEvenDay}` : 
  '- **Estado**: No alcanzado en el período simulado'
}

## 📊 Recomendaciones
${this.generateRecommendations(metrics).map(r => `- ${r}`).join('\n')}

## 🔄 Próximos Pasos
1. Implementar sistema de monitoreo en tiempo real
2. Configurar gobernanza automática
3. Establecer fondo de reserva
4. Lanzar en fase piloto
5. Escalar gradualmente
    `;
  }

  /**
   * Exporta los resultados a formato JSON
   */
  exportResults(): any {
    return {
      parameters: this.parameters,
      results: this.results,
      metrics: this.calculateMetrics(),
      recommendations: this.generateRecommendations(this.calculateMetrics())
    };
  }
}

export default FinancialSimulator;
