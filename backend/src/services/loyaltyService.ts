import crypto from 'crypto';
import User from '../models/User';
import Review from '../models/Review';
import Reward from '../models/Reward';
import RewardRedemption from '../models/RewardRedemption';
import Activity from '../models/Activity';
import ReferralTracking from '../models/ReferralTracking';

export class LoyaltyService {
  // Generar código de referido único
  static async generateReferralCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      // Generar código de 8 caracteres
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      // Verificar que no exista
      const existingUser = await User.findOne({ referralCode: code });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    return code!;
  }

  // Calcular puntos por calificación
  static calculateReviewPoints(rating: number, category: string): number {
    let basePoints = 0;
    
    switch (category) {
      case 'product':
        basePoints = 50;
        break;
      case 'service':
        basePoints = 75;
        break;
      case 'delivery':
        basePoints = 25;
        break;
      case 'app':
        basePoints = 100;
        break;
      default:
        basePoints = 50;
    }
    
    // Multiplicar por el rating (1-5)
    return basePoints * rating;
  }

  // Calcular nivel de lealtad basado en puntos y compras
  static calculateLoyaltyLevel(points: number, totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (points >= 10000 && totalSpent >= 1000) return 'platinum';
    if (points >= 5000 && totalSpent >= 500) return 'gold';
    if (points >= 2000 && totalSpent >= 200) return 'silver';
    return 'bronze';
  }

  // Agregar puntos al usuario
  static async addPoints(userId: string, points: number, reason: string, metadata?: any): Promise<void> {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    user.points += points;
    
    // Recalcular nivel de lealtad
    user.loyaltyLevel = this.calculateLoyaltyLevel(user.points, user.totalSpent);
    
    await user.save();

    // Registrar actividad
    await Activity.create({
      userId: user._id,
      type: 'points_earned',
      description: `Puntos ganados: ${points} - ${reason}`,
      metadata: {
        points,
        reason,
        totalPoints: user.points,
        loyaltyLevel: user.loyaltyLevel,
        ...metadata
      }
    });
  }

  // Procesar referido
  static async processReferral(referrerId: string, newUserId: string): Promise<void> {
    const referrer = await User.findById(referrerId);
    const newUser = await User.findById(newUserId);
    
    if (!referrer || !newUser) throw new Error('Usuario no encontrado');

    // Puntos para el referidor (500 puntos)
    await this.addPoints(referrerId, 500, 'Referido registrado', {
      referredUser: newUserId,
      referredUserEmail: newUser.email
    });

    // Puntos para el nuevo usuario (200 puntos)
    await this.addPoints(newUserId, 200, 'Registro con código de referido', {
      referredBy: referrerId,
      referrerEmail: referrer.email
    });

    // Actualizar referido en el nuevo usuario
    newUser.referredBy = referrerId;
    await newUser.save();
  }

  // Procesar calificación
  static async processReview(reviewData: {
    userId: string;
    productId?: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment: string;
    category: 'product' | 'service' | 'delivery' | 'app';
  }): Promise<{ review: any; pointsEarned: number }> {
    const pointsEarned = this.calculateReviewPoints(reviewData.rating, reviewData.category);
    
    // Crear la calificación
    const review = await Review.create({
      ...reviewData,
      pointsEarned,
      isVerified: true // Verificada porque viene de una compra real
    });

    // Agregar puntos al usuario
    await this.addPoints(reviewData.userId, pointsEarned, 'Calificación enviada', {
      reviewId: review._id,
      category: reviewData.category,
      rating: reviewData.rating
    });

    return { review, pointsEarned };
  }

  // Canjear premio
  static async redeemReward(userId: string, rewardId: string, shippingAddress?: any): Promise<any> {
    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);
    
    if (!user || !reward) throw new Error('Usuario o premio no encontrado');
    if (!reward.isActive) throw new Error('Premio no disponible');
    if (reward.stock <= 0) throw new Error('Premio agotado');
    if (user.points < reward.pointsRequired) throw new Error('Puntos insuficientes');

    // Verificar fechas de validez
    const now = new Date();
    if (reward.startDate && now < reward.startDate) throw new Error('Premio aún no disponible');
    if (reward.endDate && now > reward.endDate) throw new Error('Premio expirado');

    // Crear canje
    const redemption = await RewardRedemption.create({
      userId,
      rewardId,
      pointsSpent: reward.pointsRequired,
      cashSpent: reward.cashRequired,
      shippingAddress,
      status: 'pending'
    });

    // Descontar puntos del usuario
    user.points -= reward.pointsRequired;
    await user.save();

    // Reducir stock del premio
    reward.stock -= 1;
    await reward.save();

    // Registrar actividad
    await Activity.create({
      userId: user._id,
      type: 'reward_redeemed',
      description: `Premio canjeado: ${reward.name}`,
      metadata: {
        rewardId: reward._id,
        rewardName: reward.name,
        pointsSpent: reward.pointsRequired,
        cashSpent: reward.cashRequired,
        redemptionId: redemption._id
      }
    });

    return redemption;
  }

  // Obtener estadísticas de fidelización
  static async getLoyaltyStats(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const reviews = await Review.find({ userId }).countDocuments();
    const redemptions = await RewardRedemption.find({ userId }).countDocuments();
    const totalPointsEarned = await Review.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$pointsEarned' } } }
    ]);

    const totalPointsSpent = await RewardRedemption.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$pointsSpent' } } }
    ]);

    return {
      currentPoints: user.points,
      loyaltyLevel: user.loyaltyLevel,
      totalPurchases: user.totalPurchases,
      totalSpent: user.totalSpent,
      reviewsCount: reviews,
      redemptionsCount: redemptions,
      totalPointsEarned: totalPointsEarned[0]?.total || 0,
      totalPointsSpent: totalPointsSpent[0]?.total || 0,
      referralCode: user.referralCode,
      referredBy: user.referredBy
    };
  }

  // Obtener premios disponibles
  static async getAvailableRewards(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const now = new Date();
    
    const rewards = await Reward.find({
      isActive: true,
      stock: { $gt: 0 },
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    }).sort({ pointsRequired: 1 });

    return rewards.map(reward => ({
      ...reward.toObject(),
      canAfford: user.points >= reward.pointsRequired
    }));
  }

  // Registrar compartir de código de referido
  static async trackReferralShare(
    referrerId: string,
    referralCode: string,
    platform: string,
    shareUrl: string,
    shareText: string
  ): Promise<any> {
    const referrer = await User.findById(referrerId);
    if (!referrer) throw new Error('Usuario no encontrado');

    // Crear o actualizar tracking
    const tracking = await ReferralTracking.findOneAndUpdate(
      { referralCode, referrerId },
      {
        referrerName: referrer.name,
        referrerEmail: referrer.email,
        platform,
        shareUrl,
        shareText,
        isActive: true
      },
      { upsert: true, new: true }
    );

    return tracking;
  }

  // Registrar clic en enlace de referido
  static async trackReferralClick(referralCode: string): Promise<void> {
    await ReferralTracking.findOneAndUpdate(
      { referralCode },
      { $inc: { clicks: 1 } }
    );
  }

  // Registrar registro exitoso con código de referido
  static async trackSuccessfulReferral(
    referralCode: string,
    newUserId: string
  ): Promise<void> {
    const tracking = await ReferralTracking.findOne({ referralCode });
    if (!tracking) return;

    // Actualizar estadísticas
    await ReferralTracking.findByIdAndUpdate(tracking._id, {
      $inc: {
        registrations: 1,
        successfulRegistrations: 1,
        totalPointsEarned: 500 // Puntos para el referidor
      }
    });

    // Procesar el referido (ya implementado)
    await this.processReferral(tracking.referrerId.toString(), newUserId);
  }

  // Obtener estadísticas de tracking de referidos
  static async getReferralTrackingStats(userId: string): Promise<any> {
    const trackings = await ReferralTracking.find({ referrerId: userId });
    
    const stats = {
      totalShares: trackings.length,
      totalClicks: trackings.reduce((sum, t) => sum + t.clicks, 0),
      totalRegistrations: trackings.reduce((sum, t) => sum + t.registrations, 0),
      totalSuccessfulRegistrations: trackings.reduce((sum, t) => sum + t.successfulRegistrations, 0),
      totalPointsEarned: trackings.reduce((sum, t) => sum + t.totalPointsEarned, 0),
      platformStats: {} as any
    };

    // Estadísticas por plataforma
    trackings.forEach(tracking => {
      if (!stats.platformStats[tracking.platform]) {
        stats.platformStats[tracking.platform] = {
          shares: 0,
          clicks: 0,
          registrations: 0
        };
      }
      stats.platformStats[tracking.platform].shares++;
      stats.platformStats[tracking.platform].clicks += tracking.clicks;
      stats.platformStats[tracking.platform].registrations += tracking.registrations;
    });

    return stats;
  }
} 