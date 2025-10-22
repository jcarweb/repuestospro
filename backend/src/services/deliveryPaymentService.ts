import DeliverySettings from '../models/DeliverySettings';
import Delivery from '../models/Delivery';
import DeliveryTransaction from '../models/DeliveryTransaction';
import DeliveryWallet from '../models/DeliveryWallet';
import DeliveryLog from '../models/DeliveryLog';

interface PaymentCalculationParams {
  distance: number;
  orderValue: number;
  zone: string;
  peakHours: boolean;
  weatherCondition: 'normal' | 'rain' | 'storm' | 'extreme';
  priority: 'normal' | 'high' | 'urgent';
  deliveryTime?: number;
  rating?: number;
}

interface PaymentResult {
  baseFee: number;
  distanceFee: number;
  timeFee: number;
  peakHoursMultiplier: number;
  weatherMultiplier: number;
  priorityMultiplier: number;
  bonusAmount: number;
  bonusType?: string;
  totalPayment: number;
  commissionDeduction: number;
  estimatedTime: number;
}

export async function calculateDeliveryPayment(params: PaymentCalculationParams): Promise<PaymentResult> {
  try {
    // Obtener configuración actual
    const settings = await DeliverySettings.findOne({ 'system.isActive': true });
    if (!settings) {
      throw new Error('Configuración de deliverys no encontrada');
    }

    const {
      distance,
      orderValue,
      zone,
      peakHours,
      weatherCondition,
      priority,
      deliveryTime,
      rating
    } = params;

    // Calcular tarifa base
    let baseFee = settings.baseRates.baseDeliveryFee;
    
    // Aplicar tarifa mínima garantizada
    if (baseFee < settings.baseRates.minimumDeliveryFee) {
      baseFee = settings.baseRates.minimumDeliveryFee;
    }

    // Calcular tarifa por distancia
    const distanceFee = Math.max(0, distance - 5) * settings.baseRates.distanceRate;

    // Calcular tarifa por tiempo (si se proporciona)
    const timeFee = deliveryTime ? deliveryTime * settings.baseRates.timeRate : 0;

    // Aplicar multiplicadores
    const peakHoursMultiplier = peakHours ? settings.baseRates.peakHoursMultiplier : 1;
    const weatherMultiplier = weatherCondition !== 'normal' ? settings.baseRates.weatherMultiplier : 1;
    const priorityMultiplier = priority === 'urgent' ? 1.5 : priority === 'high' ? 1.2 : 1;

    // Calcular pago base
    const basePayment = (baseFee + distanceFee + timeFee) * 
                       peakHoursMultiplier * 
                       weatherMultiplier * 
                       priorityMultiplier;

    // Calcular bonos
    const bonusResult = await calculateBonuses({
      deliveryId: '', // Se pasará cuando se tenga
      basePayment,
      orderValue,
      distance,
      deliveryTime: deliveryTime || 0,
      rating: rating || 5,
      zone,
      peakHours,
      weatherCondition,
      settings
    });

    const totalPayment = basePayment + bonusResult.amount;
    
    // Calcular deducción de comisión
    const commissionDeduction = totalPayment * settings.system.commissionDeductionRate;

    // Estimar tiempo de entrega
    const estimatedTime = estimateDeliveryTime(distance, zone, peakHours, weatherCondition);

    return {
      baseFee,
      distanceFee,
      timeFee,
      peakHoursMultiplier,
      weatherMultiplier,
      priorityMultiplier,
      bonusAmount: bonusResult.amount,
      bonusType: bonusResult.type || 'none',
      totalPayment,
      commissionDeduction,
      estimatedTime
    };

  } catch (error) {
    console.error('Error calculating delivery payment:', error);
    throw error;
  }
}

interface BonusCalculationParams {
  deliveryId: string;
  basePayment: number;
  orderValue: number;
  distance: number;
  deliveryTime?: number;
  rating?: number;
  zone: string;
  peakHours: boolean;
  weatherCondition: string;
  settings: any;
}

interface BonusResult {
  amount: number;
  type?: string;
}

