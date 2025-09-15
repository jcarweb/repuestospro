import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { Loader2 } from 'lucide-react';

interface StoreManagerRedirectProps {
  children: React.ReactNode;
}

const StoreManagerRedirect: React.FC<StoreManagerRedirectProps> = ({ children }) => {
  const { user, token } = useAuth();
  const { userStores, loading } = useActiveStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      console.log('StoreManagerRedirect: Verificando redirección...', {
        user: user?.id,
        role: user?.role,
        userStoresLength: userStores.length,
        loading,
        currentPath: window.location.pathname
      });

      // Si no es store_manager, no hacer nada
      if (!user || user.role !== 'store_manager') {
        console.log('StoreManagerRedirect: No es store_manager');
        setIsChecking(false);
        return;
      }

      // Si está cargando, esperar máximo 5 segundos
      if (loading) {
        console.log('StoreManagerRedirect: Aún cargando...');
        // Timeout para evitar esperar indefinidamente
        setTimeout(() => {
          if (isChecking) {
            console.log('StoreManagerRedirect: Timeout, continuando...');
            setIsChecking(false);
          }
        }, 5000);
        return;
      }

      // Si no tiene tiendas, redirigir a setup
      if (userStores.length === 0) {
        console.log('StoreManagerRedirect: No hay tiendas, redirigiendo a setup');
        navigate('/store-setup', { replace: true });
        return;
      }

      // Si tiene tiendas y está en setup, redirigir a dashboard
      if (window.location.pathname === '/store-setup') {
        console.log('StoreManagerRedirect: Tiene tiendas, redirigiendo a dashboard');
        navigate('/store-manager/dashboard', { replace: true });
        return;
      }

      // Si tiene tiendas y está en la ruta raíz del store-manager, redirigir a dashboard
      if (window.location.pathname === '/store-manager' || window.location.pathname === '/store-manager/') {
        console.log('StoreManagerRedirect: Tiene tiendas, redirigiendo a dashboard desde ruta raíz');
        navigate('/store-manager/dashboard', { replace: true });
        return;
      }

      setIsChecking(false);
    };

    checkAndRedirect();
  }, [user, userStores, loading, navigate, isChecking]);

  // Mostrar loading mientras se verifica
  if (isChecking && user?.role === 'store_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando tienda...</h2>
          <p className="text-gray-600">Comprobando configuración de tu tienda.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StoreManagerRedirect;
