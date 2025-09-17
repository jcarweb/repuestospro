import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const Debug2FAModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');

  const handleTest2FA = async () => {
    try {
      console.log('🧪 Probando flujo 2FA...');
      
      const response = await fetch('API_BASE_URL/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@repuestospro.com', 
          password: 'Test123!' 
        }),
      });

      const data = await response.json();
      console.log('📡 Respuesta del servidor:', data);

      if (data.requiresTwoFactor) {
        console.log('✅ 2FA requerido, mostrando modal de prueba');
        setShowModal(true);
      } else {
        console.log('❌ No requiere 2FA');
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Enviando código:', code);
    // Aquí iría la lógica de verificación
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTest2FA}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        🧪 Probar 2FA
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">🧪 Modal de Prueba 2FA</h2>
            <p className="mb-4">Este es un modal de prueba para verificar que funciona</p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código 2FA"
                className="w-full p-2 border rounded mb-4"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Verificar
              </button>
            </form>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 bg-gray-500 text-white py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debug2FAModal;
