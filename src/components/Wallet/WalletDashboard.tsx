import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  History,
  Plus,
  Minus
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { WalletService } from '@/services/walletService';

interface WalletData {
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
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
    status: string;
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

interface WalletDashboardProps {
  storeId: string;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ storeId }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [storeId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const data = await WalletService.getWalletInfo(storeId);
      setWalletData(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar información de la Wallet');
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBalanceStatus = (balance: number, threshold: number) => {
    if (balance <= 0) return 'insufficient';
    if (balance <= threshold) return 'low';
    return 'sufficient';
  };

  const getBalanceColor = (status: string) => {
    switch (status) {
      case 'insufficient': return 'text-red-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge': return <Plus className="h-4 w-4 text-green-600" />;
      case 'commission_deduction': return <Minus className="h-4 w-4 text-red-600" />;
      case 'manual_adjustment': return <Settings className="h-4 w-4 text-blue-600" />;
      default: return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      recharge: 'Recarga',
      commission_deduction: 'Comisión',
      manual_adjustment: 'Ajuste',
      refund: 'Reembolso',
      withdrawal: 'Retiro',
      bonus: 'Bono',
      penalty: 'Penalización'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!walletData) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No se pudo cargar la información de la Wallet</AlertDescription>
      </Alert>
    );
  }

  const { wallet, settings, recentTransactions, pendingNotifications, store } = walletData;
  const balanceStatus = getBalanceStatus(wallet.balance, settings.lowBalanceThreshold);

  return (
    <div className="space-y-6">
      {/* Header con información principal */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet de {store.name}</h1>
          <p className="text-gray-600">Gestiona el saldo y configuraciones de tu Wallet</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </Button>
          <Button
            onClick={() => setShowRechargeModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Recargar</span>
          </Button>
        </div>
      </div>

      {/* Alertas importantes */}
      {pendingNotifications.length > 0 && (
        <div className="space-y-2">
          {pendingNotifications.map((notification) => (
            <Alert
              key={notification.id}
              className={`border-${
                notification.priority === 'critical' ? 'red' : 
                notification.priority === 'high' ? 'orange' : 'yellow'
              }-200 bg-${
                notification.priority === 'critical' ? 'red' : 
                notification.priority === 'high' ? 'orange' : 'yellow'
              }-50`}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{notification.title}</strong>
                <br />
                {notification.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo actual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(balanceStatus)}`}>
              {formatCurrency(wallet.balance, wallet.currency)}
            </div>
            <Badge variant={balanceStatus === 'insufficient' ? 'destructive' : 
                           balanceStatus === 'low' ? 'secondary' : 'default'}>
              {balanceStatus === 'insufficient' ? 'Insuficiente' :
               balanceStatus === 'low' ? 'Bajo' : 'Suficiente'}
            </Badge>
          </CardContent>
        </Card>

        {/* Estado de pagos en efectivo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos en Efectivo</CardTitle>
            {wallet.cashPaymentEnabled ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet.cashPaymentEnabled ? 'Habilitados' : 'Bloqueados'}
            </div>
            <p className="text-xs text-muted-foreground">
              {wallet.cashPaymentEnabled 
                ? 'Los clientes pueden pagar en efectivo'
                : 'Recarga tu Wallet para habilitar pagos en efectivo'
              }
            </p>
          </CardContent>
        </Card>

        {/* Comisión por defecto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.commissionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Por cada venta en efectivo
            </p>
          </CardContent>
        </Card>

        {/* Última transacción */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Transacción</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet.lastTransactionAt 
                ? formatDate(wallet.lastTransactionAt)
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {wallet.lastTransactionAt 
                ? 'Hace ' + new Date(wallet.lastTransactionAt).toLocaleDateString()
                : 'Sin transacciones'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transacciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transacciones Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{getTransactionTypeLabel(transaction.type)}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, wallet.currency)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Saldo: {formatCurrency(transaction.balanceAfter, wallet.currency)}
                    </p>
                    <Badge variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay transacciones recientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      {showRechargeModal && (
        <RechargeModal
          storeId={storeId}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={loadWalletData}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          storeId={storeId}
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={loadWalletData}
        />
      )}
    </div>
  );
};

// Componentes de modales (simplificados)
const RechargeModal: React.FC<{
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ storeId, onClose, onSuccess }) => {
  // Implementación del modal de recarga
  return <div>Modal de recarga (implementar)</div>;
};

const SettingsModal: React.FC<{
  storeId: string;
  settings: any;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ storeId, settings, onClose, onSuccess }) => {
  // Implementación del modal de configuración
  return <div>Modal de configuración (implementar)</div>;
};
