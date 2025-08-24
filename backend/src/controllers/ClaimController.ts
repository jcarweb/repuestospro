import { Request, Response } from 'express';
import Claim, { IClaim } from '../models/Claim';
import Warranty from '../models/Warranty';
import { WarrantyService } from '../services/WarrantyService';

export interface ClaimCreationData {
  warrantyId: string;
  claimType: 'defective_product' | 'non_delivery' | 'not_as_described' | 'late_delivery' | 'damaged_package';
  title: string;
  description: string;
  claimedAmount: number;
  problemDetails: {
    issueType: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    impact: string;
    expectedResolution: string;
  };
  evidence?: Array<{
    type: 'photo' | 'document' | 'video' | 'audio' | 'other';
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    description?: string;
  }>;
}

export class ClaimController {

  /**
   * Crear un nuevo reclamo
   */
  public createClaim = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const {
        warrantyId,
        claimType,
        title,
        description,
        claimedAmount,
        problemDetails,
        evidence = []
      }: ClaimCreationData = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Validar datos requeridos
      if (!warrantyId || !claimType || !title || !description || !claimedAmount || !problemDetails) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Verificar que la garantía existe y pertenece al usuario
      const warranty = await Warranty.findById(warrantyId);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          message: 'Garantía no encontrada'
        });
      }

      if (warranty.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear reclamos en esta garantía'
        });
      }

      // Verificar que la garantía está activa
      if (!warranty.isActive()) {
        return res.status(400).json({
          success: false,
          message: 'La garantía no está activa'
        });
      }

      // Verificar elegibilidad para el tipo de reclamo
      const isEligible = await WarrantyService.checkClaimEligibility(warrantyId, claimType);
      if (!isEligible) {
        return res.status(400).json({
          success: false,
          message: 'Este tipo de reclamo no está cubierto por la garantía'
        });
      }

      // Verificar que el monto reclamado no exceda la cobertura
      if (claimedAmount > warranty.getAvailableCoverage()) {
        return res.status(400).json({
          success: false,
          message: 'El monto reclamado excede la cobertura disponible'
        });
      }

      // Crear el reclamo
      const claim = new Claim({
        warrantyId,
        userId,
        storeId: warranty.storeId,
        transactionId: warranty.transactionId,
        claimType,
        title,
        description,
        claimedAmount,
        problemDetails,
        evidence,
        currency: 'USD',
        filedDate: new Date(),
        lastUpdated: new Date(),
        createdBy: userId
      });

      const savedClaim = await claim.save();

      // Agregar comunicación inicial
      await savedClaim.addCommunication(
        'user',
        `Reclamo creado: ${title}`,
        [],
        false
      );

      res.status(201).json({
        success: true,
        message: 'Reclamo creado exitosamente',
        data: {
          claim: savedClaim,
          warranty: {
            id: warranty._id,
            type: warranty.type,
            coverageAmount: warranty.coverageAmount,
            availableCoverage: warranty.getAvailableCoverage()
          }
        }
      });

    } catch (error) {
      console.error('Error al crear reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener reclamos del usuario
   */
  public getUserClaims = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { status, claimType, page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const filter: any = { userId };
      if (status) filter.status = status;
      if (claimType) filter.claimType = claimType;

      const claims = await Claim.find(filter)
        .populate('warrantyId', 'type coverageAmount terms')
        .populate('storeId', 'name logo')
        .populate('transactionId', 'transactionAmount')
        .sort({ filedDate: -1 });

      // Paginación
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedClaims = claims.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          claims: paginatedClaims,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(claims.length / Number(limit)),
            totalItems: claims.length,
            itemsPerPage: Number(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener reclamos del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener reclamos de una tienda
   */
  public getStoreClaims = async (req: Request, res: Response) => {
    try {
      const storeId = req.params.storeId || req.user?.storeId;
      const { status, claimType, page = 1, limit = 10 } = req.query;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'ID de tienda requerido'
        });
      }

      const filter: any = { storeId };
      if (status) filter.status = status;
      if (claimType) filter.claimType = claimType;

      const claims = await Claim.find(filter)
        .populate('warrantyId', 'type coverageAmount terms')
        .populate('userId', 'name email')
        .populate('transactionId', 'transactionAmount')
        .sort({ filedDate: -1 });

      // Paginación
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedClaims = claims.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          claims: paginatedClaims,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(claims.length / Number(limit)),
            totalItems: claims.length,
            itemsPerPage: Number(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener reclamos de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener detalles de un reclamo específico
   */
  public getClaimDetails = async (req: Request, res: Response) => {
    try {
      const { claimId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const claim = await Claim.findById(claimId)
        .populate('warrantyId', 'type coverageAmount terms expirationDate')
        .populate('storeId', 'name logo address')
        .populate('userId', 'name email')
        .populate('transactionId', 'transactionAmount')
        .populate('assignedAgent', 'name email');

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado'
        });
      }

      // Verificar permisos
      if (claim.userId.toString() !== userId && 
          claim.storeId.toString() !== req.user?.storeId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este reclamo'
        });
      }

      res.json({
        success: true,
        data: {
          claim,
          timeElapsed: claim.getTimeElapsed(),
          isWithinDeadline: claim.isWithinDeadline()
        }
      });

    } catch (error) {
      console.error('Error al obtener detalles del reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar un reclamo
   */
  public updateClaim = async (req: Request, res: Response) => {
    try {
      const { claimId } = req.params;
      const userId = req.user?.id;
      const { title, description, claimedAmount, problemDetails } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado'
        });
      }

      // Verificar permisos
      if (claim.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este reclamo'
        });
      }

      // Solo permitir actualización si está pendiente
      if (claim.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden actualizar reclamos pendientes'
        });
      }

      // Actualizar campos
      if (title) claim.title = title;
      if (description) claim.description = description;
      if (claimedAmount) claim.claimedAmount = claimedAmount;
      if (problemDetails) claim.problemDetails = problemDetails;

      claim.lastUpdated = new Date();
      await claim.save();

      // Agregar comunicación
      await claim.addCommunication(
        'user',
        'Reclamo actualizado por el usuario',
        [],
        false
      );

      res.json({
        success: true,
        message: 'Reclamo actualizado exitosamente',
        data: claim
      });

    } catch (error) {
      console.error('Error al actualizar reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Agregar evidencia a un reclamo
   */
  public addEvidence = async (req: Request, res: Response) => {
    try {
      const { claimId } = req.params;
      const userId = req.user?.id;
      const { evidence } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!evidence || !Array.isArray(evidence)) {
        return res.status(400).json({
          success: false,
          message: 'Evidencia requerida'
        });
      }

      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado'
        });
      }

      // Verificar permisos
      if (claim.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para agregar evidencia a este reclamo'
        });
      }

      // Agregar evidencia
      for (const evidenceItem of evidence) {
        await claim.addEvidence(evidenceItem);
      }

      // Agregar comunicación
      await claim.addCommunication(
        'user',
        `Evidencia agregada: ${evidence.length} archivo(s)`,
        evidence.map(e => e.filename),
        false
      );

      res.json({
        success: true,
        message: 'Evidencia agregada exitosamente',
        data: {
          claim,
          evidenceCount: claim.evidence.length
        }
      });

    } catch (error) {
      console.error('Error al agregar evidencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Agregar comunicación a un reclamo
   */
  public addCommunication = async (req: Request, res: Response) => {
    try {
      const { claimId } = req.params;
      const userId = req.user?.id;
      const { message, attachments = [] } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Mensaje requerido'
        });
      }

      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado'
        });
      }

      // Verificar permisos
      if (claim.userId.toString() !== userId && 
          claim.storeId.toString() !== req.user?.storeId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para agregar comunicación a este reclamo'
        });
      }

      // Determinar el remitente
      const from = claim.userId.toString() === userId ? 'user' : 'store';

      // Agregar comunicación
      await claim.addCommunication(from, message, attachments, false);

      res.json({
        success: true,
        message: 'Comunicación agregada exitosamente',
        data: {
          claim,
          communicationCount: claim.communications.length
        }
      });

    } catch (error) {
      console.error('Error al agregar comunicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Cancelar un reclamo
   */
  public cancelClaim = async (req: Request, res: Response) => {
    try {
      const { claimId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const claim = await Claim.findById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado'
        });
      }

      // Verificar permisos
      if (claim.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar este reclamo'
        });
      }

      // Solo permitir cancelación si está pendiente
      if (claim.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden cancelar reclamos pendientes'
        });
      }

      claim.status = 'cancelled';
      claim.lastUpdated = new Date();
      await claim.save();

      // Agregar comunicación
      await claim.addCommunication(
        'user',
        'Reclamo cancelado por el usuario',
        [],
        false
      );

      res.json({
        success: true,
        message: 'Reclamo cancelado exitosamente',
        data: claim
      });

    } catch (error) {
      console.error('Error al cancelar reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener estadísticas de reclamos
   */
  public getClaimStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const storeId = req.user?.storeId;

      const filter: any = {};
      if (userId) filter.userId = userId;
      if (storeId) filter.storeId = storeId;

      const stats = await Claim.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$claimedAmount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de reclamos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
