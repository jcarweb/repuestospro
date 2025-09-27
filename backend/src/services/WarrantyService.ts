import Warranty, { IWarranty } from '../models/Warranty';
import SecureTransaction, { ISecureTransaction } from '../models/SecureTransaction';
import Claim, { IClaim } from '../models/Claim';
import User from '../models/User';
import Store from '../models/Store';

export interface WarrantyCreationData {
  type: 'purchase_protection' | 'return_guarantee' | 'claim_protection';
  userId: string;
  storeId: string;
  transactionId?: string;
  productId?: string;
  transactionAmount: number;
  protectionLevel?: 'basic' | 'premium' | 'extended';
  isIncluded?: boolean;
  description?: string;
  createdBy: string;
}

export interface WarrantyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  coverageAmount: number;
  cost: number;
  terms: any;
}

export class WarrantyService {
  
  /**
   * Crear una nueva garantía para una transacción
   */
  static async createWarranty(data: WarrantyCreationData): Promise<IWarranty> {
    try {
      // Validar datos de entrada
      const validation = await this.validateWarrantyCreation(data);
      if (!validation.isValid) {
        throw new Error(`Validación fallida: ${validation.errors.join(', ')}`);
      }

      // Calcular cobertura y costo
      const coverage = this.calculateCoverage(data.transactionAmount, data.protectionLevel || 'basic');
      const cost = this.calculateCost(data.transactionAmount, data.protectionLevel || 'basic', data.isIncluded || false);

      // Determinar fechas
      const now = new Date();
      const duration = this.getWarrantyDuration(data.type, data.protectionLevel || 'basic');
      const expirationDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      // Crear la garantía
      const warranty = new Warranty({
        type: data.type,
        status: 'pending',
        userId: data.userId,
        storeId: data.storeId,
        transactionId: data.transactionId,
        productId: data.productId,
        
        // Cobertura y términos
        coverageAmount: coverage.amount,
        coveragePercentage: coverage.percentage,
        maxCoverageAmount: coverage.maxAmount,
        
        // Fechas
        activationDate: now,
        expirationDate: expirationDate,
        
        // Términos específicos
        terms: this.getWarrantyTerms(data.type, data.protectionLevel || 'basic'),
        
        // Costo
        cost: cost,
        isIncluded: data.isIncluded || false,
        billingCycle: 'one_time',
        
        // Metadatos
        description: data.description || this.getDefaultDescription(data.type, data.protectionLevel || 'basic'),
        createdBy: data.createdBy
      });

      const savedWarranty = await warranty.save();

      // Si hay transactionId, crear SecureTransaction
      if (data.transactionId) {
        await this.createSecureTransaction(data.transactionId, savedWarranty._id, data);
      }

      return savedWarranty;
    } catch (error) {
      throw new Error(`Error al crear garantía: ${(error as Error).message}`);
    }
  }

  /**
   * Validar si se puede crear una garantía
   */
  static async validateWarrantyCreation(data: WarrantyCreationData): Promise<WarrantyValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar usuario
    const user = await User.findById(data.userId);
    if (!user) {
      errors.push('Usuario no encontrado');
    }

    // Validar tienda
    const store = await Store.findById(data.storeId);
    if (!store) {
      errors.push('Tienda no encontrada');
    }

    // Validar monto de transacción
    if (data.transactionAmount <= 0) {
      errors.push('Monto de transacción debe ser mayor a 0');
    }

    // Validar límites de cobertura
    const maxAllowedAmount = this.getMaxCoverageAmount(data.protectionLevel || 'basic');
    if (data.transactionAmount > maxAllowedAmount) {
      warnings.push(`Monto excede el límite máximo de cobertura ($${maxAllowedAmount})`);
    }

    // Verificar si ya existe una garantía para esta transacción
    if (data.transactionId) {
      const existingWarranty = await Warranty.findOne({ 
        transactionId: data.transactionId,
        status: { $in: ['active', 'pending'] }
      });
      if (existingWarranty) {
        errors.push('Ya existe una garantía activa para esta transacción');
      }
    }

