import React, { useState, useEffect } from 'react';

interface TwoFactorVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  email: string;
  tempToken: string;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  tempToken
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Log cuando el componente se monta/desmonta
  useEffect(() => {
    console.log('🔍 TwoFactorVerification useEffect:', { isOpen, email, tempToken: tempToken ? 'existe' : 'no existe' });
  }, [isOpen, email, tempToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Enviando verificación 2FA...', { email, code: code.trim(), tempToken: tempToken.substring(0, 20) + '...' });
      
      const response = await fetch('http://localhost:5000/api/auth/login/2fa/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
          tempToken
        })
      });

      const result = await response.json();
      console.log('📡 Respuesta verificación 2FA:', result);

      if (result.success) {
        console.log('✅ Verificación 2FA exitosa');
        onSuccess(result.data.user, result.data.token);
      } else {
        console.error('❌ Error en verificación 2FA:', result);
        setError(result.message || 'Error verificando código');
      }
    } catch (error) {
      console.error('❌ Error en verificación 2FA:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  console.log('🔍 TwoFactorVerification renderizado:', { isOpen, email, tempToken: tempToken ? 'existe' : 'no existe' });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificación de Dos Factores
          </h2>
          <p className="text-gray-600">
            Ingresa el código de 6 dígitos de tu autenticador
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Email: {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificación
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar y Completar Login'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full text-gray-500 py-2 px-4 rounded-md hover:text-gray-700 focus:outline-none disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            El código cambia cada 30 segundos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Código de prueba: 040944
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerification; 