async function calculateBonuses(params: BonusCalculationParams): Promise<BonusResult> {
  const { settings, basePayment, orderValue, distance, deliveryTime, rating, zone, peakHours } = params;
  
  let totalBonus = 0;
  let bonusType = '';

  // Bono por rendimiento (rating alto)
  if (settings.bonuses.performance.enabled && rating && rating >= settings.bonuses.performance.minRating) {
    totalBonus += settings.bonuses.performance.bonusAmount;
    bonusType = 'performance';
  }

  // Bono por velocidad
  if (settings.bonuses.speed.enabled && deliveryTime && deliveryTime <= settings.bonuses.speed.maxDeliveryTime) {
    totalBonus += settings.bonuses.speed.bonusAmount;
    if (!bonusType) bonusType = 'speed';
  }

  // Bono por volumen (se calculará después de completar la entrega)
  if (settings.bonuses.volume.enabled) {
    // Este bono se aplicará en el proceso de pago final
    const volumeBonus = await calculateVolumeBonus(params.deliveryId, settings);
    totalBonus += volumeBonus;
    if (volumeBonus > 0 && !bonusType) bonusType = 'volume';
  }

  // Bono por condiciones especiales
  if (settings.bonuses.special.enabled) {
    const specialBonus = await calculateSpecialBonuses(params, settings);
    totalBonus += specialBonus.amount;
    if (specialBonus.amount > 0 && !bonusType) bonusType = specialBonus.type || 'special';
  }

  return {
    amount: totalBonus,
    type: bonusType
  };
}

