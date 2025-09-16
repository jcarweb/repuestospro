import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { LoyaltyService } from '../services/loyaltyService';
import User from '../models/User';
import Review from '../models/Review';
import Reward from '../models/Reward';
import RewardRedemption from '../models/RewardRedemption';
import PointsPolicy from '../models/PointsPolicy';

export class LoyaltyController {
  // Obtener estadísticas de fidelización del usuario
  static async getLoyaltyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const stats = await LoyaltyService.getLoyaltyStats(userId?.toString() || '');
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de fidelización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener premios disponibles
  static async getAvailableRewards(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const rewards = await LoyaltyService.getAvailableRewards(userId?.toString() || '');
      
      res.json({
        success: true,
        data: rewards
      });
    } catch (error) {
      console.error('Error obteniendo premios disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Canjear premio
  static async redeemReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const { rewardId, shippingAddress } = req.body;

      if (!rewardId) {
        res.status(400).json({
          success: false,
          message: 'ID del premio es requerido'
        });
        return;
      }

      const redemption = await LoyaltyService.redeemReward(
        userId?.toString() || '',
        rewardId,
        shippingAddress
      );

      res.json({
        success: true,
        message: 'Premio canjeado exitosamente',
        data: redemption
      });
    } catch (error) {
      console.error('Error canjeando premio:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Enviar calificación
  static async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const { productId, orderId, rating, title, comment, category } = req.body;

      if (!rating || !comment || !category) {
        res.status(400).json({
          success: false,
          message: 'Rating, comentario y categoría son requeridos'
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating debe estar entre 1 y 5'
        });
        return;
      }

      const result = await LoyaltyService.processReview({
        userId: userId?.toString() || '',
        productId,
        orderId,
        rating,
        title,
        comment,
        category
      });

      res.json({
        success: true,
        message: 'Calificación enviada exitosamente',
        data: {
          review: result.review,
          pointsEarned: result.pointsEarned
        }
      });
    } catch (error) {
      console.error('Error enviando calificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener código de referido
  static async getReferralCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Generar código si no existe
      if (!user.referralCode) {
        user.referralCode = await LoyaltyService.generateReferralCode();
        await user.save();
      }

      res.json({
        success: true,
        data: {
          referralCode: user.referralCode,
          referredBy: user.referredBy
        }
      });
    } catch (error) {
      console.error('Error obteniendo código de referido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar código de referido
  static async verifyReferralCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Código de referido es requerido'
        });
        return;
      }

      const referrer = await User.findOne({ referralCode: code.toUpperCase() });

      if (!referrer) {
        res.status(404).json({
          success: false,
          message: 'Código de referido inválido'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          referrerName: referrer.name,
          referrerEmail: referrer.email
        }
      });
    } catch (error) {
      console.error('Error verificando código de referido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener historial de canjes
  static async getRedemptionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const { page = 1, limit = 10 } = req.query;

      const redemptions = await RewardRedemption.find({ userId })
        .populate('rewardId', 'name description image')
        .sort({ createdAt: -1 } as any)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await RewardRedemption.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          redemptions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo historial de canjes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener calificaciones del usuario
  static async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ userId })
        .populate('productId', 'name image')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 } as any)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Review.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo calificaciones del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Registrar compartir de código de referido
  static async trackReferralShare(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const { platform, shareUrl, shareText } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const tracking = await LoyaltyService.trackReferralShare(
        userId?.toString() || '',
        user.referralCode,
        platform,
        shareUrl,
        shareText
      );

      res.json({
        success: true,
        message: 'Compartir registrado exitosamente',
        data: tracking
      });
    } catch (error) {
      console.error('Error registrando compartir:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Registrar clic en enlace de referido
  static async trackReferralClick(req: Request, res: Response): Promise<void> {
    try {
      const { referralCode } = req.params;

      await LoyaltyService.trackReferralClick(referralCode);

      res.json({
        success: true,
        message: 'Clic registrado exitosamente'
      });
    } catch (error) {
      console.error('Error registrando clic:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de tracking de referidos
  static async getReferralTrackingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?._id;
      const stats = await LoyaltyService.getReferralTrackingStats(userId?.toString() || '');

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ===== ADMIN ENDPOINTS =====

  // Obtener todos los premios (admin)
  static async getAllRewards(req: Request, res: Response): Promise<void> {
    try {
      const rewards = await Reward.find().sort({ createdAt: -1 } as any);
      
      res.json({
        success: true,
        data: rewards
      });
    } catch (error) {
      console.error('Error obteniendo premios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear premio (admin)
  static async createReward(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, pointsRequired, cashRequired, category, stock, isActive } = req.body;
      
      // Manejar la subida de imagen
      let image = '';
      if (req.file) {
        image = `/uploads/rewards/${req.file.filename}`;
      }

      const reward = new Reward({
        name,
        description,
        image,
        pointsRequired: Number(pointsRequired),
        cashRequired: Number(cashRequired),
        category,
        stock: Number(stock),
        isActive: isActive === 'true' || isActive === true,
        createdBy: (req as AuthenticatedRequest).user?._id
      });

      await reward.save();

      res.json({
        success: true,
        message: 'Premio creado exitosamente',
        data: reward
      });
    } catch (error) {
      console.error('Error creando premio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar premio (admin)
  static async updateReward(req: Request, res: Response): Promise<void> {
    try {
      const { rewardId } = req.params;
      const updateData = req.body;
      
      if (req.file) {
        updateData.image = `/uploads/rewards/${req.file.filename}`;
      }

      // Convertir tipos de datos
      if (updateData.pointsRequired) updateData.pointsRequired = Number(updateData.pointsRequired);
      if (updateData.cashRequired) updateData.cashRequired = Number(updateData.cashRequired);
      if (updateData.stock) updateData.stock = Number(updateData.stock);
      if (updateData.isActive !== undefined) {
        updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
      }

      const reward = await Reward.findByIdAndUpdate(
        rewardId,
        updateData,
        { new: true }
      );

      if (!reward) {
        res.status(404).json({
          success: false,
          message: 'Premio no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Premio actualizado exitosamente',
        data: reward
      });
    } catch (error) {
      console.error('Error actualizando premio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los canjes (admin)
  static async getAllRedemptions(req: Request, res: Response): Promise<void> {
    try {
      const redemptions = await RewardRedemption.find()
        .populate('userId', 'name email')
        .populate('rewardId', 'name description image')
        .sort({ createdAt: -1 } as any);

      res.json({
        success: true,
        data: redemptions
      });
    } catch (error) {
      console.error('Error obteniendo canjes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar estado de canje (admin)
  static async updateRedemptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { redemptionId } = req.params;
      const { status, notes } = req.body;

      const redemption = await RewardRedemption.findByIdAndUpdate(
        redemptionId,
        { status, notes },
        { new: true }
      ).populate('userId', 'name email')
       .populate('rewardId', 'name description image');

      if (!redemption) {
        res.status(404).json({
          success: false,
          message: 'Canje no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: redemption
      });
    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar tracking de canje (admin)
  static async updateRedemptionTracking(req: Request, res: Response): Promise<void> {
    try {
      const { redemptionId } = req.params;
      const { trackingNumber } = req.body;

      const redemption = await RewardRedemption.findByIdAndUpdate(
        redemptionId,
        { 
          trackingNumber,
          status: 'shipped' // Automáticamente cambia a enviado
        },
        { new: true }
      ).populate('userId', 'name email')
       .populate('rewardId', 'name description image');

      if (!redemption) {
        res.status(404).json({
          success: false,
          message: 'Canje no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Tracking actualizado exitosamente',
        data: redemption
      });
    } catch (error) {
      console.error('Error actualizando tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener políticas de puntos (admin)
  static async getPointsPolicies(req: Request, res: Response): Promise<void> {
    try {
      const policies = await PointsPolicy.find().sort({ action: 1 } as any);
      
      res.json({
        success: true,
        data: policies
      });
    } catch (error) {
      console.error('Error obteniendo políticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar políticas de puntos (admin)
  static async updatePointsPolicies(req: Request, res: Response): Promise<void> {
    try {
      const { policies } = req.body;

      // Eliminar políticas existentes
      await PointsPolicy.deleteMany({});

      // Crear nuevas políticas
      const newPolicies = await PointsPolicy.insertMany(
        policies.map((policy: any) => ({
          ...policy,
          createdBy: (req as AuthenticatedRequest).user?._id
        }))
      );

      res.json({
        success: true,
        message: 'Políticas actualizadas exitosamente',
        data: newPolicies
      });
    } catch (error) {
      console.error('Error actualizando políticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas detalladas (admin)
  static async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      // Obtener estadísticas básicas
      const totalUsers = await User.countDocuments({ role: 'client' });
      const activeUsers = await User.countDocuments({ 
        role: 'client', 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      });

      // Obtener estadísticas de premios
      const totalRewards = await Reward.countDocuments();
      const activeRewards = await Reward.countDocuments({ isActive: true });

      // Obtener estadísticas de canjes
      const totalRedemptions = await RewardRedemption.countDocuments();
      const pendingRedemptions = await RewardRedemption.countDocuments({ status: 'pending' });
      const completedRedemptions = await RewardRedemption.countDocuments({ 
        status: { $in: ['delivered', 'shipped'] } 
      });

      // Obtener estadísticas de reseñas
      const totalReviews = await Review.countDocuments();
      const averageRating = await Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      // Obtener premios más populares
      const topRewards = await RewardRedemption.aggregate([
        { $group: { _id: '$rewardId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'rewards',
            localField: '_id',
            foreignField: '_id',
            as: 'reward'
          }
        },
        { $unwind: '$reward' },
        {
          $project: {
            name: '$reward.name',
            redemptions: '$count',
            points: '$reward.pointsRequired'
          }
        }
      ]);

      // Calcular crecimiento mensual (simulado por ahora)
      const monthlyGrowth = 12.5; // Esto vendría de un cálculo real

      // Actividad reciente (simulada por ahora)
      const recentActivity = [
        {
          type: 'purchase',
          description: 'Compra realizada por Juan Pérez',
          points: 25,
          date: new Date().toISOString()
        },
        {
          type: 'review',
          description: 'Reseña enviada por María García',
          points: 10,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'referral',
          description: 'Nuevo cliente referido por Carlos López',
          points: 50,
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'redemption',
          description: 'Premio canjeado por Ana Rodríguez',
          points: -100,
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Calcular puntos totales (simulado)
      const totalPoints = 45678;
      const pointsIssued = 67890;
      const pointsRedeemed = 22212;

      const stats = {
        totalUsers,
        activeUsers,
        totalPoints,
        pointsIssued,
        pointsRedeemed,
        totalRewards,
        activeRewards,
        totalRedemptions,
        pendingRedemptions,
        completedRedemptions,
        averageRating: averageRating[0]?.avgRating || 0,
        totalReviews,
        monthlyGrowth,
        topRewards,
        recentActivity
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
} 