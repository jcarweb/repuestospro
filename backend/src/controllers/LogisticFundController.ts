import { Request, Response } from 'express';
import LogisticFundService from '../services/LogisticFundService';
import GovernanceService from '../services/GovernanceService';
import BonusCalculationService from '../services/BonusCalculationService';

export class LogisticFundController {
  private fundService: LogisticFundService;
  private governanceService: GovernanceService;
  private bonusService: BonusCalculationService;

  constructor() {
    this.fundService = LogisticFundService.getInstance();
    this.governanceService = GovernanceService.getInstance();
    this.bonusService = BonusCalculationService.getInstance();
  }

  /**
   * Obtiene el estado actual del fondo logístico
   */
  async getFundStatus(req: Request, res: Response): Promise<void> {
    try {
      const fundStatus = await this.fundService.getFundStatus();
      
      res.status(200).json({
        success: true,
        data: fundStatus,
        message: 'Estado del fondo obtenido correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo estado del fondo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Procesa un aporte al fondo desde un pedido
   */
  async processOrderContribution(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, orderValue, customerId, storeId, zone, peakHours, priority } = req.body;
      
      // Validar datos requeridos
      if (!orderId || !orderValue || !customerId || !storeId) {
        res.status(400).json({
          success: false,
          message: 'Datos requeridos: orderId, orderValue, customerId, storeId'
        });
        return;
      }

      const contribution = await this.fundService.processOrderContribution({
        orderId,
        orderValue,
        customerId,
        storeId,
        zone: zone || 'default',
        peakHours: peakHours || false,
        priority: priority || 'normal'
      });

      res.status(200).json({
        success: true,
        data: contribution,
        message: 'Aporte al fondo procesado correctamente'
      });
    } catch (error) {
      console.error('Error procesando aporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando aporte al fondo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Procesa un pago a un delivery
   */
  async processDeliveryPayment(req: Request, res: Response): Promise<void> {
    try {
      const { deliveryId, orderId, basePayment, bonusAmount, deliveryLevel, performance } = req.body;
      
      // Validar datos requeridos
      if (!deliveryId || !orderId || basePayment === undefined) {
        res.status(400).json({
          success: false,
          message: 'Datos requeridos: deliveryId, orderId, basePayment'
        });
        return;
      }

      const totalPayment = await this.fundService.processDeliveryPayment({
        deliveryId,
        orderId,
        basePayment,
        bonusAmount: bonusAmount || 0,
        deliveryLevel: deliveryLevel || 'bronze',
        performance: performance || {
          rating: 4.5,
          deliveryTime: 30,
          distance: 5,
          onTime: true
        }
      });

      res.status(200).json({
        success: true,
        data: { totalPayment },
        message: 'Pago al delivery procesado correctamente'
      });
    } catch (error) {
      console.error('Error procesando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando pago al delivery',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Ejecuta la gobernanza automática
   */
  async executeGovernance(req: Request, res: Response): Promise<void> {
    try {
      const decision = await this.governanceService.executeGovernanceAnalysis();
      
      // Implementar la decisión si es necesario
      if (decision.action !== 'maintain') {
        await this.governanceService.implementGovernanceDecision(decision);
      }

      res.status(200).json({
        success: true,
        data: decision,
        message: 'Gobernanza ejecutada correctamente'
      });
    } catch (error) {
      console.error('Error ejecutando gobernanza:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando gobernanza automática',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene el reporte de gobernanza
   */
  async getGovernanceReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.governanceService.getGovernanceReport();
      
      res.status(200).json({
        success: true,
        data: report,
        message: 'Reporte de gobernanza obtenido correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo reporte de gobernanza:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo reporte de gobernanza',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Procesa bonos semanales
   */
  async processWeeklyBonuses(req: Request, res: Response): Promise<void> {
    try {
      await this.bonusService.processWeeklyBonuses();
      
      res.status(200).json({
        success: true,
        message: 'Bonos semanales procesados correctamente'
      });
    } catch (error) {
      console.error('Error procesando bonos semanales:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando bonos semanales',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Calcula bonos especiales
   */
  async calculateSpecialBonuses(req: Request, res: Response): Promise<void> {
    try {
      await this.bonusService.calculateSpecialBonuses();
      
      res.status(200).json({
        success: true,
        message: 'Bonos especiales calculados correctamente'
      });
    } catch (error) {
      console.error('Error calculando bonos especiales:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculando bonos especiales',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene estadísticas de bonos
   */
  async getBonusStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.bonusService.getBonusStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics,
        message: 'Estadísticas de bonos obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de bonos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de bonos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene el historial de transacciones del fondo
   */
  async getFundTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, type, status } = req.query;
      
      const query: any = {};
      if (type) query.type = type;
      if (status) query.status = status;
      
      const transactions = await this.fundService.getFundTransactions(
        query,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json({
        success: true,
        data: transactions,
        message: 'Transacciones del fondo obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo transacciones del fondo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene métricas de rendimiento del fondo
   */
  async getFundMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'week' } = req.query;
      
      const metrics = await this.fundService.getFundMetrics(period as string);
      
      res.status(200).json({
        success: true,
        data: metrics,
        message: 'Métricas del fondo obtenidas correctamente'
      });
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métricas del fondo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Inicializa el sistema logístico
   */
  async initializeSystem(req: Request, res: Response): Promise<void> {
    try {
      await this.fundService.initialize();
      await this.governanceService.initialize();
      await this.bonusService.initialize();
      
      res.status(200).json({
        success: true,
        message: 'Sistema logístico inicializado correctamente'
      });
    } catch (error) {
      console.error('Error inicializando sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error inicializando sistema logístico',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default LogisticFundController;
