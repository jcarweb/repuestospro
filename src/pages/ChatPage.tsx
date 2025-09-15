import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatList from '../components/Chat/ChatList';
import ChatInterface from '../components/Chat/ChatInterface';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(chatId);
  const [showChatList, setShowChatList] = useState(!chatId); // En móvil, mostrar lista si no hay chat seleccionado

  const handleChatSelect = (newChatId: string) => {
    setSelectedChatId(newChatId);
    setShowChatList(false); // En móvil, ocultar lista cuando se selecciona un chat
  };

  const handleBackToList = () => {
    setSelectedChatId(undefined);
    setShowChatList(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-[#FFC300]" />
              <h1 className="text-xl font-semibold text-gray-900">
                Chat de PiezasYA
              </h1>
            </div>
            
            {/* Botón de volver en móvil */}
            {selectedChatId && (
              <button
                onClick={handleBackToList}
                className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Lista de Chats - Sidebar */}
            <div className={`
              ${showChatList ? 'block' : 'hidden'} 
              md:block md:w-1/3 lg:w-1/4 
              w-full border-r border-gray-200
            `}>
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChatId}
                className="h-full"
              />
            </div>

            {/* Área de Chat */}
            <div className={`
              ${!showChatList || selectedChatId ? 'block' : 'hidden'} 
              md:block md:flex-1 
              w-full
            `}>
              {selectedChatId ? (
                <ChatInterface 
                  chatId={selectedChatId}
                  className="h-full"
                />
              ) : (
                // Estado vacío cuando no hay chat seleccionado
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Selecciona un chat
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm">
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                    
                    {/* Información de seguridad */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="font-medium text-blue-900 mb-2">
                        🛡️ Chat Seguro
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Todas las conversaciones están protegidas</p>
                        <p>• No compartas información personal</p>
                        <p>• Usa solo los métodos de pago de PiezasYA</p>
                        <p>• Reporta cualquier comportamiento sospechoso</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>🔒 Conversaciones encriptadas</span>
              <span>🚫 Filtros anti-spam automáticos</span>
              <span>⚡ Tiempo real</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>¿Necesitas ayuda? Contacta soporte</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

