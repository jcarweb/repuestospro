import { Request, Response } from 'express';
import LogisticSettings from '../models/LogisticSettings';
import LogisticFund from '../models/LogisticFund';
import FundTransaction from '../models/FundTransaction';
import DeliveryBonus from '../models/DeliveryBonus';
import LogisticLog from '../models/LogisticLog';

export class AdminLogisticController {
  /**
   * Obtiene la configuración del sistema logístico
   */
  async getLogisticSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await LogisticSettings.findOne({ 'system.isActive': true });
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Configuración del sistema no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Configuración obtenida correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuración del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza la configuración del sistema logístico
   */
  async updateLogisticSettings(req: Request, res: Response): Promise<void> {
    try {
      const { rates, deliveryPayments, bonusLevels, governance, zones, withdrawals, notifications } = req.body;
      const adminId = (req.user as any)?._id;

      // Validar permisos de administrador
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'No autorizado para realizar esta acción'
        });
        return;
      }

      const updateData: any = {
        lastUpdated: new Date(),
        updatedBy: adminId
      };

      // Actualizar solo los campos proporcionados
      if (rates) updateData.rates = rates;
      if (deliveryPayments) updateData.deliveryPayments = deliveryPayments;
      if (bonusLevels) updateData.bonusLevels = bonusLevels;
      if (governance) updateData.governance = governance;
      if (zones) updateData.zones = zones;
      if (withdrawals) updateData.withdrawals = withdrawals;
      if (notifications) updateData.notifications = notifications;

      const settings = await LogisticSettings.findOneAndUpdate(
        { 'system.isActive': true },
        { $set: updateData },
        { new: true }
      );

      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'Configuración del sistema no encontrada'
        });
        return;
      }

      // Registrar cambio en el historial
      await this.recordSettingsChange(settings._id, adminId, req.body);

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Configuración actualizada correctamente'
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando configuración del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene el dashboard administrativo del sistema logístico
   */
  async getLogisticDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'week' } = req.query;
      
      // Obtener datos del fondo
      const fund = await LogisticFund.findOne({ status: 'active', isActive: true });
      if (!fund) {
        res.status(404).json({
          success: false,
          message: 'Fondo logístico no encontrado'
        });
        return;
      }

      // Calcular métricas del período
      const startDate = this.getPeriodStartDate(period as string);
      const endDate = new Date();

      const [transactions, bonuses, logs] = await Promise.all([
        this.getPeriodTransactions(fund.fundId, startDate, endDate),
        this.getPeriodBonuses(startDate, endDate),
        this.getPeriodLogs(startDate, endDate)
      ]);

      // Calcular estadísticas
      const statistics = this.calculateDashboardStatistics(transactions, bonuses, fund);

      res.status(200).json({
        success: true,
        data: {
          fund: {
            id: fund.fundId,
            balance: fund.currentBalance,
            status: fund.status,
            totalContributions: fund.totalContributions,
            totalPayments: fund.totalPayments,
            emergencyReserve: fund.emergencyReserve
          },
          period: {
            start: startDate,
            end: endDate,
            type: period
          },
          statistics,
          recentTransactions: transactions.slice(0, 10),
          recentBonuses: bonuses.slice(0, 10),
          systemHealth: await this.assessSystemHealth(fund, statistics)
        },
        message: 'Dashboard obtenido correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo dashboard del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene reportes de rentabilidad del sistema
   */
  async getProfitabilityReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const report = await this.generateProfitabilityReport(start, end, groupBy as string);

      res.status(200).json({
        success: true,
        data: report,
        message: 'Reporte de rentabilidad obtenido correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo reporte de rentabilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo reporte de rentabilidad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene estadísticas de deliverys
   */
  async getDeliveryStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'week', level } = req.query;
      
      const startDate = this.getPeriodStartDate(period as string);
      const endDate = new Date();

      const statistics = await this.calculateDeliveryStatistics(startDate, endDate, level as string);

      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Estadísticas de deliverys obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de deliverys:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de deliverys',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene logs del sistema
   */
  async getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 50, 
        level, 
        category, 
        startDate, 
        endDate 
      } = req.query;

      const query: any = {};
      if (level) query.level = level;
      if (category) query.category = category;
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const logs = await LogisticLog.find(query)
        .sort({ timestamp: -1 })
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string));

      const totalLogs = await LogisticLog.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalLogs,
            pages: Math.ceil(totalLogs / parseInt(limit as string))
          }
        },
        message: 'Logs del sistema obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo logs del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Exporta datos del sistema
   */
  async exportSystemData(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      let data;
      switch (type) {
        case 'transactions':
          data = await this.exportTransactions(start, end);
          break;
        case 'bonuses':
          data = await this.exportBonuses(start, end);
          break;
        case 'logs':
          data = await this.exportLogs(start, end);
          break;
        default:
          res.status(400).json({
            success: false,
            message: 'Tipo de exportación no válido'
          });
          return;
      }

      res.status(200).json({
        success: true,
        data,
        message: 'Datos exportados correctamente'
      });
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error exportando datos del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Métodos privados auxiliares
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  private async getPeriodTransactions(fundId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await FundTransaction.find({
      fundId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
  }

  private async getPeriodBonuses(startDate: Date, endDate: Date): Promise<any[]> {
    return await DeliveryBonus.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
  }

  private async getPeriodLogs(startDate: Date, endDate: Date): Promise<any[]> {
    return await LogisticLog.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });
  }

  private calculateDashboardStatistics(transactions: any[], bonuses: any[], fund: any): any {
    const totalContributions = transactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = Math.abs(transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    
    const profitability = totalContributions > 0 ? 
      ((totalContributions - totalPayments) / totalContributions) * 100 : 0;

    return {
      totalContributions,
      totalPayments,
      totalBonuses,
      profitability,
      netFlow: totalContributions - totalPayments,
      averageTransaction: transactions.length > 0 ? 
        (totalContributions + totalPayments) / transactions.length : 0,
      averageBonus: bonuses.length > 0 ? totalBonuses / bonuses.length : 0
    };
  }

  private async assessSystemHealth(fund: any, statistics: any): Promise<any> {
    const balanceRatio = fund.currentBalance / Math.max(fund.totalContributions, 1);
    const profitability = statistics.profitability;
    
    let healthStatus = 'healthy';
    let issues = [];
    
    if (balanceRatio < 0.1) {
      healthStatus = 'critical';
      issues.push('Saldo del fondo crítico');
    } else if (balanceRatio < 0.2) {
      healthStatus = 'warning';
      issues.push('Saldo del fondo bajo');
    }
    
    if (profitability < 0) {
      healthStatus = 'critical';
      issues.push('Rentabilidad negativa');
    } else if (profitability < 10) {
      healthStatus = 'warning';
      issues.push('Rentabilidad baja');
    }
    
    return {
      status: healthStatus,
      issues,
      balanceRatio,
      profitability,
      recommendations: this.generateHealthRecommendations(healthStatus, issues)
    };
  }

  private generateHealthRecommendations(status: string, issues: string[]): string[] {
    const recommendations = [];
    
    if (status === 'critical') {
      recommendations.push('Activar modo de emergencia inmediatamente');
      recommendations.push('Revisar estructura de tasas y comisiones');
      recommendations.push('Considerar inyección de capital de emergencia');
    } else if (status === 'warning') {
      recommendations.push('Monitorear métricas de cerca');
      recommendations.push('Considerar ajustes menores en tasas');
      recommendations.push('Revisar eficiencia operativa');
    } else {
      recommendations.push('Sistema funcionando óptimamente');
      recommendations.push('Mantener monitoreo regular');
    }
    
    return recommendations;
  }

  private async generateProfitabilityReport(startDate: Date, endDate: Date, groupBy: string): Promise<any> {
    // Implementar generación de reporte de rentabilidad
    return {
      period: { start: startDate, end: endDate, groupBy },
      summary: {
        totalRevenue: 0,
        totalCosts: 0,
        netProfit: 0,
        profitability: 0
      },
      dailyData: [],
      trends: {
        revenue: 'stable',
        costs: 'stable',
        profitability: 'stable'
      }
    };
  }

  private async calculateDeliveryStatistics(startDate: Date, endDate: Date, level?: string): Promise<any> {
    // Implementar cálculo de estadísticas de deliverys
    return {
      period: { start: startDate, end: endDate },
      totalDeliverys: 0,
      activeDeliverys: 0,
      levelDistribution: {
        bronze: 0,
        silver: 0,
        gold: 0,
        elite: 0
      },
      averageRating: 0,
      totalDeliveries: 0,
      totalBonuses: 0
    };
  }

  private async exportTransactions(startDate: Date, endDate: Date): Promise<any[]> {
    return await FundTransaction.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
  }

  private async exportBonuses(startDate: Date, endDate: Date): Promise<any[]> {
    return await DeliveryBonus.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
  }

  private async exportLogs(startDate: Date, endDate: Date): Promise<any[]> {
    return await LogisticLog.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });
  }

  private async recordSettingsChange(settingsId: string, adminId: string, changes: any): Promise<void> {
    try {
      await LogisticSettings.findByIdAndUpdate(settingsId, {
        $push: {
          changeHistory: {
            date: new Date(),
            field: 'settings_update',
            oldValue: null,
            newValue: changes,
            updatedBy: adminId,
            reason: 'Actualización de configuración del sistema'
          }
        }
      });
    } catch (error) {
      console.error('Error registrando cambio de configuración:', error);
    }
  }
}

export default AdminLogisticController;
