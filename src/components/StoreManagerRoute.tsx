import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface StoreManagerRouteProps {
  children: React.ReactNode;
}

const StoreManagerRoute: React.FC<StoreManagerRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('store_manager')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StoreManagerRoute; 