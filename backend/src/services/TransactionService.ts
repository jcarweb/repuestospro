import Transaction, { ITransaction } from '../models/Transaction';
import { WarrantyService } from './WarrantyService';
import { ContentFilterService } from '../middleware/contentFilter';

export interface TransactionCreationData {
  userId: string;
  storeId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    warrantyIncluded?: boolean;
    warrantyType?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  warrantyEnabled?: boolean;
  warrantyLevel?: 'basic' | 'premium' | 'extended' | 'none';
  notes?: string;
  createdBy: string;
}

export interface TransactionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculatedAmounts: {
    subtotal: number;
    taxAmount: number;
    commissionAmount: number;
    warrantyTotal: number;
    totalAmount: number;
  };
}

export class TransactionService {
  
  /**
   * Crear una nueva transacción con integración de garantías
   */
  static async createTransaction(data: TransactionCreationData): Promise<ITransaction> {
    try {
      // Validar datos de entrada
      const validation = await this.validateTransactionCreation(data);
      if (!validation.isValid) {
        throw new Error(`Validación fallida: ${validation.errors.join(', ')}`);
      }

      // Calcular montos
      const { subtotal, taxAmount, commissionAmount, warrantyTotal, totalAmount } = validation.calculatedAmounts;

      // Crear la transacción
      const transaction = new Transaction({
        userId: data.userId,
        storeId: data.storeId,
        
        // Información de productos
        items: data.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          warrantyIncluded: item.warrantyIncluded || false,
          warrantyType: item.warrantyType || 'none',
          warrantyCost: item.warrantyIncluded && item.warrantyType ? 
            this.calculateWarrantyCost(item.quantity * item.unitPrice, item.warrantyType) : 0
        })),
        
        // Información financiera
        subtotal,
        taxAmount,
        commissionAmount,
        warrantyTotal,
        totalAmount,
        currency: 'USD',
        
        // Estado de la transacción
        status: 'pending',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        
        // Información de envío
        shippingAddress: data.shippingAddress,
        
        // Información de garantía
        warrantyEnabled: data.warrantyEnabled || false,
        warrantyLevel: data.warrantyLevel || 'none',
        warrantyCoverage: data.warrantyEnabled ? this.calculateWarrantyCoverage(subtotal, data.warrantyLevel || 'basic') : 0,
        
        // Metadatos
        notes: data.notes,
        createdBy: data.createdBy
      });

      const savedTransaction = await transaction.save();

      // Si la garantía está habilitada, crear garantías automáticamente
      if (data.warrantyEnabled && data.warrantyLevel && data.warrantyLevel !== 'none') {
        await this.createWarrantiesForTransaction(savedTransaction, data.warrantyLevel);
      }

      return savedTransaction;

    } catch (error) {
      console.error('Error al crear transacción:', error);
      throw error;
    }
  }

  /**
   * Validar datos de creación de transacción
   */
  static async validateTransactionCreation(data: TransactionCreationData): Promise<TransactionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones básicas
    if (!data.userId) errors.push('ID de usuario requerido');
    if (!data.storeId) errors.push('ID de tienda requerido');
    if (!data.items || data.items.length === 0) errors.push('Al menos un producto requerido');
    if (!data.paymentMethod) errors.push('Método de pago requerido');

    // Validar dirección de envío
    if (!data.shippingAddress.street) errors.push('Dirección de calle requerida');
    if (!data.shippingAddress.city) errors.push('Ciudad requerida');
    if (!data.shippingAddress.state) errors.push('Estado requerido');
    if (!data.shippingAddress.zipCode) errors.push('Código postal requerido');
    if (!data.shippingAddress.country) errors.push('País requerido');

    // Validar productos
    let subtotal = 0;
    for (const item of data.items) {
      if (!item.productId) errors.push('ID de producto requerido para todos los items');
      if (!item.productName) errors.push('Nombre de producto requerido para todos los items');
      if (item.quantity <= 0) errors.push('Cantidad debe ser mayor a 0');
      if (item.unitPrice <= 0) errors.push('Precio unitario debe ser mayor a 0');
      
      subtotal += item.quantity * item.unitPrice;
    }

    // Calcular montos
    const taxAmount = this.calculateTaxAmount(subtotal);
    const commissionAmount = this.calculateCommissionAmount(subtotal);
    const warrantyTotal = data.warrantyEnabled && data.warrantyLevel && data.warrantyLevel !== 'none' ? 
      this.calculateWarrantyTotal(subtotal, data.warrantyLevel) : 0;
    const totalAmount = subtotal + taxAmount + commissionAmount + warrantyTotal;

    // Validar montos
    if (totalAmount <= 0) errors.push('Monto total debe ser mayor a 0');
    if (totalAmount > 10000) warnings.push('Transacción de alto valor detectada');

    // Validar garantía
    if (data.warrantyEnabled && (!data.warrantyLevel || data.warrantyLevel === 'none')) {
      warnings.push('Garantía habilitada pero nivel no especificado');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      calculatedAmounts: {
        subtotal,
        taxAmount,
        commissionAmount,
        warrantyTotal,
        totalAmount
      }
    };
  }

  /**
   * Crear garantías para una transacción
   */
  private static async createWarrantiesForTransaction(transaction: ITransaction, warrantyLevel: string): Promise<void> {
    try {
      for (const item of transaction.items) {
        if (item.warrantyIncluded && item.warrantyType && item.warrantyType !== 'none') {
          await WarrantyService.createWarranty({
            type: 'purchase_protection',
            userId: transaction.userId.toString(),
            storeId: transaction.storeId.toString(),
            transactionId: transaction._id.toString(),
            productId: item.productId.toString(),
            transactionAmount: item.totalPrice,
            protectionLevel: item.warrantyType as 'basic' | 'premium' | 'extended',
            isIncluded: true,
            description: `Garantía de compra para ${item.productName}`,
            createdBy: transaction.createdBy.toString()
          });
        }
      }
    } catch (error) {
      console.error('Error al crear garantías para transacción:', error);
      // No lanzar error para no afectar la transacción principal
    }
  }

  /**
   * Obtener transacciones del usuario
   */
  static async getUserTransactions(userId: string, page: number = 1, limit: number = 10): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [transactions, total] = await Promise.all([
        Transaction.find({ userId })
          .populate('storeId', 'name')
          .populate('items.productId', 'name image')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments({ userId })
      ]);

      return {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error al obtener transacciones del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener transacciones de la tienda
   */
  static async getStoreTransactions(storeId: string, page: number = 1, limit: number = 10): Promise<{
    transactions: ITransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [transactions, total] = await Promise.all([
        Transaction.find({ storeId })
          .populate('userId', 'name email')
          .populate('items.productId', 'name image')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments({ storeId })
      ]);

      return {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error al obtener transacciones de la tienda:', error);
      throw error;
    }
  }

  /**
   * Obtener transacción por ID
   */
  static async getTransactionById(transactionId: string): Promise<ITransaction | null> {
    try {
      return await Transaction.findById(transactionId)
        .populate('userId', 'name email')
        .populate('storeId', 'name')
        .populate('items.productId', 'name image description');
    } catch (error) {
      console.error('Error al obtener transacción por ID:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de transacción
   */
  static async updateTransactionStatus(
    transactionId: string, 
    status: string, 
    paymentStatus?: string
  ): Promise<ITransaction> {
    try {
      const updateData: any = { status };
      
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }
      
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        updateData,
        { new: true }
      );

      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      return transaction;
    } catch (error) {
      console.error('Error al actualizar estado de transacción:', error);
      throw error;
    }
  }

  /**
   * Calcular monto de impuestos (simplificado)
   */
  private static calculateTaxAmount(subtotal: number): number {
    // IVA 16% simplificado
    return subtotal * 0.16;
  }

  /**
   * Calcular monto de comisión (simplificado)
   */
  private static calculateCommissionAmount(subtotal: number): number {
    // Comisión 5% simplificada
    return subtotal * 0.05;
  }

  /**
   * Calcular costo de garantía por item
   */
  private static calculateWarrantyCost(itemTotal: number, warrantyType: string): number {
    switch (warrantyType) {
      case 'basic':
        return itemTotal * 0.02; // 2%
      case 'premium':
        return itemTotal * 0.05; // 5%
      case 'extended':
        return itemTotal * 0.08; // 8%
      default:
        return 0;
    }
  }

  /**
   * Calcular total de garantías
   */
  private static calculateWarrantyTotal(subtotal: number, warrantyLevel: string): number {
    switch (warrantyLevel) {
      case 'basic':
        return subtotal * 0.02; // 2%
      case 'premium':
        return subtotal * 0.05; // 5%
      case 'extended':
        return subtotal * 0.08; // 8%
      default:
        return 0;
    }
  }

  /**
   * Calcular cobertura de garantía
   */
  private static calculateWarrantyCoverage(subtotal: number, warrantyLevel: string): number {
    switch (warrantyLevel) {
      case 'basic':
        return subtotal * 0.8; // 80% de cobertura
      case 'premium':
        return subtotal * 0.9; // 90% de cobertura
      case 'extended':
        return subtotal; // 100% de cobertura
      default:
        return 0;
    }
  }

  /**
   * Obtener estadísticas de transacciones
   */
  static async getTransactionStats(userId?: string, storeId?: string): Promise<any> {
    try {
      const filter: any = {};
      if (userId) filter.userId = userId;
      if (storeId) filter.storeId = storeId;

      const [
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        totalAmount,
        warrantyTransactions
      ] = await Promise.all([
        Transaction.countDocuments(filter),
        Transaction.countDocuments({ ...filter, status: 'completed' }),
        Transaction.countDocuments({ ...filter, status: 'pending' }),
        Transaction.aggregate([
          { $match: filter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Transaction.countDocuments({ ...filter, warrantyEnabled: true })
      ]);

      return {
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        totalAmount: totalAmount[0]?.total || 0,
        warrantyTransactions,
        completionRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
        warrantyRate: totalTransactions > 0 ? (warrantyTransactions / totalTransactions) * 100 : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de transacciones:', error);
      throw error;
    }
  }
}
