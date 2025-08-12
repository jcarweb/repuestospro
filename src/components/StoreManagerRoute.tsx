import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface StoreManagerRouteProps {
  children: React.ReactNode;
}

const StoreManagerRoute: React.FC<StoreManagerRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'store_manager') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StoreManagerRoute; 