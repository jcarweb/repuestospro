import Store from '../models/Store';
import Subscription from '../models/Subscription';
import mongoose from 'mongoose';
export class SubscriptionService {
  /**
   * Verifica si una tienda tiene acceso a promociones
   */
  static async hasPromotionsAccess(storeId: string): Promise<{ hasAccess: boolean; reason?: string; subscription?: any }> {
    try {
      const store = await Store.findById(storeId).populate('subscription');
      if (!store) {
        return { hasAccess: false, reason: 'Tienda no encontrada' };
      }
      // Si no tiene suscripción, usar plan básico por defecto
      if (!store.subscription) {
        return { hasAccess: false, reason: 'Plan básico no incluye promociones' };
      }
      const subscription = store.subscription as any;
      // Verificar si la suscripción está activa
      if (store.subscriptionStatus !== 'active') {
        return {
          hasAccess: false,
          reason: `Suscripción ${store.subscriptionStatus}. Se requiere suscripción activa para promociones.`,
          subscription
        };
      }
      // Verificar si la suscripción ha expirado
      if (store.subscriptionExpiresAt && new Date() > store.subscriptionExpiresAt) {
        return {
          hasAccess: false,
          reason: 'Suscripción expirada. Renueva tu plan para acceder a promociones.',
          subscription
        };
      }
      // Verificar el tipo de plan
      switch (subscription.type) {
        case 'basic':
          return { hasAccess: false, reason: 'Plan básico no incluye promociones. Actualiza a Pro o Elite.', subscription };
        case 'pro':
        case 'elite':
          return { hasAccess: true, subscription };
        default:
          return { hasAccess: false, reason: 'Tipo de suscripción no válido', subscription };
      }
    } catch (error) {
      console.error('Error verificando acceso a promociones:', error);
      return { hasAccess: false, reason: 'Error interno del servidor' };
    }
  }
  /**
   * Verifica si una tienda tiene acceso a funcionalidades premium
   */
  static async hasPremiumAccess(storeId: string, feature: string): Promise<{ hasAccess: boolean; reason?: string; subscription?: any }> {
    try {
      const store = await Store.findById(storeId).populate('subscription');
      if (!store) {
        return { hasAccess: false, reason: 'Tienda no encontrada' };
      }
      // Si no tiene suscripción, usar plan básico por defecto
      if (!store.subscription) {
        return { hasAccess: false, reason: 'Plan básico con funcionalidades limitadas' };
      }
      const subscription = store.subscription as any;
      // Verificar si la suscripción está activa
      if (store.subscriptionStatus !== 'active') {
        return {
          hasAccess: false,
          reason: `Suscripción ${store.subscriptionStatus}. Se requiere suscripción activa.`,
          subscription
        };
      }
      // Verificar si la suscripción ha expirado
      if (store.subscriptionExpiresAt && new Date() > store.subscriptionExpiresAt) {
        return {
          hasAccess: false,
          reason: 'Suscripción expirada. Renueva tu plan.',
          subscription
        };
      }
      // Mapeo de funcionalidades por plan
      const featureAccess = {
        'promotions': { basic: false, pro: true, elite: true },
        'advanced_analytics': { basic: false, pro: true, elite: true },
        'priority_support': { basic: false, pro: true, elite: true },
        'advertising': { basic: false, pro: false, elite: true },
        'custom_domain': { basic: false, pro: false, elite: true },
        'api_access': { basic: false, pro: false, elite: true },
        'bulk_operations': { basic: false, pro: true, elite: true },
        'advanced_reports': { basic: false, pro: true, elite: true }
      };
      const featureConfig = featureAccess[feature as keyof typeof featureAccess];
      if (!featureConfig) {
        return { hasAccess: false, reason: 'Funcionalidad no configurada', subscription };
      }
      const hasAccess = featureConfig[subscription.type as keyof typeof featureConfig];
      if (!hasAccess) {
        const planNames = {
          basic: 'Básico',
          pro: 'Pro',
          elite: 'Elite'
        };
        return {
          hasAccess: false,
          reason: `Funcionalidad disponible solo en plan ${subscription.type === 'basic' ? 'Pro o Elite' : 'Elite'}.`,
          subscription
        };
      }
      return { hasAccess: true, subscription };
    } catch (error) {
      console.error('Error verificando acceso premium:', error);
      return { hasAccess: false, reason: 'Error interno del servidor' };
    }
  }
  /**
   * Obtiene el plan actual de una tienda
   */
  static async getCurrentPlan(storeId: string): Promise<{ plan: any; status: string; expiresAt?: Date }> {
    try {
      const store = await Store.findById(storeId).populate('subscription');
      if (!store) {
        throw new Error('Tienda no encontrada');
      }
      return {
        plan: store.subscription,
        status: store.subscriptionStatus,
        ...(store.subscriptionExpiresAt && { expiresAt: store.subscriptionExpiresAt })
      };
    } catch (error) {
      console.error('Error obteniendo plan actual:', error);
      throw error;
    }
  }
  /**
   * Actualiza el plan de suscripción de una tienda
   */
  static async updateSubscription(storeId: string, subscriptionId: string, status: string, expiresAt?: Date): Promise<void> {
    try {
      await Store.findByIdAndUpdate(storeId, {
        subscription: new mongoose.Types.ObjectId(subscriptionId),
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt
      });
    } catch (error) {
      console.error('Error actualizando suscripción:', error);
      throw error;
    }
  }
  /**
   * Verifica si una tienda ha excedido los límites de su plan
   */
  static async checkPlanLimits(storeId: string, feature: 'products' | 'stores'): Promise<{ withinLimit: boolean; current: number; limit: number; reason?: string }> {
    try {
      const store = await Store.findById(storeId).populate('subscription');
      if (!store) {
        return { withinLimit: false, current: 0, limit: 0, reason: 'Tienda no encontrada' };
      }
      // Si no tiene suscripción, usar límites del plan básico
      if (!store.subscription) {
        const basicLimits = { products: 50, stores: 1 };
        return { withinLimit: true, current: 0, limit: basicLimits[feature], reason: 'Plan básico' };
      }
      const subscription = store.subscription as any;
      const limits = {
        products: subscription.maxProducts || 0,
        stores: subscription.maxStores || 0
      };
      // Aquí podrías agregar lógica para contar productos/tiendas actuales
      // Por ahora retornamos valores de ejemplo
      const currentCounts = {
        products: 0,
        stores: 0
      };
      const current = currentCounts[feature];
      const limit = limits[feature];
      return {
        withinLimit: current < limit,
        current,
        limit,
        reason: current >= limit ? `Límite de ${feature} alcanzado` : ''
      };
    } catch (error) {
      console.error('Error verificando límites del plan:', error);
      return { withinLimit: false, current: 0, limit: 0, reason: 'Error interno del servidor' };
    }
  }
  /**
   * Obtiene información de upgrade para una tienda
   */
  static async getUpgradeInfo(storeId: string): Promise<{ currentPlan: any; availablePlans: any[]; recommendedPlan?: any }> {
    try {
      const store = await Store.findById(storeId).populate('subscription');
      if (!store) {
        throw new Error('Tienda no encontrada');
      }
      // Obtener todos los planes disponibles
      const availablePlans = await Subscription.find({ isActive: true }).sort({ price: 1 });
      // Determinar plan recomendado basado en el uso actual
      let recommendedPlan = null;
      if (!store.subscription || (store.subscription as any).type === 'basic') {
        recommendedPlan = availablePlans.find(plan => plan.type === 'pro');
      } else if ((store.subscription as any).type === 'pro') {
        recommendedPlan = availablePlans.find(plan => plan.type === 'elite');
      }
      return {
        currentPlan: store.subscription,
        availablePlans,
        recommendedPlan
      };
    } catch (error) {
      console.error('Error obteniendo información de upgrade:', error);
      throw error;
    }
  }
}