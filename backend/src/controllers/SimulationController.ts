import { Request, Response } from 'express';
import FinancialSimulator from '../utils/FinancialSimulator';

export class SimulationController {
  /**
   * Ejecuta una simulación financiera personalizada
   */
  async runCustomSimulation(req: Request, res: Response): Promise<void> {
    try {
      const {
        dailyOrders = 1000,
        averageOrderValue = 50,
        marketplaceCommissionRate = 12,
        logisticFeeBase = 0.75,
        activeDeliverys = 50,
        deliveriesPerDriver = 20,
        simulationDays = 30
      } = req.body;

      const parameters = {
        dailyOrders,
        averageOrderValue,
        marketplaceCommissionRate,
        logisticFeeBase,
        activeDeliverys,
        deliveriesPerDriver,
        simulationDays
      };

      const simulator = new FinancialSimulator(parameters);
      const results = await simulator.runSimulation();

      res.status(200).json({
        success: true,
        data: results,
        message: 'Simulación ejecutada correctamente'
      });
    } catch (error) {
      console.error('Error ejecutando simulación:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando simulación financiera',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Ejecuta escenarios predefinidos
   */
  async runScenarioSimulation(req: Request, res: Response): Promise<void> {
    try {
      const { scenario } = req.params;
      
      let parameters;
      
      switch (scenario) {
        case 'conservative':
          parameters = {
            dailyOrders: 800,
            averageOrderValue: 45,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 40,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        case 'optimistic':
          parameters = {
            dailyOrders: 1500,
            averageOrderValue: 55,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 75,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        case 'realistic':
          parameters = {
            dailyOrders: 1000,
            averageOrderValue: 50,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 50,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        default:
          res.status(400).json({
            success: false,
            message: 'Escenario no válido. Opciones: conservative, optimistic, realistic'
          });
          return;
      }

      const simulator = new FinancialSimulator(parameters);
      const results = await simulator.runSimulation();

      res.status(200).json({
        success: true,
        data: {
          scenario,
          parameters,
          ...results
        },
        message: `Simulación del escenario ${scenario} ejecutada correctamente`
      });
    } catch (error) {
      console.error('Error ejecutando simulación de escenario:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando simulación de escenario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Compara múltiples escenarios
   */
  async compareScenarios(req: Request, res: Response): Promise<void> {
    try {
      const scenarios = [
        {
          name: 'conservative',
          parameters: {
            dailyOrders: 800,
            averageOrderValue: 45,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 40,
            deliveriesPerDriver: 20,
            simulationDays: 30
          }
        },
        {
          name: 'realistic',
          parameters: {
            dailyOrders: 1000,
            averageOrderValue: 50,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 50,
            deliveriesPerDriver: 20,
            simulationDays: 30
          }
        },
        {
          name: 'optimistic',
          parameters: {
            dailyOrders: 1500,
            averageOrderValue: 55,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 75,
            deliveriesPerDriver: 20,
            simulationDays: 30
          }
        }
      ];

      const results = await Promise.all(
        scenarios.map(async (scenario) => {
          const simulator = new FinancialSimulator(scenario.parameters);
          const simulationResults = await simulator.runSimulation();
          return {
            scenario: scenario.name,
            parameters: scenario.parameters,
            ...simulationResults
          };
        })
      );

      // Generar comparación
      const comparison = this.generateComparison(results);

      res.status(200).json({
        success: true,
        data: {
          scenarios: results,
          comparison
        },
        message: 'Comparación de escenarios completada'
      });
    } catch (error) {
      console.error('Error comparando escenarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error comparando escenarios',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene el reporte detallado de una simulación
   */
  async getSimulationReport(req: Request, res: Response): Promise<void> {
    try {
      const { scenario = 'realistic' } = req.query;
      
      let parameters;
      
      switch (scenario) {
        case 'conservative':
          parameters = {
            dailyOrders: 800,
            averageOrderValue: 45,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 40,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        case 'optimistic':
          parameters = {
            dailyOrders: 1500,
            averageOrderValue: 55,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 75,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        default:
          parameters = {
            dailyOrders: 1000,
            averageOrderValue: 50,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 50,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
      }

      const simulator = new FinancialSimulator(parameters);
      const results = await simulator.runSimulation();
      const report = simulator.generateReport();

      res.status(200).json({
        success: true,
        data: {
          report,
          results,
          parameters
        },
        message: 'Reporte de simulación generado correctamente'
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando reporte de simulación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Exporta los resultados de una simulación
   */
  async exportSimulationResults(req: Request, res: Response): Promise<void> {
    try {
      const { scenario = 'realistic', format = 'json' } = req.query;
      
      let parameters;
      
      switch (scenario) {
        case 'conservative':
          parameters = {
            dailyOrders: 800,
            averageOrderValue: 45,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 40,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        case 'optimistic':
          parameters = {
            dailyOrders: 1500,
            averageOrderValue: 55,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 75,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
          break;
          
        default:
          parameters = {
            dailyOrders: 1000,
            averageOrderValue: 50,
            marketplaceCommissionRate: 12,
            logisticFeeBase: 0.75,
            activeDeliverys: 50,
            deliveriesPerDriver: 20,
            simulationDays: 30
          };
      }

      const simulator = new FinancialSimulator(parameters);
      const results = await simulator.runSimulation();
      const exportData = simulator.exportResults();

      if (format === 'csv') {
        const csvData = this.convertToCSV(exportData.results);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=simulation_results.csv');
        res.status(200).send(csvData);
      } else {
        res.status(200).json({
          success: true,
          data: exportData,
          message: 'Resultados de simulación exportados correctamente'
        });
      }
    } catch (error) {
      console.error('Error exportando resultados:', error);
      res.status(500).json({
        success: false,
        message: 'Error exportando resultados de simulación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Métodos privados auxiliares
  private generateComparison(results: any[]): any {
    const comparison = {
      bestScenario: '',
      worstScenario: '',
      averageROI: 0,
      averageBalance: 0,
      recommendations: [] as string[]
    };

    // Encontrar mejor y peor escenario
    const roiValues = results.map(r => r.metrics.averageROI);
    const bestIndex = roiValues.indexOf(Math.max(...roiValues));
    const worstIndex = roiValues.indexOf(Math.min(...roiValues));

    comparison.bestScenario = results[bestIndex].scenario;
    comparison.worstScenario = results[worstIndex].scenario;
    comparison.averageROI = roiValues.reduce((sum, roi) => sum + roi, 0) / roiValues.length;
    comparison.averageBalance = results.reduce((sum, r) => sum + r.metrics.netBalance, 0) / results.length;

    // Generar recomendaciones
    if (comparison.averageROI < 0) {
      comparison.recommendations.push('Todos los escenarios muestran déficit. Revisar estructura de costos.');
    } else if (comparison.averageROI > 20) {
      comparison.recommendations.push('Todos los escenarios son rentables. Considerar expansión.');
    }

    return comparison;
  }

  private convertToCSV(results: any[]): string {
    const headers = ['Day', 'Orders', 'FundContributions', 'DeliveryPayments', 'FundBalance', 'Profitability'];
    const csvRows = [headers.join(',')];
    
    results.forEach(result => {
      const row = [
        result.day,
        result.orders,
        result.fundContributions,
        result.deliveryPayments,
        result.fundBalance,
        result.profitability
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}

export default SimulationController;
