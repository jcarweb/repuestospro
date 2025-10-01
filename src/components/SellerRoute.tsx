import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SellerRouteProps {
  children: React.ReactNode;
}

const SellerRoute: React.FC<SellerRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('🔍 SellerRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 SellerRoute - user:', user);
  console.log('🔍 SellerRoute - user role:', user?.role);
  console.log('🔍 SellerRoute - Current URL:', window.location.href);
  console.log('🔍 SellerRoute - Current pathname:', window.location.pathname);

  if (!isAuthenticated) {
    console.log('🔄 SellerRoute - No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'seller') {
    console.log('🔄 SellerRoute - Rol no es seller, redirigiendo según rol:', user?.role);
    // Redirigir según el rol del usuario
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'store_manager':
        return <Navigate to="/store-manager/dashboard" replace />;
      case 'delivery':
        return <Navigate to="/delivery/dashboard" replace />;
      case 'client':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  console.log('✅ SellerRoute - Acceso permitido para vendedor');
  return <>{children}</>;
};

export default SellerRoute;
