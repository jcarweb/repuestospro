import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, User, Shield, AlertTriangle, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { useChat, Chat, ChatMessage } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { ContentValidator } from '../../utils/contentValidator';

interface ChatInterfaceProps {
  chatId: string;
  onClose?: () => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatId,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = useChat({
    userId: user?._id || '',
    userType: user?.role as 'client' | 'store_manager' | 'admin',
    token: localStorage.getItem('token') || '',
    onMessageBlocked: (data) => {
      console.log('Mensaje bloqueado:', data);
      alert(`Tu mensaje fue bloqueado: ${data.violations.join(', ')}`);
    },
    onUserOnline: (userId) => {
      console.log(`Usuario ${userId} está en línea`);
    },
    onUserOffline: (userId) => {
      console.log(`Usuario ${userId} está fuera de línea`);
    }
  });

  // Conectar al chat cuando el componente se monta
  useEffect(() => {
    if (chatId && chat.isAuthenticated) {
      chat.connectToChat(chatId);
    }
  }, [chatId, chat.isAuthenticated]);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    // Validar contenido antes de enviar
    const validation = ContentValidator.getRealTimeFeedback(messageInput);
    if (!validation.isValid) {
      setShowValidation(true);
      return;
    }

    await chat.sendMessage(messageInput);
    setMessageInput('');
    setShowValidation(false);
    
    // Enfocar input después de enviar
    inputRef.current?.focus();
  };

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manejar cambio en input
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    // Enviar estado de typing
    chat.setTyping(value.length > 0);
    
    // Validar contenido en tiempo real
    const validation = ContentValidator.getRealTimeFeedback(value);
    setShowValidation(!validation.isValid && value.length > 0);
  };

  // Componente de mensaje
  const MessageComponent: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isOwnMessage = message.sender.userId === user?._id;
    const isSystem = message.messageType === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage 
            ? 'bg-[#FFC300] text-gray-900' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.userName}
            </div>
          )}
          
          <div className="break-words">
            {message.content}
          </div>
          
          {message.validation.autoModerated && (
            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Contenido moderado
            </div>
          )}
          
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-70">
              {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {isOwnMessage && (
              <div className="flex">
                {message.status === 'sent' && <Clock className="w-3 h-3 opacity-50" />}
                {message.status === 'delivered' && <CheckCircle className="w-3 h-3 opacity-50" />}
                {message.status === 'read' && <CheckCircle className="w-3 h-3 text-blue-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Indicador de typing
  const TypingIndicator: React.FC = () => {
    if (!chat.otherUserTyping) return null;
    
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-sm">Escribiendo...</span>
          </div>
        </div>
      </div>
    );
  };

  if (!chat.isConnected) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  if (chat.error) {
    return (
      <div className={`flex items-center justify-center h-96 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{chat.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (chat.isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC300] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-96 bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header del Chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFC300] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {user?.role === 'client' 
                ? chat.currentChat?.metadata.storeName 
                : chat.currentChat?.metadata.clientName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {chat.currentChat?.product && (
                <span>{chat.currentChat.product.name}</span>
              )}
              <div className={`w-2 h-2 rounded-full ${
                (user?.role === 'client' ? chat.currentChat?.isStoreOnline : chat.currentChat?.isClientOnline)
                  ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Chat Seguro</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          chat.messages.map((message) => (
            <MessageComponent key={message._id} message={message} />
          ))
        )}
        
        <TypingIndicator />
        <div ref={messagesEndRef} />
      </div>

      {/* Validación de Contenido */}
      {showValidation && messageInput && (
        <div className="px-4 py-2 border-t border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Tu mensaje contiene información no permitida</p>
              <p className="text-yellow-700">
                Recuerda: usa el chat interno para comunicarte de forma segura
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input de Mensaje */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent resize-none"
            disabled={chat.currentChat?.status !== 'active'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || showValidation || chat.currentChat?.status !== 'active'}
            className="px-4 py-2 bg-[#FFC300] text-gray-900 rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {chat.currentChat?.status === 'closed' && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Este chat ha sido cerrado
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

