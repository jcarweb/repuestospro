import { api } from './api';

export interface WalletInfo {
  wallet: {
    id: string;
    balance: number;
    currency: string;
    isActive: boolean;
    cashPaymentEnabled: boolean;
    lastTransactionAt?: string;
  };
  settings: {
    commissionRate: number;
    minimumRechargeAmount: number;
    maximumRechargeAmount: number;
    lowBalanceThreshold: number;
    criticalBalanceThreshold: number;
    autoRechargeEnabled: boolean;
    autoRechargeAmount: number;
    autoRechargeThreshold: number;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
    status: string;
    processedBy?: {
      name: string;
      email: string;
    };
  }>;
  pendingNotifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
  }>;
  store: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TransactionHistory {
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
    status: string;
    processedBy?: {
      name: string;
      email: string;
    };
    orderId?: {
      orderNumber: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletStats {
  period: number;
  totalWallets: number;
  activeWallets: number;
  lowBalanceWallets: number;
  insufficientBalanceWallets: number;
  transactionStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  dailyStats: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
    totalAmount: number;
  }>;
  problemWallets: Array<{
    _id: string;
    balance: number;
    cashPaymentEnabled: boolean;
    isActive: boolean;
    storeId: {
      name: string;
      email: string;
      phone: string;
    };
  }>;
  startDate: string;
  endDate: string;
}

export interface RechargeRequest {
  amount: number;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export interface SettingsUpdate {
  commissionRate?: number;
  minimumRechargeAmount?: number;
  maximumRechargeAmount?: number;
  lowBalanceThreshold?: number;
  criticalBalanceThreshold?: number;
  autoRechargeEnabled?: boolean;
  autoRechargeAmount?: number;
  autoRechargeThreshold?: number;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export class WalletService {
  // Obtener información de la Wallet
  static async getWalletInfo(storeId: string): Promise<WalletInfo> {
    const response = await api.get(`/wallet/${storeId}`);
    return response.data.data;
  }

  // Obtener historial de transacciones
  static async getTransactionHistory(
    storeId: string,
    params: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<TransactionHistory> {
    const response = await api.get(`/wallet/${storeId}/transactions`, { params });
    return response.data.data;
  }

  // Recargar Wallet
  static async rechargeWallet(storeId: string, data: RechargeRequest): Promise<any> {
    const response = await api.post(`/wallet/${storeId}/recharge`, data);
    return response.data;
  }

  // Verificar saldo para pago en efectivo
  static async checkCashPaymentBalance(storeId: string, amount: number): Promise<any> {
    const response = await api.post(`/wallet/${storeId}/check-balance`, { amount });
    return response.data;
  }

  // Bloquear/Desbloquear pagos en efectivo
  static async toggleCashPayments(storeId: string, enabled: boolean): Promise<any> {
    const response = await api.patch(`/wallet/${storeId}/cash-payments`, { enabled });
    return response.data;
  }

  // Obtener configuraciones de Wallet
  static async getWalletSettings(storeId: string): Promise<any> {
    const response = await api.get(`/wallet/${storeId}/settings`);
    return response.data.data;
  }

  // Actualizar configuraciones de Wallet
  static async updateWalletSettings(storeId: string, data: SettingsUpdate): Promise<any> {
    const response = await api.put(`/wallet/${storeId}/settings`, data);
    return response.data;
  }

  // Obtener estadísticas de Wallet
  static async getWalletStats(storeId: string, period: number = 30): Promise<any> {
    const response = await api.get(`/wallet/${storeId}/stats`, {
      params: { period }
    });
    return response.data.data;
  }

  // Obtener todas las Wallets (admin)
  static async getAllWallets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<any> {
    const response = await api.get('/admin/wallet', { params });
    return response.data.data;
  }

  // Obtener Wallet específica (admin)
  static async getWalletById(walletId: string): Promise<any> {
    const response = await api.get(`/admin/wallet/${walletId}`);
    return response.data.data;
  }

  // Ajuste manual de saldo (admin)
  static async manualAdjustment(
    walletId: string,
    data: {
      amount: number;
      description: string;
      reason?: string;
    }
  ): Promise<any> {
    const response = await api.post(`/admin/wallet/${walletId}/adjustment`, data);
    return response.data;
  }

  // Revertir transacción (admin)
  static async reverseTransaction(
    transactionId: string,
    reason: string
  ): Promise<any> {
    const response = await api.post(`/admin/wallet/transactions/${transactionId}/reverse`, {
      reason
    });
    return response.data;
  }

  // Bloquear/Desbloquear Wallet (admin)
  static async toggleWalletStatus(
    walletId: string,
    data: {
      isActive: boolean;
      reason?: string;
    }
  ): Promise<any> {
    const response = await api.patch(`/admin/wallet/${walletId}/status`, data);
    return response.data;
  }

  // Obtener estadísticas globales (admin)
  static async getGlobalStats(period: number = 30): Promise<WalletStats> {
    const response = await api.get('/admin/wallet/stats/global', {
      params: { period }
    });
    return response.data.data;
  }

  // Exportar datos (admin)
  static async exportWalletData(params: {
    walletId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Blob> {
    const response = await api.get('/admin/wallet/export/data', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}
