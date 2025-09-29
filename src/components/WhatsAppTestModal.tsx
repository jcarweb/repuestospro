import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface WhatsAppTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WhatsAppStatus {
  method: string;
  connected: boolean;
  available: boolean;
}

const WhatsAppTestModal: React.FC<WhatsAppTestModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('+584121234567');
  const [testMessageText, setTestMessageText] = useState('🧪 Prueba desde PiezasYA - Sistema de Cotizaciones');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo estado de WhatsApp:', error);
    }
  };

  const initializeWhatsApp = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/whatsapp/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setTestResult('✅ WhatsApp inicializado. Escanea el código QR en la consola del servidor.');
        setTimeout(() => {
          fetchStatus();
        }, 2000);
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setInitializing(false);
    }
  };

  const testMessage = async () => {
    if (!testPhone || !testMessageText) {
      setTestResult('❌ Teléfono y mensaje son requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessageText,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setTestResult('✅ Mensaje enviado exitosamente');
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDocument = async () => {
    if (!testPhone) {
      setTestResult('❌ Teléfono es requerido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: testPhone,
          filename: 'test-document.pdf',
          caption: 'Documento de prueba desde PiezasYA',
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setTestResult('✅ Documento enviado exitosamente');
      } else {
        setTestResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🇻🇪 Prueba de WhatsApp para Venezuela
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Estado de WhatsApp */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Estado de WhatsApp
          </h3>
          {status ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {status.connected ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <AlertCircle className="text-red-500" size={20} />
                )}
                <span className="font-medium">
                  {status.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p>Método: {status.method}</p>
                <p>Disponible: {status.available ? 'Sí' : 'No'}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader className="animate-spin text-blue-500" size={20} />
                <span>Cargando estado...</span>
              </div>
            </div>
          )}
        </div>

        {/* Inicializar WhatsApp */}
        {status && !status.connected && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Inicializar WhatsApp
            </h3>
            <button
              onClick={initializeWhatsApp}
              disabled={initializing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {initializing ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <MessageCircle size={20} />
              )}
              {initializing ? 'Inicializando...' : 'Inicializar WhatsApp'}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Esto mostrará un código QR en la consola del servidor que debes escanear con WhatsApp.
            </p>
          </div>
        )}

        {/* Pruebas */}
        {status && status.connected && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pruebas de Funcionalidad
            </h3>

            {/* Prueba de Mensaje */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Prueba de Mensaje
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de Teléfono
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+584121234567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={testMessageText}
                    onChange={(e) => setTestMessageText(e.target.value)}
                    placeholder="Mensaje de prueba"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={testMessage}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </div>

            {/* Prueba de Documento */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Prueba de Documento
              </h4>
              <button
                onClick={testDocument}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <MessageCircle size={20} />
                )}
                {loading ? 'Enviando...' : 'Enviar Documento de Prueba'}
              </button>
            </div>
          </div>
        )}

        {/* Resultado */}
        {testResult && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Resultado
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {testResult}
            </p>
          </div>
        )}

        {/* Información */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Información
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Los números se formatean automáticamente para Venezuela (+58)</li>
            <li>• Si WhatsApp falla, el sistema enviará por email como respaldo</li>
            <li>• Para producción, configura WHATSAPP_METHOD=baileys en .env</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTestModal;
