import { Request, Response } from 'express';
import { SalesReportService, SalesReportFilters } from '../services/SalesReportService';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class SalesReportController {
  /**
   * Helper method to handle store manager filters
   */
  private handleStoreManagerFilters(filters: SalesReportFilters, user: any): SalesReportFilters {
    if (user?.role === 'store_manager') {
      // Si el gestor tiene tiendas específicas, usar la primera o todas
      if (user?.stores && user.stores.length > 0) {
        // Si se especifica una tienda específica en los filtros, usarla
        if (!filters.storeId) {
          // Usar la primera tienda por defecto, o todas las tiendas
          filters.storeId = user.stores[0];
        }
      }
    }
    return filters;
  }

  /**
   * Generar reporte completo de ventas
   */
  public generateSalesReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      this.handleStoreManagerFilters(filters, req.user);

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating sales report:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar el reporte de ventas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Obtener métricas rápidas para el dashboard
   */
  public getQuickMetrics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters: SalesReportFilters = {};
      
      this.handleStoreManagerFilters(filters, req.user);

      // Obtener métricas de los últimos 30 días
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      filters.dateFrom = dateFrom;
      filters.dateTo = new Date();

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: {
          overview: report.overview,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error getting quick metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas rápidas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Obtener tendencias de ventas
   */
  public getSalesTrends = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      
      this.handleStoreManagerFilters(filters, req.user);

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: {
          trends: report.trends,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error getting sales trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tendencias de ventas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Obtener productos más vendidos
   */
  public getTopProducts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      
      this.handleStoreManagerFilters(filters, req.user);

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: {
          topProducts: report.topProducts,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error getting top products:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos más vendidos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Obtener análisis de clientes
   */
  public getCustomerAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      
      this.handleStoreManagerFilters(filters, req.user);

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: {
          customerAnalytics: report.customerAnalytics,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener análisis de clientes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Obtener análisis de métodos de pago
   */
  public getPaymentAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      
      this.handleStoreManagerFilters(filters, req.user);

      const report = await SalesReportService.generateSalesReport(filters);
      
      res.json({
        success: true,
        data: {
          paymentAnalytics: report.paymentAnalytics,
          period: report.period
        }
      });
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener análisis de métodos de pago',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Exportar reporte
   */
  public exportReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters = this.parseFilters(req.query);
      const format = (req.query['format'] as 'csv' | 'json') || 'csv';
      
      this.handleStoreManagerFilters(filters, req.user);

      const exportData = await SalesReportService.exportSalesReport(filters, format);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.json');
      }
      
      res.send(exportData);
    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: 'Error al exportar el reporte',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Generar datos de prueba
   */
  public generateTestData = async (req: Request, res: Response) => {
    try {
      await SalesReportService.generateTestData();
      
      res.json({
        success: true,
        message: 'Datos de prueba generados correctamente'
      });
    } catch (error) {
      console.error('Error generating test data:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar datos de prueba',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Generar datos de prueba para gestores de tienda
   */
  public generateStoreManagerTestData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userEmail } = req.body;
      
      if (!userEmail) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el email del gestor de tienda'
        });
      }

      await SalesReportService.generateStoreManagerTestData(userEmail);
      
      res.json({
        success: true,
        message: `Datos de prueba generados exitosamente para el gestor de tienda ${userEmail}`
      });
    } catch (error) {
      console.error('Error generating store manager test data:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar datos de prueba para el gestor de tienda',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Generar token temporal para pruebas (SOLO PARA DESARROLLO)
   */
  public generateTestToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config/env').config;
      
      // Buscar el usuario gestor de tienda
      const User = require('../models/User').User;
      const user = await User.findOne({ email: 'jucarl74@gmail.com' });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario jucarl74@gmail.com no encontrado'
        });
      }

      // Generar token con el secreto correcto
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          stores: user.stores
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Token generado correctamente',
        token: token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          stores: user.stores
        }
      });
    } catch (error) {
      console.error('Error generating test token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar token de prueba',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * Parsear filtros de la query
   */
  private parseFilters(query: any): SalesReportFilters {
    const filters: SalesReportFilters = {};

    if (query.dateFrom) {
      filters.dateFrom = new Date(query.dateFrom as string);
    }

    if (query.dateTo) {
      filters.dateTo = new Date(query.dateTo as string);
    }

    if (query.storeId) {
      filters.storeId = query.storeId as any;
    }

    if (query.userId) {
      filters.userId = query.userId as any;
    }

    if (query.categoryId) {
      filters.categoryId = query.categoryId as any;
    }

    if (query.productId) {
      filters.productId = query.productId as any;
    }

    if (query.paymentMethod) {
      filters.paymentMethod = query.paymentMethod as string;
    }

    if (query.orderStatus) {
      filters.orderStatus = Array.isArray(query.orderStatus) 
        ? query.orderStatus 
        : [query.orderStatus as string];
    }

    if (query.customerId) {
      filters.customerId = query.customerId as any;
    }

    if (query.search) {
      filters.search = query.search as string;
    }

    return filters;
  }
}
