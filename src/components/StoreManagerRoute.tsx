import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface StoreManagerRouteProps {
  children: React.ReactNode;
}

const StoreManagerRoute: React.FC<StoreManagerRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole, user } = useAuth();

  console.log('🔍 StoreManagerRoute: isAuthenticated:', isAuthenticated);
  console.log('🔍 StoreManagerRoute: user role:', user?.role);
  console.log('🔍 StoreManagerRoute: hasRole store_manager:', hasRole('store_manager'));

  if (!isAuthenticated) {
    console.log('🔍 StoreManagerRoute: No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('store_manager')) {
    console.log('🔍 StoreManagerRoute: No es store_manager, redirigiendo a /');
    return <Navigate to="/" replace />;
  }

  console.log('🔍 StoreManagerRoute: Usuario autorizado, renderizando children');
  return <>{children}</>;
};

export default StoreManagerRoute; 