import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Activity from '../models/Activity';
import { IActivity } from '../models/Activity';

class ActivityController {
  // Obtener actividades del usuario autenticado
  async getUserActivities(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      const activities = await (Activity as any).getUserActivities(userId, limit, skip);

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error getting user activities:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de actividades del usuario
  async getActivityStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const days = parseInt(req.query.days as string) || 30;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      const stats = await (Activity as any).getActivityStats(userId, days);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting activity stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear una nueva actividad (usado internamente)
  async createActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { type, description, metadata, success, errorMessage } = req.body;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      if (!type || !description) {
        return res.status(400).json({
          success: false,
          message: 'Tipo y descripción son requeridos'
        });
      }

      const activity = await (Activity as any).createActivity(
        userId,
        type,
        description,
        metadata,
        success,
        errorMessage
      );

      res.status(201).json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todas las actividades (solo admin)
  async getAllActivities(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const activities = await Activity.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Activity.countDocuments();

      res.json({
        success: true,
        data: activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting all activities:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener actividades por tipo (solo admin)
  async getActivitiesByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const activities = await Activity.find({ type })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Activity.countDocuments({ type });

      res.json({
        success: true,
        data: activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting activities by type:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas globales (solo admin)
  async getGlobalStats(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await Activity.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            successCount: {
              $sum: { $cond: ['$success', 1, 0] }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalActivities = await Activity.countDocuments({
        createdAt: { $gte: startDate }
      });

      const uniqueUsers = await Activity.distinct('userId', {
        createdAt: { $gte: startDate }
      });

      res.json({
        success: true,
        data: {
          stats,
          totalActivities,
          uniqueUsers: uniqueUsers.length,
          period: `${days} días`
        }
      });
    } catch (error) {
      console.error('Error getting global stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new ActivityController();
