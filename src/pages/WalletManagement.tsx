import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  Wallet, 
  History, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus
} from 'lucide-react';
// import { WalletDashboard } from '@/components/Wallet/WalletDashboard';
// import { TransactionHistoryComponent } from '@/components/Wallet/TransactionHistory';
import { WalletService } from '../services/walletService';
import RechargeModal from '../components/Wallet/RechargeModal';
import RechargeHistory from '../components/Wallet/RechargeHistory';

export const WalletManagement: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { activeStore } = useActiveStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados para modales
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const loadWalletInfo = async () => {
      if (!activeStore) return;
      
    try {
      setLoading(true);
        console.log('🔍 Cargando información de wallet para tienda:', activeStore._id);
        const data = await WalletService.getWalletInfo(activeStore._id);
        console.log('🔍 Datos de wallet recibidos:', data);
      setWalletInfo(data);
      setError(null);
    } catch (err) {
        console.error('❌ Error loading wallet info:', err);
      setError('Error al cargar información de la Wallet');
    } finally {
      setLoading(false);
    }
  };

    loadWalletInfo();
  }, [activeStore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span className="text-red-800">{error}</span>
      </div>
    );
  }

  if (!activeStore) {
    return (
      <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg flex items-center space-x-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <span className="text-yellow-800">No hay tienda activa seleccionada</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Wallet</h1>
        <p className="text-gray-600">
          Administra el saldo, transacciones y configuraciones de tu Wallet
        </p>
      </div>

      {/* Pestañas personalizadas */}
      <div className="w-full">
        <div className="grid w-full grid-cols-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Transacciones</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analíticas</span>
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'dashboard' && (
            <SimpleWalletDashboard 
              storeId={activeStore._id} 
              walletInfo={walletInfo}
              onRecharge={() => setShowRechargeModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
              onHistory={() => setShowHistoryModal(true)}
            />
          )}
          {activeTab === 'transactions' && (
            <RechargeHistory storeId={activeStore._id} />
          )}
          {activeTab === 'settings' && (
            <WalletSettingsTab storeId={activeStore._id} />
          )}
          {activeTab === 'analytics' && (
            <WalletAnalyticsTab storeId={activeStore._id} />
          )}
        </div>
      </div>

      {/* Modales */}
      {showRechargeModal && (
        <RechargeModal 
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            setShowRechargeModal(false);
            // Recargar datos
            window.location.reload();
          }}
          storeId={activeStore._id}
        />
      )}
      
      {showWithdrawModal && (
        <WithdrawModal 
          storeId={activeStore._id}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            // Recargar datos
            window.location.reload();
          }}
        />
      )}
      
      {showHistoryModal && (
        <HistoryModal 
          storeId={activeStore._id}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

// Componente para la pestaña de configuración
const WalletSettingsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span className="text-lg font-semibold">Configuración de Wallet</span>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Configuración de Wallet (implementar)</p>
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de analíticas
const WalletAnalyticsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span className="text-lg font-semibold">Analíticas de Wallet</span>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Analíticas de Wallet (implementar)</p>
        </div>
      </div>
    </div>
  );
};

// Componente simplificado para el dashboard de wallet
const SimpleWalletDashboard: React.FC<{ 
  storeId: string; 
  walletInfo: any; 
  onRecharge: () => void; 
  onWithdraw: () => void; 
  onHistory: () => void; 
}> = ({ storeId, walletInfo, onRecharge, onWithdraw, onHistory }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando transacciones para tienda:', storeId);
        const data = await WalletService.getTransactionHistory(storeId);
        console.log('🔍 Transacciones recibidas:', data);
        setTransactions(data || []);
      } catch (error) {
        console.error('❌ Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      loadTransactions();
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen del saldo */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Saldo Actual</h3>
            <p className="text-3xl font-bold text-green-600">
              ${walletInfo?.wallet?.balance?.toFixed(2) || '0.00'} {walletInfo?.wallet?.currency || 'USD'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Estado: {walletInfo?.wallet?.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={onRecharge}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Recargar</h4>
              <p className="text-sm text-gray-600">Agregar fondos</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={onWithdraw}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Minus className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Retirar</h4>
              <p className="text-sm text-gray-600">Sacar fondos</p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={onHistory}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Historial</h4>
              <p className="text-sm text-gray-600">Ver transacciones</p>
            </div>
          </div>
        </button>
      </div>

      {/* Últimas transacciones */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Últimas Transacciones</h3>
        </div>
        <div className="p-6">
          {transactions?.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction: any) => (
                <div key={transaction._id || transaction.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'deposit' || transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' || transaction.amount > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description || transaction.reason || 'Transacción'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}${transaction.amount?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay transacciones recientes</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente simplificado para el historial de transacciones
const SimpleTransactionHistory: React.FC<{ storeId: string }> = ({ storeId }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span className="text-lg font-semibold">Historial de Transacciones</span>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Historial de transacciones (implementar)</p>
        </div>
      </div>
    </div>
  );
};


// Modal para retirar de wallet
const WithdrawModal: React.FC<{ 
  storeId: string; 
  onClose: () => void; 
  onSuccess: () => void; 
}> = ({ storeId, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('🔍 Retirando de wallet:', { storeId, amount });
      
      // Aquí implementarías la lógica de retiro
      // const result = await WalletService.withdrawWallet(storeId, parseFloat(amount));
      
      console.log('🔍 Retiro simulado exitoso');
      onSuccess();
    } catch (err) {
      console.error('❌ Error retirando de wallet:', err);
      setError('Error al retirar de la wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Retirar de Wallet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a retirar
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Retirando...' : 'Retirar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para historial de transacciones
const HistoryModal: React.FC<{ 
  storeId: string; 
  onClose: () => void; 
}> = ({ storeId, onClose }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await WalletService.getTransactionHistory(storeId);
        setTransactions(data || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [storeId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Historial de Transacciones</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <div key={transaction._id || transaction.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'deposit' || transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'deposit' || transaction.amount > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description || transaction.reason || 'Transacción'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt || transaction.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}${transaction.amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay transacciones</p>
          </div>
        )}
      </div>
    </div>
  );
};