    // Calcular cobertura y costo
    const coverage = this.calculateCoverage(data.transactionAmount, data.protectionLevel || 'basic');
    const cost = this.calculateCost(data.transactionAmount, data.protectionLevel || 'basic', data.isIncluded || false);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      coverageAmount: coverage.amount,
      cost: cost,
      terms: this.getWarrantyTerms(data.type, data.protectionLevel || 'basic')
    };
  }

  /**
   * Activar una garantía pendiente
   */
  static async activateWarranty(warrantyId: string): Promise<IWarranty> {
    const warranty = await Warranty.findById(warrantyId);
    if (!warranty) {
      throw new Error('Garantía no encontrada');
    }

    if (warranty.status !== 'pending') {
      throw new Error('La garantía no está en estado pendiente');
    }

    warranty.status = 'active';
    warranty.activationDate = new Date();
    
    return await warranty.save();
  }

  /**
   * Extender una garantía activa
   */
  static async extendWarranty(warrantyId: string, extensionDays: number): Promise<IWarranty> {
    const warranty = await Warranty.findById(warrantyId);
    if (!warranty) {
      throw new Error('Garantía no encontrada');
    }

    if (warranty.status !== 'active') {
      throw new Error('Solo se pueden extender garantías activas');
    }

    const newExpirationDate = new Date(warranty.expirationDate.getTime() + extensionDays * 24 * 60 * 60 * 1000);
    warranty.expirationDate = newExpirationDate;
    warranty.lastRenewalDate = new Date();

    return await warranty.save();
  }

  /**
   * Obtener garantías de un usuario
   */
  static async getUserWarranties(userId: string, status?: string): Promise<IWarranty[]> {
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    return await Warranty.find(filter)
      .populate('storeId', 'name logo')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener garantías de una tienda
   */
  static async getStoreWarranties(storeId: string, status?: string): Promise<IWarranty[]> {
    const filter: any = { storeId };
    if (status) {
      filter.status = status;
    }

    return await Warranty.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });
  }

  /**
   * Verificar elegibilidad para reclamo
   */
  static async checkClaimEligibility(warrantyId: string, claimType: string): Promise<boolean> {
    const warranty = await Warranty.findById(warrantyId);
    if (!warranty || warranty.status !== 'active') {
      return false;
    }

    // Verificar si la garantía cubre este tipo de reclamo
    const terms = warranty.terms;
    switch (claimType) {
      case 'defective_product':
        return terms.coversDefectiveProducts;
      case 'non_delivery':
        return terms.coversNonDelivery;
      case 'not_as_described':
        return terms.coversNotAsDescribed;
      case 'late_delivery':
        return terms.coversLateDelivery;
      default:
        return false;
    }
  }

  /**
   * Crear transacción segura
   */
  private static async createSecureTransaction(
    transactionId: string, 
    warrantyId: string, 
    data: WarrantyCreationData
  ): Promise<ISecureTransaction> {
    const now = new Date();
    const duration = this.getWarrantyDuration(data.type, data.protectionLevel || 'basic');
    const protectionEndDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    const secureTransaction = new SecureTransaction({
      transactionId: transactionId,
      userId: data.userId,
      storeId: data.storeId,
      productId: data.productId,
      
      protectionStatus: 'protected',
      protectionLevel: data.protectionLevel || 'basic',
      
      transactionAmount: data.transactionAmount,
      protectionCost: this.calculateCost(data.transactionAmount, data.protectionLevel || 'basic', data.isIncluded || false),
      totalAmount: data.transactionAmount + this.calculateCost(data.transactionAmount, data.protectionLevel || 'basic', data.isIncluded || false),
      paymentMethod: 'platform',
      paymentStatus: 'completed',
      
      warranties: [warrantyId],
      activeWarrantyCount: 1,
      
      purchaseDate: now,
      protectionStartDate: now,
      protectionEndDate: protectionEndDate,
      lastActivityDate: now,
      
      events: [{
        type: 'protection_activated',
        description: 'Protección de compra activada automáticamente',
        timestamp: now
      }],
      
      riskScore: 0,
      riskFactors: [],
      monitoringEnabled: true,
      
      createdBy: data.createdBy
    });

    return await secureTransaction.save();
  }

  /**
   * Calcular cobertura basada en monto y nivel
   */
  private static calculateCoverage(amount: number, level: string): { amount: number; percentage: number; maxAmount: number } {
    const percentages = {
      basic: 100,
      premium: 100,
      extended: 100
    };

    const maxAmounts = {
      basic: 1000,
      premium: 5000,
      extended: 10000
    };

    const percentage = percentages[level as keyof typeof percentages] || 100;
    const maxAmount = maxAmounts[level as keyof typeof maxAmounts] || 1000;
    const coverageAmount = Math.min(amount * (percentage / 100), maxAmount);

    return {
      amount: coverageAmount,
      percentage: percentage,
      maxAmount: maxAmount
    };
  }

  /**
   * Calcular costo de la garantía
   */
  private static calculateCost(amount: number, level: string, isIncluded: boolean): number {
    if (isIncluded) return 0;

    const rates = {
      basic: 0.05, // 5%
      premium: 0.08, // 8%
      extended: 0.12 // 12%
    };

    const rate = rates[level as keyof typeof rates] || 0.05;
    return Math.round(amount * rate * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtener duración de garantía en días
   */
  private static getWarrantyDuration(type: string, level: string): number {
    const durations = {
      purchase_protection: {
        basic: 30,
        premium: 60,
        extended: 90
      },
      return_guarantee: {
        basic: 15,
        premium: 30,
        extended: 45
      },
      claim_protection: {
        basic: 90,
        premium: 180,
        extended: 365
      }
    };

    return durations[type as keyof typeof durations]?.[level as keyof typeof durations[keyof typeof durations]] || 30;
  }

  /**
   * Obtener términos de garantía
   */
  private static getWarrantyTerms(type: string, level: string): any {
    const baseTerms = {
      coversDefectiveProducts: true,
      coversNonDelivery: true,
      coversNotAsDescribed: true,
      coversLateDelivery: false,
      returnWindowDays: 30,
      claimWindowDays: 90
    };

    // Ajustar términos según nivel
    if (level === 'premium') {
      baseTerms.coversLateDelivery = true;
      baseTerms.returnWindowDays = 45;
      baseTerms.claimWindowDays = 120;
    } else if (level === 'extended') {
      baseTerms.coversLateDelivery = true;
      baseTerms.returnWindowDays = 60;
      baseTerms.claimWindowDays = 180;
    }

    return baseTerms;
  }

  /**
   * Obtener monto máximo de cobertura
   */
  private static getMaxCoverageAmount(level: string): number {
    const maxAmounts = {
      basic: 1000,
      premium: 5000,
      extended: 10000
    };

    return maxAmounts[level as keyof typeof maxAmounts] || 1000;
  }

  /**
   * Obtener descripción por defecto
   */
  private static getDefaultDescription(type: string, level: string): string {
    const descriptions = {
      purchase_protection: `Protección de compra ${level} - Cobertura completa para problemas con tu compra`,
      return_guarantee: `Garantía de devolución ${level} - Flexibilidad para devolver productos`,
      claim_protection: `Protección de reclamos ${level} - Soporte completo para disputas`
    };

    return descriptions[type as keyof typeof descriptions] || 'Garantía de compra';
  }

  /**
   * Procesar expiración automática de garantías
   */
  static async processExpiredWarranties(): Promise<number> {
    const now = new Date();
    const expiredWarranties = await Warranty.find({
      status: 'active',
      expirationDate: { $lte: now }
    });

    let processedCount = 0;
    for (const warranty of expiredWarranties) {
      warranty.status = 'expired';
      await warranty.save();
      processedCount++;
    }

    return processedCount;
  }

  /**
   * Obtener estadísticas de garantías
   */
  static async getWarrantyStats(userId?: string, storeId?: string): Promise<any> {
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (storeId) filter.storeId = storeId;

    const stats = await Warranty.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    return stats;
  }
}
