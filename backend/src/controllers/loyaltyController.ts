import { Request, Response } from 'express';
import { LoyaltyService } from '../services/loyaltyService';
import User from '../models/User';
import Review from '../models/Review';
import Reward from '../models/Reward';
import RewardRedemption from '../models/RewardRedemption';

export class LoyaltyController {
  // Obtener estadísticas de fidelización del usuario
  static async getLoyaltyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user._id;
      const stats = await LoyaltyService.getLoyaltyStats(userId.toString());
      
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
      const userId = (req as any).user._id;
      const rewards = await LoyaltyService.getAvailableRewards(userId.toString());
      
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
      const userId = (req as any).user._id;
      const { rewardId, shippingAddress } = req.body;

      if (!rewardId) {
        res.status(400).json({
          success: false,
          message: 'ID del premio es requerido'
        });
        return;
      }

      const redemption = await LoyaltyService.redeemReward(
        userId.toString(),
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
      const userId = (req as any).user._id;
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
        userId: userId.toString(),
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
      const userId = (req as any).user._id;
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
      const userId = (req as any).user._id;
      const { page = 1, limit = 10 } = req.query;

      const redemptions = await RewardRedemption.find({ userId })
        .populate('rewardId', 'name description image')
        .sort({ createdAt: -1 })
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
      const userId = (req as any).user._id;
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ userId })
        .populate('productId', 'name image')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
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
      const userId = (req as any).user._id;
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
        userId.toString(),
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
      const userId = (req as any).user._id;
      const stats = await LoyaltyService.getReferralTrackingStats(userId.toString());

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
} 