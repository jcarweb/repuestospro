import { Request, Response } from 'express';
import AdvertisementRequest from '../models/AdvertisementRequest';
import Advertisement from '../models/Advertisement';
import User from '../models/User';
import Store from '../models/Store';
import emailService from '../services/emailService';

export class AdvertisementRequestController {
  // Crear nueva solicitud de publicidad
  static async createRequest(req: Request, res: Response) {
    try {
      const {
        campaignName,
        campaignObjective,
        budget,
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        navigationUrl,
        targetAudience,
        schedule,
        displayType,
        targetPlatform,
        reportingPreferences
      } = req.body;

      // Verificar que el usuario es gestor de tienda
      if (req.user?.role !== 'store_manager') {
        return res.status(403).json({
          success: false,
          message: 'Solo los gestores de tienda pueden crear solicitudes de publicidad'
        });
      }

      // Buscar la tienda del gestor
      const store = await Store.findOne({ managers: req.user._id });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró una tienda asociada a tu cuenta'
        });
      }

      // Crear la solicitud
      const request = new AdvertisementRequest({
        storeManager: req.user._id,
        store: store._id,
        campaignName,
        campaignObjective,
        budget,
        title,
        description,
        content,
        imageUrl,
        videoUrl,
        navigationUrl,
        targetAudience,
        schedule,
        displayType,
        targetPlatform,
        reportingPreferences
      });

      // Calcular estimaciones
      const estimates = request.calculateEstimates();
      request.estimatedReach = estimates.estimatedReach;
      request.estimatedClicks = estimates.estimatedClicks;
      request.estimatedCost = estimates.estimatedCost;

      await request.save();

      // Enviar email de confirmación al gestor
      try {
        await emailService.sendAdvertisementRequestConfirmation(
          req.user.email,
          request.campaignName,
          estimates
        );
      } catch (emailError) {
        console.error('Error enviando email de confirmación:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Solicitud de publicidad creada exitosamente',
        data: {
          request: {
            id: request._id,
            campaignName: request.campaignName,
            status: request.status,
            estimatedReach: request.estimatedReach,
            estimatedClicks: request.estimatedClicks,
            estimatedCost: request.estimatedCost
          }
        }
      });
    } catch (error) {
      console.error('Error creando solicitud de publicidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener solicitudes del gestor de tienda
  static async getStoreManagerRequests(req: Request, res: Response) {
    try {
      const requests = await AdvertisementRequest.find({ storeManager: req.user?._id })
        .populate('store', 'name city')
        .populate('approvedBy', 'name')
        .populate('createdAdvertisement', 'title status')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { requests }
      });
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener una solicitud específica
  static async getRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await AdvertisementRequest.findById(id)
        .populate('storeManager', 'name email')
        .populate('store', 'name address city')
        .populate('approvedBy', 'name')
        .populate('createdAdvertisement');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      // Verificar permisos
      if (req.user?.role !== 'admin' && request.storeManager.toString() !== req.user?._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta solicitud'
        });
      }

      res.json({
        success: true,
        data: { request }
      });
    } catch (error) {
      console.error('Error obteniendo solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar solicitud (solo borrador)
  static async updateRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const request = await AdvertisementRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      // Solo se puede actualizar si es borrador y es el propietario
      if (request.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden actualizar solicitudes en estado borrador'
        });
      }

      if (request.storeManager.toString() !== req.user?._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar esta solicitud'
        });
      }

      // Recalcular estimaciones si cambió el presupuesto
      if (updateData.budget) {
        const estimates = request.calculateEstimates();
        updateData.estimatedReach = estimates.estimatedReach;
        updateData.estimatedClicks = estimates.estimatedClicks;
        updateData.estimatedCost = estimates.estimatedCost;
      }

      const updatedRequest = await AdvertisementRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('store', 'name city');

      res.json({
        success: true,
        message: 'Solicitud actualizada exitosamente',
        data: { request: updatedRequest }
      });
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Enviar solicitud para revisión
  static async submitRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const request = await AdvertisementRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      if (request.storeManager.toString() !== req.user?._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para enviar esta solicitud'
        });
      }

      if (request.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden enviar solicitudes en estado borrador'
        });
      }

      // Validar que la solicitud esté completa
      if (!request.validateSchedule()) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de la campaña no son válidas'
        });
      }

      request.status = 'submitted';
      await request.save();

      // Enviar email de notificación a administradores
      try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await emailService.sendAdvertisementRequestNotification(
            admin.email,
            request.campaignName,
            request.storeManager.toString()
          );
        }
      } catch (emailError) {
        console.error('Error enviando notificación a administradores:', emailError);
      }

      res.json({
        success: true,
        message: 'Solicitud enviada para revisión exitosamente',
        data: { request }
      });
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ADMIN: Obtener todas las solicitudes
  static async getAllRequests(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const filter: any = {};
      if (status) filter.status = status;

      const requests = await AdvertisementRequest.find(filter)
        .populate('storeManager', 'name email')
        .populate('store', 'name city')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await AdvertisementRequest.countDocuments(filter);

      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ADMIN: Aprobar solicitud
  static async approveRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const request = await AdvertisementRequest.findById(id)
        .populate('storeManager', 'name email')
        .populate('store', 'name');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      if (request.status !== 'submitted' && request.status !== 'under_review') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden aprobar solicitudes enviadas o en revisión'
        });
      }

      // Crear la publicidad basada en la solicitud
      const advertisement = new Advertisement({
        title: request.title,
        description: request.description,
        content: request.content,
        imageUrl: request.imageUrl,
        videoUrl: request.videoUrl,
        navigationUrl: request.navigationUrl,
        store: request.store,
        displayType: request.displayType,
        targetPlatform: request.targetPlatform,
        targetAudience: request.targetAudience,
        schedule: request.schedule,
        displaySettings: {
          maxImpressions: request.estimatedReach,
          maxClicks: request.estimatedClicks,
          frequency: 3,
          priority: 7,
          isActive: false
        },
        status: 'approved',
        createdBy: req.user?._id
      });

      await advertisement.save();

      // Actualizar la solicitud
      request.status = 'approved';
      request.adminNotes = adminNotes;
      request.approvedBy = req.user?._id;
      request.approvedAt = new Date();
      request.createdAdvertisement = advertisement._id;
      await request.save();

      // Enviar email de aprobación al gestor
      try {
        await emailService.sendAdvertisementApproval(
          request.storeManager.email,
          request.campaignName,
          advertisement._id.toString(),
          adminNotes
        );
      } catch (emailError) {
        console.error('Error enviando email de aprobación:', emailError);
      }

      res.json({
        success: true,
        message: 'Solicitud aprobada y publicidad creada exitosamente',
        data: {
          request,
          advertisement: {
            id: advertisement._id,
            title: advertisement.title,
            status: advertisement.status
          }
        }
      });
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ADMIN: Rechazar solicitud
  static async rejectRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const request = await AdvertisementRequest.findById(id)
        .populate('storeManager', 'name email');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      if (request.status !== 'submitted' && request.status !== 'under_review') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden rechazar solicitudes enviadas o en revisión'
        });
      }

      request.status = 'rejected';
      request.rejectionReason = rejectionReason;
      request.approvedBy = req.user?._id;
      request.approvedAt = new Date();
      await request.save();

      // Enviar email de rechazo al gestor
      try {
        await emailService.sendAdvertisementRejection(
          request.storeManager.email,
          request.campaignName,
          rejectionReason
        );
      } catch (emailError) {
        console.error('Error enviando email de rechazo:', emailError);
      }

      res.json({
        success: true,
        message: 'Solicitud rechazada exitosamente',
        data: { request }
      });
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ADMIN: Cambiar estado de revisión
  static async changeReviewStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const request = await AdvertisementRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      if (!['submitted', 'under_review'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de revisión inválido'
        });
      }

      request.status = status;
      await request.save();

      res.json({
        success: true,
        message: 'Estado de revisión actualizado exitosamente',
        data: { request }
      });
    } catch (error) {
      console.error('Error cambiando estado de revisión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cancelar solicitud (gestor de tienda)
  static async cancelRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const request = await AdvertisementRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      if (request.storeManager.toString() !== req.user?._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta solicitud'
        });
      }

      if (!['draft', 'submitted'].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden cancelar solicitudes en borrador o enviadas'
        });
      }

      request.status = 'cancelled';
      await request.save();

      res.json({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: { request }
      });
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
