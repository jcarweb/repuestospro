import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole, user } = useAuth();

  console.log('🔍 AdminRoute check:', { isAuthenticated, userRole: user?.role, hasAdminRole: hasRole('admin') });

  if (!isAuthenticated) {
    console.log('❌ AdminRoute: No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('admin')) {
    console.log('❌ AdminRoute: No tiene rol admin, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ AdminRoute: Acceso permitido');
  return <>{children}</>;
};

export default AdminRoute; 