async function calculateVolumeBonus(deliveryId: string, settings: any): Promise<number> {
  if (!deliveryId) return 0;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Contar entregas del día
    const todayDeliveries = await DeliveryTransaction.countDocuments({
      deliveryId,
      type: 'delivery_payment',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Contar entregas de la semana
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekDeliveries = await DeliveryTransaction.countDocuments({
      deliveryId,
      type: 'delivery_payment',
      createdAt: { $gte: weekStart, $lt: weekEnd }
    });

    let bonus = 0;

    // Bono diario
    if (todayDeliveries >= settings.bonuses.volume.dailyTarget) {
      bonus += settings.bonuses.volume.dailyBonus;
    }

    // Bono semanal
    if (weekDeliveries >= settings.bonuses.volume.weeklyTarget) {
      bonus += settings.bonuses.volume.weeklyBonus;
    }

    return bonus;

  } catch (error) {
    console.error('Error calculating volume bonus:', error);
    return 0;
  }
}

async function calculateSpecialBonuses(params: BonusCalculationParams, settings: any): Promise<BonusResult> {
  const { orderValue, distance, weatherCondition, peakHours } = params;
  
  for (const condition of settings.bonuses.special.conditions) {
    // Evaluar condiciones especiales
    if (condition.name === 'high_value_order' && orderValue >= 100) {
      return { amount: condition.bonusAmount, type: 'special' };
    }
    
    if (condition.name === 'long_distance' && distance >= 15) {
      return { amount: condition.bonusAmount, type: 'special' };
    }
    
    if (condition.name === 'bad_weather' && weatherCondition !== 'normal') {
      return { amount: condition.bonusAmount, type: 'special' };
    }
    
    if (condition.name === 'peak_hours' && peakHours) {
      return { amount: condition.bonusAmount, type: 'special' };
    }
  }

  return { amount: 0, type: '' };
}

function estimateDeliveryTime(distance: number, zone: string, peakHours: boolean, weatherCondition: string): number {
  // Tiempo base: 2 minutos por km
  let baseTime = distance * 2;
  
  // Ajustes por zona
  const zoneMultipliers: { [key: string]: number } = {
    'centro': 1.0,
    'norte': 1.2,
    'sur': 1.1,
    'este': 1.3,
    'oeste': 1.1
  };
  
  baseTime *= zoneMultipliers[zone] || 1.0;
  
  // Ajustes por hora pico
  if (peakHours) {
    baseTime *= 1.5;
  }
  
  // Ajustes por clima
  const weatherMultipliers: { [key: string]: number } = {
    'normal': 1.0,
    'rain': 1.3,
    'storm': 1.6,
    'extreme': 2.0
  };
  
  baseTime *= weatherMultipliers[weatherCondition] || 1.0;
  
  // Tiempo mínimo de 15 minutos
  return Math.max(15, Math.round(baseTime));
}

export async function processDeliveryPayment(deliveryOrder: any): Promise<void> {
  try {
    const deliveryId = deliveryOrder.deliveryId;
    const paymentInfo = deliveryOrder.paymentInfo;

    // Crear transacción de pago
    const transaction = new DeliveryTransaction({
      deliveryId,
      walletId: deliveryId, // Asumiendo que walletId = deliveryId
      orderId: deliveryOrder.orderId,
      type: 'delivery_payment',
      amount: paymentInfo.totalPayment,
      description: `Pago por entrega - Pedido ${deliveryOrder.orderId}`,
      status: 'completed',
      processedAt: new Date(),
      metadata: {
        deliveryFee: paymentInfo.deliveryFee,
        bonusAmount: paymentInfo.bonusAmount,
        distance: deliveryOrder.performance.distance,
        deliveryTime: deliveryOrder.performance.actualTime,
        rating: deliveryOrder.performance.rating,
        zone: deliveryOrder.metadata.zone,
        peakHours: deliveryOrder.metadata.peakHours,
        weatherCondition: deliveryOrder.metadata.weatherCondition,
        orderValue: deliveryOrder.orderDetails.totalValue,
        commissionDeduction: paymentInfo.commissionDeduction
      }
    });

    await transaction.save();

    // Actualizar wallet
    await DeliveryWallet.findOneAndUpdate(
      { deliveryId },
      {
        $inc: {
          currentBalance: paymentInfo.totalPayment,
          totalEarned: paymentInfo.totalPayment
        }
      }
    );

    // Actualizar estadísticas del delivery
    await updateDeliveryPerformance(deliveryId, deliveryOrder);

    // Log de la transacción
    await DeliveryLog.create({
      deliveryId,
      orderId: deliveryOrder.orderId,
      action: 'payment_processed',
      description: `Pago procesado: $${paymentInfo.totalPayment}`,
      level: 'info',
      category: 'payment',
      metadata: {
        amount: paymentInfo.totalPayment,
        bonusAmount: paymentInfo.bonusAmount,
        transactionId: transaction._id
      }
    });

  } catch (error) {
    console.error('Error processing delivery payment:', error);
    throw error;
  }
}

async function updateDeliveryPerformance(deliveryId: string, deliveryOrder: any): Promise<void> {
  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return;

    const newTotalDeliveries = delivery.performance.totalDeliveries + 1;
    const newCompletedDeliveries = delivery.performance.completedDeliveries + 1;
    const newOnTimeDeliveries = delivery.performance.onTimeDeliveries + 
      (deliveryOrder.performance.onTime ? 1 : 0);
    
    const newAverageDeliveryTime = 
      (delivery.performance.averageDeliveryTime * delivery.performance.completedDeliveries + 
       deliveryOrder.performance.actualTime) / newCompletedDeliveries;

    const newRating = deliveryOrder.performance.rating ? 
      (delivery.performance.rating * delivery.performance.completedDeliveries + 
       deliveryOrder.performance.rating) / newCompletedDeliveries : 
      delivery.performance.rating;

    await Delivery.findByIdAndUpdate(deliveryId, {
      'performance.totalDeliveries': newTotalDeliveries,
      'performance.completedDeliveries': newCompletedDeliveries,
      'performance.onTimeDeliveries': newOnTimeDeliveries,
      'performance.averageDeliveryTime': newAverageDeliveryTime,
      'performance.rating': newRating,
      'performance.totalEarnings': delivery.performance.totalEarnings + deliveryOrder.paymentInfo.totalPayment,
      'performance.lastActiveDate': new Date()
    });

  } catch (error) {
    console.error('Error updating delivery performance:', error);
  }
}
