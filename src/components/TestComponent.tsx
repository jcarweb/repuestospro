import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="p-8 bg-red-100 border-2 border-red-500">
      <h1 className="text-2xl font-bold text-red-700">Componente de Prueba</h1>
      <p className="text-red-600">Si puedes ver esto, el renderizado básico funciona.</p>
      
      <div className="mt-4 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Estado de Autenticación:</h2>
        <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
        <p>Usuario: {user ? user.name : 'No hay usuario'}</p>
        <p>Rol: {user ? user.role : 'N/A'}</p>
      </div>

      <div className="mt-4 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Información del Sistema:</h2>
        <p>User Agent: {navigator.userAgent}</p>
        <p>URL: {window.location.href}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestComponent; 