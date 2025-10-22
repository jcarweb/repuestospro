import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Minus, 
  Settings, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { WalletService, TransactionHistory } from '@/services/walletService';

interface TransactionHistoryProps {
  storeId: string;
}

export const TransactionHistoryComponent: React.FC<TransactionHistoryProps> = ({ storeId }) => {
  const [transactions, setTransactions] = useState<TransactionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [storeId, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await WalletService.getTransactionHistory(storeId, filters);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el historial de transacciones');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge': return <Plus className="h-4 w-4 text-green-600" />;
      case 'commission_deduction': return <Minus className="h-4 w-4 text-red-600" />;
      case 'manual_adjustment': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'refund': return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'withdrawal': return <Minus className="h-4 w-4 text-orange-600" />;
      case 'bonus': return <Plus className="h-4 w-4 text-yellow-600" />;
      case 'penalty': return <Minus className="h-4 w-4 text-red-600" />;
      default: return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      recharge: 'Recarga',
      commission_deduction: 'Comisión',
      manual_adjustment: 'Ajuste Manual',
      refund: 'Reembolso',
      withdrawal: 'Retiro',
      bonus: 'Bono',
      penalty: 'Penalización',
      system_adjustment: 'Ajuste del Sistema'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'reversed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      reversed: 'Revertido'
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      case 'reversed': return 'secondary';
      default: return 'outline';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const exportTransactions = async () => {
    try {
      const blob = await WalletService.exportWalletData({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacciones-wallet-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting transactions:', err);
    }
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Historial de Transacciones</span>
          </CardTitle>
          <Button
            variant="outline"
            onClick={exportTransactions}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo</label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="recharge">Recarga</SelectItem>
                <SelectItem value="commission_deduction">Comisión</SelectItem>
                <SelectItem value="manual_adjustment">Ajuste Manual</SelectItem>
                <SelectItem value="refund">Reembolso</SelectItem>
                <SelectItem value="withdrawal">Retiro</SelectItem>
                <SelectItem value="bonus">Bono</SelectItem>
                <SelectItem value="penalty">Penalización</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="reversed">Revertido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha Inicio</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha Fin</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({
                page: 1,
                limit: 20,
                type: '',
                status: '',
                startDate: '',
                endDate: ''
              })}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>

        {/* Lista de transacciones */}
        {transactions.transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {getTransactionTypeLabel(transaction.type)}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                      {transaction.processedBy && (
                        <p className="text-xs text-gray-500">
                          Por: {transaction.processedBy.name}
                        </p>
                      )}
                      {transaction.orderId && (
                        <p className="text-xs text-gray-500">
                          Orden: {transaction.orderId.orderNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, 'USD')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Saldo: {formatCurrency(transaction.balanceAfter, 'USD')}
                  </p>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    {getStatusIcon(transaction.status)}
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron transacciones</p>
          </div>
        )}

        {/* Paginación */}
        {transactions.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-gray-600">
              Página {filters.page} de {transactions.pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= transactions.pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
