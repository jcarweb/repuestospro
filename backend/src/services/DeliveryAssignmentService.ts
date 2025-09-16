import mongoose from 'mongoose';
import Delivery, { IDelivery } from '../models/Delivery';
import Rider, { IRider } from '../models/Rider';
import Order from '../models/Order';
import Store from '../models/Store';

export interface AssignmentConfig {
  priority: 'internal_first' | 'external_first' | 'mixed';
  internalPercentage: number; // 0-100
  maxWaitTime: number; // minutos
  maxDistance: number; // km
  forceInternal?: boolean;
  forceExternal?: boolean;
}

export interface RiderCandidate {
  rider: IRider;
  distance: number;
  estimatedTime: number; // minutos
  rating: number;
  availability: number; // 0-100
  cost: number;
  score: number;
}

export class DeliveryAssignmentService {
  
  /**
   * Asigna un delivery a un rider disponible
   */
  static async assignDelivery(
    deliveryId: string, 
    config: AssignmentConfig
  ): Promise<{ success: boolean; rider?: IRider; message: string }> {
    try {
      const delivery = await Delivery.findById(deliveryId)
        .populate('orderId')
        .populate('storeId');
      
      if (!delivery) {
        return { success: false, message: 'Delivery no encontrado' };
      }

      // Determinar el tipo de asignación basado en la configuración
      const assignmentType = this.determineAssignmentType(config);
      
      let selectedRider: IRider | null = null;
      let assignmentMessage = '';

      switch (assignmentType) {
        case 'internal_only':
          selectedRider = await this.findBestInternalRider(delivery, config);
          assignmentMessage = selectedRider 
            ? `Asignado a rider interno: ${selectedRider.firstName} ${selectedRider.lastName}`
            : 'No hay riders internos disponibles';
          break;

        case 'external_only':
          selectedRider = await this.findBestExternalRider(delivery, config);
          assignmentMessage = selectedRider 
            ? `Asignado a rider externo: ${selectedRider.firstName} ${selectedRider.lastName}`
            : 'No hay riders externos disponibles';
          break;

        case 'internal_first':
          selectedRider = await this.findBestInternalRider(delivery, config);
          if (!selectedRider) {
            selectedRider = await this.findBestExternalRider(delivery, config);
            assignmentMessage = selectedRider 
              ? `Rider interno no disponible. Asignado a rider externo: ${selectedRider.firstName} ${selectedRider.lastName}`
              : 'No hay riders disponibles (internos ni externos)';
          } else {
            assignmentMessage = `Asignado a rider interno: ${selectedRider.firstName} ${selectedRider.lastName}`;
          }
          break;

        case 'external_first':
          selectedRider = await this.findBestExternalRider(delivery, config);
          if (!selectedRider) {
            selectedRider = await this.findBestInternalRider(delivery, config);
            assignmentMessage = selectedRider 
              ? `Rider externo no disponible. Asignado a rider interno: ${selectedRider.firstName} ${selectedRider.lastName}`
              : 'No hay riders disponibles (externos ni internos)';
          } else {
            assignmentMessage = `Asignado a rider externo: ${selectedRider.firstName} ${selectedRider.lastName}`;
          }
          break;

        case 'mixed':
          selectedRider = await this.findBestMixedRider(delivery, config);
          assignmentMessage = selectedRider 
            ? `Asignado a rider ${selectedRider.type}: ${selectedRider.firstName} ${selectedRider.lastName}`
            : 'No hay riders disponibles';
          break;
      }

      if (!selectedRider) {
        return { success: false, message: assignmentMessage };
      }

      // Actualizar el delivery con el rider asignado
      await this.updateDeliveryAssignment(delivery, selectedRider);

      return { 
        success: true, 
        rider: selectedRider, 
        message: assignmentMessage 
      };

    } catch (error) {
      console.error('Error en asignación de delivery:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }

  /**
   * Determina el tipo de asignación basado en la configuración
   */
  private static determineAssignmentType(config: AssignmentConfig): string {
    if (config.forceInternal) return 'internal_only';
    if (config.forceExternal) return 'external_only';
    
    switch (config.priority) {
      case 'internal_first':
        return 'internal_first';
      case 'external_first':
        return 'external_first';
      case 'mixed':
        return 'mixed';
      default:
        return 'internal_first';
    }
  }

  /**
   * Encuentra el mejor rider interno disponible
   */
  private static async findBestInternalRider(
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<IRider | null> {
    const candidates = await this.getInternalRiderCandidates(delivery, config);
    
    if (candidates.length === 0) {
      return null;
    }

    // Ordenar por score (mayor a menor)
    candidates.sort((a, b) => b.score - a.score);
    
    return candidates[0].rider;
  }

  /**
   * Encuentra el mejor rider externo disponible
   */
  private static async findBestExternalRider(
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<IRider | null> {
    const candidates = await this.getExternalRiderCandidates(delivery, config);
    
    if (candidates.length === 0) {
      return null;
    }

    // Ordenar por score (mayor a menor)
    candidates.sort((a, b) => b.score - a.score);
    
    return candidates[0].rider;
  }

  /**
   * Encuentra el mejor rider (interno o externo) en asignación mixta
   */
  private static async findBestMixedRider(
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<IRider | null> {
    const internalCandidates = await this.getInternalRiderCandidates(delivery, config);
    const externalCandidates = await this.getExternalRiderCandidates(delivery, config);
    
    const allCandidates = [...internalCandidates, ...externalCandidates];
    
    if (allCandidates.length === 0) {
      return null;
    }

    // Aplicar porcentaje de preferencia interna
    const internalCount = Math.floor(allCandidates.length * (config.internalPercentage / 100));
    const internalCandidatesInTop = internalCandidates.slice(0, internalCount);
    const externalCandidatesInTop = externalCandidates.slice(0, allCandidates.length - internalCount);
    
    const topCandidates = [...internalCandidatesInTop, ...externalCandidatesInTop];
    topCandidates.sort((a, b) => b.score - a.score);
    
    return topCandidates[0].rider;
  }

  /**
   * Obtiene candidatos de riders internos
   */
  private static async getInternalRiderCandidates(
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<RiderCandidate[]> {
    const riders = await Rider.find({
      type: 'internal',
      status: 'active',
      'availability.isOnline': true,
      'availability.isAvailable': true
    });

    const candidates: RiderCandidate[] = [];

    for (const rider of riders) {
      const candidate = await this.evaluateRiderCandidate(rider, delivery, config);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  /**
   * Obtiene candidatos de riders externos
   */
  private static async getExternalRiderCandidates(
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<RiderCandidate[]> {
    const riders = await Rider.find({
      type: 'external',
      status: 'active',
      'availability.isOnline': true,
      'availability.isAvailable': true
    });

    const candidates: RiderCandidate[] = [];

    for (const rider of riders) {
      const candidate = await this.evaluateRiderCandidate(rider, delivery, config);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  /**
   * Evalúa un candidato de rider
   */
  private static async evaluateRiderCandidate(
    rider: IRider, 
    delivery: IDelivery, 
    config: AssignmentConfig
  ): Promise<RiderCandidate | null> {
    // Verificar distancia
    const distance = (rider as any).calculateDistanceFrom(
      delivery.pickupLocation.coordinates.lat,
      delivery.pickupLocation.coordinates.lng
    );

    if (distance > config.maxDistance) {
      return null;
    }

    // Verificar si está en zona de servicio
    if (!(rider as any).isInServiceArea(
      delivery.pickupLocation.coordinates.lat,
      delivery.pickupLocation.coordinates.lng
    )) {
      return null;
    }

    // Verificar límite de órdenes concurrentes
    const currentDeliveries = await Delivery.countDocuments({
      riderId: rider._id,
      status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] }
    });

    if (currentDeliveries >= rider.appSettings.maxConcurrentOrders) {
      return null;
    }

    // Calcular tiempo estimado (distancia * 2 minutos por km + 5 minutos base)
    const estimatedTime = Math.round(distance * 2 + 5);

    // Calcular disponibilidad (basado en calificación y historial)
    const availability = this.calculateAvailabilityScore(rider);

    // Calcular costo (comisión del rider)
    const cost = (rider as any).calculateCommission(delivery.deliveryFee);

    // Calcular score final
    const score = this.calculateRiderScore({
      distance,
      estimatedTime,
      rating: rider.rating.average,
      availability,
      cost,
      type: rider.type
    });

    return {
      rider,
      distance,
      estimatedTime,
      rating: rider.rating.average,
      availability,
      cost,
      score
    };
  }

  /**
   * Calcula el score de disponibilidad del rider
   */
  private static calculateAvailabilityScore(rider: IRider): number {
    let score = 100;

    // Reducir score por entregas tardías
    if (rider.stats.lateDeliveries > 0) {
      const lateRate = rider.stats.lateDeliveries / rider.stats.totalDeliveries;
      score -= lateRate * 30; // Máximo 30 puntos de penalización
    }

    // Reducir score por cancelaciones
    if (rider.stats.cancelledDeliveries > 0) {
      const cancelRate = rider.stats.cancelledDeliveries / rider.stats.totalDeliveries;
      score -= cancelRate * 50; // Máximo 50 puntos de penalización
    }

    // Bonus por buen rendimiento
    if (rider.stats.onTimeDeliveries > 0) {
      const onTimeRate = rider.stats.onTimeDeliveries / rider.stats.totalDeliveries;
      score += onTimeRate * 20; // Máximo 20 puntos de bonus
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcula el score final del rider
   */
  private static calculateRiderScore(params: {
    distance: number;
    estimatedTime: number;
    rating: number;
    availability: number;
    cost: number;
    type: string;
  }): number {
    const { distance, estimatedTime, rating, availability, cost, type } = params;

    // Peso de cada factor
    const weights = {
      distance: 0.25,
      time: 0.20,
      rating: 0.25,
      availability: 0.20,
      cost: 0.10
    };

    // Normalizar valores (0-100)
    const normalizedDistance = Math.max(0, 100 - (distance / 10) * 100); // 10km = 0 puntos
    const normalizedTime = Math.max(0, 100 - (estimatedTime / 30) * 100); // 30 min = 0 puntos
    const normalizedRating = rating * 20; // 5 estrellas = 100 puntos
    const normalizedCost = Math.max(0, 100 - (cost / 10) * 100); // $10 = 0 puntos

    // Calcular score ponderado
    let score = 
      normalizedDistance * weights.distance +
      normalizedTime * weights.time +
      normalizedRating * weights.rating +
      availability * weights.availability +
      normalizedCost * weights.cost;

    // Bonus para riders internos (preferencia)
    if (type === 'internal') {
      score *= 1.1; // 10% de bonus
    }

    return score;
  }

  /**
   * Actualiza el delivery con la asignación del rider
   */
  private static async updateDeliveryAssignment(
    delivery: IDelivery, 
    rider: IRider
  ): Promise<void> {
    delivery.riderId = rider._id as mongoose.Types.ObjectId;
    delivery.riderType = rider.type;
    delivery.riderName = `${rider.firstName} ${rider.lastName}`;
    delivery.riderPhone = rider.phone;
    delivery.status = 'assigned';

    if (rider.vehicle) {
      delivery.riderVehicle = {
        type: rider.vehicle.type,
        plate: rider.vehicle.plate,
        model: rider.vehicle.model
      };
    }

    // Generar código de tracking si no existe
    if (!delivery.trackingCode) {
      delivery.trackingCode = (delivery as any).generateTrackingCode();
    }

    // Generar URL de tracking
    delivery.trackingUrl = `${process.env.FRONTEND_URL}/tracking/${delivery.trackingCode}`;

    // Agregar al historial
    delivery.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: `Asignado a ${rider.firstName} ${rider.lastName} (${rider.type})`,
      updatedBy: 'system'
    });

    await delivery.save();

    // Actualizar estadísticas del rider
    await this.updateRiderStats(rider._id.toString());
  }

  /**
   * Actualiza estadísticas del rider
   */
  private static async updateRiderStats(riderId: string): Promise<void> {
    const deliveries = await Delivery.find({ riderId });
    
    const stats = {
      totalDeliveries: deliveries.length,
      completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
      cancelledDeliveries: deliveries.filter(d => d.status === 'cancelled').length,
      totalEarnings: deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + d.riderPayment, 0),
      totalDistance: deliveries
        .filter(d => d.status === 'delivered')
        .reduce((sum, d) => sum + ((d as any).calculateDistance(
          d.pickupLocation.coordinates.lat,
          d.pickupLocation.coordinates.lng,
          d.deliveryLocation.coordinates.lat,
          d.deliveryLocation.coordinates.lng
        )), 0),
      onTimeDeliveries: 0, // Se calcula basado en tiempos estimados vs reales
      lateDeliveries: 0,
      averageDeliveryTime: 0
    };

    // Calcular entregas a tiempo vs tardías
    for (const delivery of deliveries.filter(d => d.status === 'delivered')) {
      if (delivery.estimatedDeliveryTime && delivery.actualDeliveryTime) {
        const estimated = new Date(delivery.estimatedDeliveryTime);
        const actual = new Date(delivery.actualDeliveryTime);
        
        if (actual <= estimated) {
          stats.onTimeDeliveries++;
        } else {
          stats.lateDeliveries++;
        }
      }
    }

    // Calcular tiempo promedio de entrega
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
    if (completedDeliveries.length > 0) {
      let totalTime = 0;
      for (const delivery of completedDeliveries) {
        if (delivery.actualPickupTime && delivery.actualDeliveryTime) {
          const pickup = new Date(delivery.actualPickupTime);
          const delivery_time = new Date(delivery.actualDeliveryTime);
          totalTime += (delivery_time.getTime() - pickup.getTime()) / (1000 * 60); // minutos
        }
      }
      (stats as any).averageDeliveryTime = totalTime / completedDeliveries.length;
    }

    await Rider.findByIdAndUpdate(riderId, { stats });
  }

  /**
   * Busca riders disponibles en tiempo real
   */
  static async findAvailableRiders(
    lat: number, 
    lng: number, 
    maxDistance: number = 10
  ): Promise<IRider[]> {
    const riders = await Rider.find({
      status: 'active',
      'availability.isOnline': true,
      'availability.isAvailable': true
    });

    const availableRiders: IRider[] = [];

    for (const rider of riders) {
      const distance = (rider as any).calculateDistanceFrom(lat, lng);
      if (distance <= maxDistance && (rider as any).isInServiceArea(lat, lng)) {
        availableRiders.push(rider);
      }
    }

    return availableRiders.sort((a, b) => {
      const distanceA = (a as any).calculateDistanceFrom(lat, lng);
      const distanceB = (b as any).calculateDistanceFrom(lat, lng);
      return distanceA - distanceB;
    });
  }

  /**
   * Reasigna un delivery a otro rider
   */
  static async reassignDelivery(
    deliveryId: string, 
    newRiderId: string, 
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const delivery = await Delivery.findById(deliveryId);
      const newRider = await Rider.findById(newRiderId);

      if (!delivery || !newRider) {
        return { success: false, message: 'Delivery o rider no encontrado' };
      }

      // Actualizar asignación
      delivery.riderId = newRider._id as mongoose.Types.ObjectId;
      delivery.riderType = newRider.type;
      delivery.riderName = `${newRider.firstName} ${newRider.lastName}`;
      delivery.riderPhone = newRider.phone;
      delivery.status = 'assigned';

      // Agregar al historial
      delivery.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(),
        notes: `Reasignado a ${newRider.firstName} ${newRider.lastName}. Razón: ${reason}`,
        updatedBy: 'system'
      });

      await delivery.save();

      return { 
        success: true, 
        message: `Delivery reasignado a ${newRider.firstName} ${newRider.lastName}` 
      };

    } catch (error) {
      console.error('Error en reasignación:', error);
      return { success: false, message: 'Error interno del servidor' };
    }
  }
}

export default DeliveryAssignmentService;
