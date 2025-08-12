import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ClientRouteProps {
  children: React.ReactNode;
}

const ClientRoute: React.FC<ClientRouteProps> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('client')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ClientRoute;
