import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { Loader2 } from 'lucide-react';

interface QuickStoreCheckProps {
  children: React.ReactNode;
}

const QuickStoreCheck: React.FC<QuickStoreCheckProps> = ({ children }) => {
  const { user, token } = useAuth();
  const { userStores, loading, refreshStores } = useActiveStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const quickCheck = async () => {
      // Si no es store_manager, no hacer nada
      if (!user || user.role !== 'store_manager') {
        setIsChecking(false);
        return;
      }

      console.log('QuickStoreCheck: Iniciando verificación...');
      console.log('QuickStoreCheck: Estado actual - loading:', loading, 'userStores.length:', userStores.length);

      // Si ya tenemos datos y no estamos cargando, proceder inmediatamente
      if (!loading && userStores.length > 0) {
        console.log('QuickStoreCheck: Ya tenemos tiendas cargadas, redirigiendo a dashboard');
        navigate('/store-manager/dashboard', { replace: true });
        setIsChecking(false);
        return;
      }

      // Si no tenemos datos y no estamos cargando, hacer refresh
      if (!loading && userStores.length === 0) {
        console.log('QuickStoreCheck: No hay datos, iniciando refresh...');
        await refreshStores();
        return;
      }

      // Si estamos cargando, esperar con timeout
      if (loading) {
        console.log('QuickStoreCheck: Esperando que termine la carga...');
        
        // Timeout de 8 segundos máximo
        const timeout = setTimeout(() => {
          console.log('QuickStoreCheck: Timeout alcanzado, verificando estado final...');
          if (userStores.length > 0) {
            console.log('QuickStoreCheck: Tiene tiendas después del timeout, redirigiendo a dashboard');
            navigate('/store-manager/dashboard', { replace: true });
          } else {
            console.log('QuickStoreCheck: No tiene tiendas después del timeout, redirigiendo a setup');
            navigate('/store-setup', { replace: true });
          }
          setIsChecking(false);
        }, 8000);
        
        setTimeoutId(timeout);
        return;
      }
    };

    quickCheck();
  }, [user, token, userStores.length, loading, refreshStores, navigate]);

  // Efecto para manejar el resultado cuando cambia el estado
  useEffect(() => {
    if (!isChecking || !user || user.role !== 'store_manager') return;

    // Si terminó de cargar y tenemos resultado
    if (!loading) {
      console.log('QuickStoreCheck: Carga completada, verificando resultado...');
      console.log('QuickStoreCheck: userStores.length:', userStores.length);
      
      if (userStores.length > 0) {
        console.log('QuickStoreCheck: Tiene tiendas, redirigiendo a dashboard');
        navigate('/store-manager/dashboard', { replace: true });
      } else {
        console.log('QuickStoreCheck: No tiene tiendas, redirigiendo a setup');
        navigate('/store-setup', { replace: true });
      }
      setIsChecking(false);
    }
  }, [loading, userStores.length, isChecking, user, navigate]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Mostrar loading solo si es store_manager
  if (isChecking && user?.role === 'store_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando tienda...</h2>
          <p className="text-gray-600">Comprobando configuración de tu tienda.</p>
          <div className="mt-4 text-sm text-gray-500">
            <div>Estado: {loading ? 'Cargando...' : 'Verificando...'}</div>
            <div>Tiendas encontradas: {userStores.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default QuickStoreCheck;
