import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, AlertCircle } from 'lucide-react';
import StoreRegistrationForm from '../components/StoreRegistrationForm';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../../config/api';

const StoreRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (storeData: any) => {
    setLoading(true);
    setMessage(null);

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Tienda registrada exitosamente. Serás redirigido al dashboard.'
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/store-manager/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al registrar la tienda');
      }
    } catch (error) {
      console.error('Error registrando tienda:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Store className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Registro de Tienda</h1>
          </div>
          <p className="text-gray-600">
            Completa el formulario para registrar tu tienda de repuestos automotrices
          </p>
        </div>

        {/* Mensajes de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-yellow-900 mb-3">📍 Importante: Ubicación GPS</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>¿Por qué es crucial especificar las coordenadas GPS?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Permite a los clientes encontrar tu tienda fácilmente</li>
              <li>Los productos aparecen en búsquedas por proximidad (5-10 km)</li>
              <li>Mejora la experiencia del cliente al mostrar distancias exactas</li>
              <li>Facilita la comparación entre tiendas cercanas</li>
              <li>Optimiza las búsquedas de repuestos por ubicación</li>
            </ul>
            <p className="mt-3 font-medium">
              💡 <strong>Consejo:</strong> Usa el mapa interactivo para seleccionar la ubicación exacta de tu tienda
            </p>
          </div>
        </div>

        {/* Formulario */}
        <StoreRegistrationForm
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* Información adicional */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-3">📋 Información Adicional</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Después del registro:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Podrás gestionar tu inventario de productos</li>
              <li>Recibirás notificaciones de pedidos de clientes</li>
              <li>Tendrás acceso a estadísticas de ventas</li>
              <li>Podrás configurar promociones y descuentos</li>
              <li>Los clientes podrán encontrar tus productos por proximidad GPS</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StoreRegistration;
