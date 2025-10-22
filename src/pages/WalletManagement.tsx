import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  History, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { WalletDashboard } from '@/components/Wallet/WalletDashboard';
import { TransactionHistoryComponent } from '@/components/Wallet/TransactionHistory';
import { WalletService } from '@/services/walletService';

export const WalletManagement: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    if (storeId) {
      loadWalletInfo();
    }
  }, [storeId]);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      const data = await WalletService.getWalletInfo(storeId!);
      setWalletInfo(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar información de la Wallet');
      console.error('Error loading wallet info:', err);
    } finally {
      setLoading(false);
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
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!storeId) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>ID de tienda no proporcionado</AlertDescription>
      </Alert>
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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analíticas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <WalletDashboard storeId={storeId} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionHistoryComponent storeId={storeId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <WalletSettingsTab storeId={storeId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <WalletAnalyticsTab storeId={storeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para la pestaña de configuración
const WalletSettingsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuración de Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Configuración de Wallet (implementar)</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para la pestaña de analíticas
const WalletAnalyticsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Analíticas de Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Analíticas de Wallet (implementar)</p>
        </div>
      </CardContent>
    </Card>
  );
};
