import React from 'react';

interface Test2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Test2FAModal: React.FC<Test2FAModalProps> = ({ isOpen, onClose }) => {
  console.log('🔍 Test2FAModal renderizado:', { isOpen });

  if (!isOpen) {
    console.log('❌ Test2FAModal no se muestra porque isOpen es false');
    return null;
  }

  console.log('✅ Test2FAModal se está mostrando');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🧪 Modal de Prueba 2FA
          </h2>
          <p className="text-gray-600">
            Este es un modal de prueba para verificar que funciona
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            ✅ El modal se está mostrando correctamente
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cerrar Modal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test2FAModal;
