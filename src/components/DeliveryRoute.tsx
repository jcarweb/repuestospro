import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DeliveryRouteProps {
  children: React.ReactNode;
}

const DeliveryRoute: React.FC<DeliveryRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('delivery')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DeliveryRoute;
