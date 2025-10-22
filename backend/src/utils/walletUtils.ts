import crypto from 'crypto';

/**
 * Genera un ID único para la wallet del delivery
 */
export function generateWalletId(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `delivery_wallet_${timestamp}_${randomBytes}`;
}

/**
 * Valida el formato de un ID de wallet
 */
export function validateWalletId(walletId: string): boolean {
  const walletIdPattern = /^delivery_wallet_[a-z0-9]+_[a-f0-9]{16}$/;
  return walletIdPattern.test(walletId);
}

/**
 * Formatea un monto para mostrar en la interfaz
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Valida que un monto sea válido para transacciones
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'El monto debe ser un número válido' };
  }

  if (amount < 0) {
    return { valid: false, error: 'El monto no puede ser negativo' };
  }

  if (amount > 10000) {
    return { valid: false, error: 'El monto excede el límite máximo' };
  }

  if (amount !== Math.round(amount * 100) / 100) {
    return { valid: false, error: 'El monto no puede tener más de 2 decimales' };
  }

  return { valid: true };
}

/**
 * Calcula el saldo disponible considerando retiros pendientes
 */
export function calculateAvailableBalance(
  currentBalance: number,
  pendingWithdrawal: number
): number {
  return Math.max(0, currentBalance - pendingWithdrawal);
}

/**
 * Genera un hash para verificar la integridad de las transacciones
 */
export function generateTransactionHash(
  deliveryId: string,
  amount: number,
  type: string,
  timestamp: number
): string {
  const data = `${deliveryId}_${amount}_${type}_${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Valida que una transacción sea legítima
 */
export function validateTransaction(
  deliveryId: string,
  amount: number,
  type: string,
  timestamp: number,
  hash: string
): boolean {
  const expectedHash = generateTransactionHash(deliveryId, amount, type, timestamp);
  return hash === expectedHash;
}

/**
 * Calcula las estadísticas de una wallet
 */
export function calculateWalletStats(transactions: any[]): {
  totalEarnings: number;
  totalWithdrawals: number;
  totalBonuses: number;
  averageEarning: number;
  transactionCount: number;
} {
  const earnings = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const withdrawals = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const bonuses = transactions
    .filter(t => t.amount > 0 && t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const earningTransactions = transactions.filter(t => t.amount > 0);
  const averageEarning = earningTransactions.length > 0 ? 
    earnings / earningTransactions.length : 0;

  return {
    totalEarnings: earnings,
    totalWithdrawals: withdrawals,
    totalBonuses: bonuses,
    averageEarning,
    transactionCount: transactions.length
  };
}

/**
 * Determina si un delivery puede retirar fondos
 */
export function canWithdraw(
  currentBalance: number,
  pendingWithdrawal: number,
  minimumAmount: number = 20
): { canWithdraw: boolean; availableBalance: number; reason?: string } {
  const availableBalance = calculateAvailableBalance(currentBalance, pendingWithdrawal);
  
  if (availableBalance < minimumAmount) {
    return {
      canWithdraw: false,
      availableBalance,
      reason: `El saldo disponible ($${formatAmount(availableBalance)}) es menor al mínimo requerido ($${formatAmount(minimumAmount)})`
    };
  }

  return {
    canWithdraw: true,
    availableBalance
  };
}

/**
 * Formatea las estadísticas de rendimiento
 */
export function formatPerformanceStats(stats: {
  totalDeliveries: number;
  completedDeliveries: number;
  onTimeDeliveries: number;
  averageDeliveryTime: number;
  rating: number;
}): {
  completionRate: string;
  onTimeRate: string;
  averageTime: string;
  rating: string;
} {
  const completionRate = stats.totalDeliveries > 0 ? 
    ((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1) : '0.0';
  
  const onTimeRate = stats.completedDeliveries > 0 ? 
    ((stats.onTimeDeliveries / stats.completedDeliveries) * 100).toFixed(1) : '0.0';
  
  const averageTime = Math.round(stats.averageDeliveryTime);
  
  const rating = stats.rating.toFixed(1);

  return {
    completionRate: `${completionRate}%`,
    onTimeRate: `${onTimeRate}%`,
    averageTime: `${averageTime} min`,
    rating: `${rating}/5`
  };
}
