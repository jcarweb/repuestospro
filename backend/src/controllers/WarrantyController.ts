import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { WarrantyService, WarrantyCreationData } from '../services/WarrantyService';
import Warranty from '../models/Warranty';
import SecureTransaction from '../models/SecureTransaction';

export class WarrantyController {

  /**
   * Obtener todas las garantías del usuario
   */
  public getUserWarranties = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { status, type, page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      const warranties = await WarrantyService.getUserWarranties(
        userId, 
        status as string
      );

      // Filtrar por tipo si se especifica
      let filteredWarranties = warranties;
      if (type) {
        filteredWarranties = warranties.filter(w => w.type === type);
      }

      // Paginación
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedWarranties = filteredWarranties.slice(startIndex, endIndex);

      // Estadísticas
      const stats = await WarrantyService.getWarrantyStats(userId);

      res.json({
        success: true,
        data: {
          warranties: paginatedWarranties,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(filteredWarranties.length / Number(limit)),
            totalItems: filteredWarranties.length,
            itemsPerPage: Number(limit)
          },
          stats
        }
      });

    } catch (error) {
      console.error('Error al obtener garantías del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener garantías de una tienda (para store managers)
   */
  public getStoreWarranties = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const storeId = req.params.storeId || (req.user as any)?.storeId;
      const { status, type, page = 1, limit = 10 } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'ID de tienda requerido'
        });
      }

      const warranties = await WarrantyService.getStoreWarranties(
        storeId,
        status as string
      );

      // Filtrar por tipo si se especifica
      let filteredWarranties = warranties;
      if (type) {
        filteredWarranties = warranties.filter(w => w.type === type);
      }

      // Paginación
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedWarranties = filteredWarranties.slice(startIndex, endIndex);

      // Estadísticas
      const stats = await WarrantyService.getWarrantyStats(undefined, storeId);

      res.json({
        success: true,
        data: {
          warranties: paginatedWarranties,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(filteredWarranties.length / Number(limit)),
            totalItems: filteredWarranties.length,
            itemsPerPage: Number(limit)
          },
          stats
        }
      });

    } catch (error) {
      console.error('Error al obtener garantías de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener detalles de una garantía específica
   */
  public getWarrantyDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { warrantyId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const warranty = await Warranty.findById(warrantyId)
        .populate('storeId', 'name logo address')
        .populate('productId', 'name images price')
        .populate('userId', 'name email');

      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      // Verificar que el usuario tenga acceso a esta garantía
      if (warranty.userId?.toString() || '' !== userId && 
          warranty.storeId.toString() !== (req.user as any)?.storeId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta garantía'
        });
      }

      // Obtener transacción segura asociada si existe
      let secureTransaction = null;
      if (warranty.transactionId) {
        secureTransaction = await SecureTransaction.findOne({
          transactionId: warranty.transactionId
        });
      }

      res.json({
        success: true,
        data: {
          warranty,
          secureTransaction,
          isActive: (warranty as any).isActive(),
          daysRemaining: (warranty as any).getDaysRemaining(),
          availableCoverage: (warranty as any).getAvailableCoverage()
        }
      });

    } catch (error) {
      console.error('Error al obtener detalles de garantía:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Crear una nueva garantía
   */
  public createWarranty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const {
        type,
        storeId,
        transactionId,
        productId,
        transactionAmount,
        protectionLevel = 'basic',
        isIncluded = false,
        description
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const warrantyData: WarrantyCreationData = {
        type,
        userId,
        storeId,
        transactionId,
        productId,
        transactionAmount,
        protectionLevel,
        isIncluded,
        description,
        createdBy: userId
      };

      // Validar antes de crear
      const validation = await WarrantyService.validateWarrantyCreation(warrantyData);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Datos de garantía inválidos',
          errors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Crear la garantía
      const warranty = await WarrantyService.createWarranty(warrantyData);

      res.status(201).json({
        success: true,
        message: 'Garantía creada exitosamente',
        data: {
          warranty,
          validation: {
            coverageAmount: validation.coverageAmount,
            cost: validation.cost,
            terms: validation.terms
          }
        }
      });

    } catch (error) {
      console.error('Error al crear garantía:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  /**
   * Activar una garantía pendiente
   */
  public activateWarranty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { warrantyId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que la garantía pertenece al usuario
      const warranty = await Warranty.findById(warrantyId);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      if (warranty.userId?.toString() || '' !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para activar esta garantía'
        });
      }

      const activatedWarranty = await WarrantyService.activateWarranty(warrantyId);

      res.json({
        success: true,
        message: 'Garantía activada exitosamente',
        data: activatedWarranty
      });

    } catch (error) {
      console.error('Error al activar garantía:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  /**
   * Extender una garantía activa
   */
  public extendWarranty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { warrantyId } = req.params;
      const { extensionDays } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!extensionDays || extensionDays <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Días de extensión deben ser mayores a 0'
        });
      }

      // Verificar que la garantía pertenece al usuario
      const warranty = await Warranty.findById(warrantyId);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      if (warranty.userId?.toString() || '' !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para extender esta garantía'
        });
      }

      const extendedWarranty = await WarrantyService.extendWarranty(warrantyId, extensionDays);

      res.json({
        success: true,
        message: `Garantía extendida por ${extensionDays} días`,
        data: extendedWarranty
      });

    } catch (error) {
      console.error('Error al extender garantía:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  /**
   * Validar elegibilidad para reclamo
   */
  public checkClaimEligibility = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { warrantyId } = req.params;
      const { claimType } = req.query;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!claimType) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de reclamo requerido'
        });
      }

      // Verificar que la garantía pertenece al usuario
      const warranty = await Warranty.findById(warrantyId);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      if (warranty.userId?.toString() || '' !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para verificar esta garantía'
        });
      }

      const isEligible = await WarrantyService.checkClaimEligibility(
        warrantyId, 
        claimType as string
      );

      res.json({
        success: true,
        data: {
          isEligible,
          warranty: {
            id: warranty._id,
            type: warranty.type,
            status: warranty.status,
            coverageAmount: warranty.coverageAmount,
            terms: warranty.terms,
            expirationDate: warranty.expirationDate,
            daysRemaining: (warranty as any).getDaysRemaining()
          }
        }
      });

    } catch (error) {
      console.error('Error al verificar elegibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener estadísticas de garantías
   */
  public getWarrantyStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const storeId = (req.user as any)?.storeId;

      const stats = await WarrantyService.getWarrantyStats(userId, storeId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Cancelar una garantía
   */
  public cancelWarranty = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { warrantyId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que la garantía pertenece al usuario
      const warranty = await Warranty.findById(warrantyId);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      if (warranty.userId?.toString() || '' !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta garantía'
        });
      }

      if (warranty.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'La garantía ya está cancelada'
        });
      }

      warranty.status = 'cancelled';
      await warranty.save();

      res.json({
        success: true,
        message: 'Garantía cancelada exitosamente',
        data: warranty
      });

    } catch (error) {
      console.error('Error al cancelar garantía:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
