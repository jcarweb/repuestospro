import { Request, Response } from 'express';
import Review from '../models/Review';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Store from '../models/Store';
import { ContentFilter } from '../middleware/contentFilter';

export class ReviewController {
  // Obtener todas las reseñas de una tienda
  static async getStoreReviews(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 20, rating, category, verified, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Verificar que la tienda existe
      const store = await Store.findById(storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'Tienda no encontrada'
        });
        return;
      }

      // Construir filtros
      const filters: any = {};
      
      // Filtrar por productos de la tienda
      const storeProducts = await Product.find({ storeId }).select('_id');
      const productIds = storeProducts.map(p => p._id);
      filters.productId = { $in: productIds };

      if (rating) {
        filters.rating = Number(rating);
      }

      if (category) {
        filters.category = category;
      }

      if (verified !== undefined) {
        filters.isVerified = verified === 'true';
      }

      // Construir ordenamiento
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const reviews = await Review.find(filters)
        .populate('userId', 'name email avatar')
        .populate('productId', 'name image price')
        .populate('orderId', 'orderNumber total')
        .sort(sort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Review.countDocuments(filters);

      // Calcular estadísticas
      const stats = await Review.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      if (stats.length > 0) {
        stats[0].ratingDistribution.forEach((rating: number) => {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
        });
      }

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          },
          stats: {
            averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
            totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
            ratingDistribution
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo reseñas de la tienda:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener reseñas de un producto específico
  static async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, rating, verified, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }

      // Construir filtros
      const filters: any = { productId };

      if (rating) {
        filters.rating = Number(rating);
      }

      if (verified !== undefined) {
        filters.isVerified = verified === 'true';
      }

      // Construir ordenamiento
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const reviews = await Review.find(filters)
        .populate('userId', 'name email avatar')
        .populate('orderId', 'orderNumber')
        .sort(sort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Review.countDocuments(filters);

      // Calcular estadísticas del producto
      const stats = await Review.aggregate([
        { $match: { productId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      if (stats.length > 0) {
        stats[0].ratingDistribution.forEach((rating: number) => {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
        });
      }

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          },
          stats: {
            averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
            totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
            ratingDistribution
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo reseñas del producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Responder a una reseña
  static async replyToReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { reply } = req.body;
      const storeManagerId = (req as any).user._id;

      if (!reply || reply.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'La respuesta no puede estar vacía'
        });
        return;
      }

      // Validar contenido de la respuesta
      const contentValidation = await ContentFilter.validateReviewContent(reply);
      if (!contentValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'La respuesta contiene contenido inapropiado',
          details: contentValidation.reasons
        });
        return;
      }

      const review = await Review.findById(reviewId)
        .populate('productId', 'storeId');

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
        return;
      }

      // Verificar que el producto pertenece a la tienda del store manager
      const product = await Product.findById(review.productId);
      if (!product || product.storeId.toString() !== storeManagerId.toString()) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para responder a esta reseña'
        });
        return;
      }

      // Agregar la respuesta
      review.reply = {
        text: reply,
        authorId: storeManagerId,
        createdAt: new Date()
      };

      await review.save();

      res.json({
        success: true,
        message: 'Respuesta enviada exitosamente',
        data: review
      });
    } catch (error) {
      console.error('Error respondiendo a la reseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Marcar reseña como útil
  static async markReviewHelpful(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const userId = (req as any).user._id;

      const review = await Review.findById(reviewId);
      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
        return;
      }

      // Incrementar contador de útil
      review.helpful += 1;
      await review.save();

      res.json({
        success: true,
        message: 'Reseña marcada como útil',
        data: { helpful: review.helpful }
      });
    } catch (error) {
      console.error('Error marcando reseña como útil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Reportar reseña
  static async reportReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { reason, description } = req.body;
      const userId = (req as any).user._id;

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'Razón del reporte es requerida'
        });
        return;
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Reseña no encontrada'
        });
        return;
      }

      // Agregar reporte
      if (!review.reports) {
        review.reports = [];
      }

      review.reports.push({
        userId,
        reason,
        description,
        createdAt: new Date()
      });

      await review.save();

      res.json({
        success: true,
        message: 'Reseña reportada exitosamente'
      });
    } catch (error) {
      console.error('Error reportando reseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de reseñas para dashboard
  static async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const storeManagerId = (req as any).user._id;
      const { period = '30d' } = req.query;

      // Obtener productos de la tienda
      const storeProducts = await Product.find({ storeId: storeManagerId }).select('_id');
      const productIds = storeProducts.map(p => p._id);

      // Calcular fecha de inicio según el período
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Estadísticas generales
      const generalStats = await Review.aggregate([
        {
          $match: {
            productId: { $in: productIds },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            totalPoints: { $sum: '$pointsEarned' }
          }
        }
      ]);

      // Distribución de calificaciones
      const ratingDistribution = await Review.aggregate([
        {
          $match: {
            productId: { $in: productIds },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Reseñas por categoría
      const categoryStats = await Review.aggregate([
        {
          $match: {
            productId: { $in: productIds },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      // Reseñas recientes
      const recentReviews = await Review.find({
        productId: { $in: productIds },
        createdAt: { $gte: startDate }
      })
        .populate('userId', 'name email avatar')
        .populate('productId', 'name image')
        .sort({ createdAt: -1 })
        .limit(5);

      // Productos más reseñados
      const topReviewedProducts = await Review.aggregate([
        {
          $match: {
            productId: { $in: productIds },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$productId',
            reviewCount: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        },
        { $sort: { reviewCount: -1 } },
        { $limit: 5 }
      ]);

      // Poblar información de productos
      const populatedTopProducts = await Review.populate(topReviewedProducts, {
        path: '_id',
        select: 'name image price',
        model: 'Product'
      });

      res.json({
        success: true,
        data: {
          period,
          generalStats: generalStats[0] || {
            totalReviews: 0,
            averageRating: 0,
            totalPoints: 0
          },
          ratingDistribution: ratingDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as any),
          categoryStats,
          recentReviews,
          topReviewedProducts: populatedTopProducts
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de reseñas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener reseñas pendientes de respuesta
  static async getPendingReplies(req: Request, res: Response): Promise<void> {
    try {
      const storeManagerId = (req as any).user._id;
      const { page = 1, limit = 20 } = req.query;

      // Obtener productos de la tienda
      const storeProducts = await Product.find({ storeId: storeManagerId }).select('_id');
      const productIds = storeProducts.map(p => p._id);

      const reviews = await Review.find({
        productId: { $in: productIds },
        reply: { $exists: false }
      })
        .populate('userId', 'name email avatar')
        .populate('productId', 'name image price')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Review.countDocuments({
        productId: { $in: productIds },
        reply: { $exists: false }
      });

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
      console.error('Error obteniendo reseñas pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
