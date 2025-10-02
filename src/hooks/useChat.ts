import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../../config/api';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: {
    userId: string;
    userType: 'client' | 'store_manager' | 'admin';
    userName: string;
  };
  messageType: 'text' | 'image' | 'file' | 'system' | 'auto_response';
  content: string;
  originalContent?: string;
  validation: {
    isBlocked: boolean;
    violations: string[];
    blockedContent: string[];
    autoModerated: boolean;
  };
  status: 'sent' | 'delivered' | 'read' | 'blocked';
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  participants: {
    client: string;
    store: string;
  };
  product?: {
    _id: string;
    name: string;
    sku: string;
    images: string[];
    price: number;
  };
  status: 'active' | 'closed' | 'blocked';
  lastMessage?: ChatMessage;
  lastActivity: string;
  isClientOnline: boolean;
  isStoreOnline: boolean;
  metadata: {
    clientName: string;
    storeName: string;
    productName?: string;
    productSku?: string;
  };
}

export interface UseChat {
  // Estado de conexión
  isConnected: boolean;
  isAuthenticated: boolean;
  
  // Chat actual
  currentChat: Chat | null;
  messages: ChatMessage[];
  
  // Estado de UI
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  otherUserTyping: boolean;
  
  // Funciones
  connectToChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => void;
  setTyping: (isTyping: boolean) => void;
  disconnect: () => void;
  
  // Eventos
  onMessageBlocked?: (data: any) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

interface UseChatOptions {
  userId: string;
  userType: 'client' | 'store_manager' | 'admin';
  token: string;
  onMessageBlocked?: (data: any) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

export const useChat = (options: UseChatOptions): UseChat => {
  const {
    userId,
    userType,
    token,
    onMessageBlocked,
    onUserOnline,
    onUserOffline
  } = options;

  // Estados
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Referencias
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar conexión Socket.IO
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    const socket = socketRef.current;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('💬 Conectado a WebSocket');
      setIsConnected(true);
      setError(null);
      
      // Autenticar automáticamente
      socket.emit('authenticate', {
        userId,
        userType,
        token
      });
    });

    socket.on('disconnect', () => {
      console.log('💬 Desconectado de WebSocket');
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      setError('Error de conexión al servidor de chat');
      setIsConnected(false);
    });

    // Eventos de autenticación
    socket.on('authenticated', () => {
      console.log('✅ Autenticado en chat');
      setIsAuthenticated(true);
      setError(null);
    });

    socket.on('auth_error', (data) => {
      console.error('Error de autenticación:', data.message);
      setError(`Error de autenticación: ${data.message}`);
      setIsAuthenticated(false);
    });

    // Eventos de chat
    socket.on('chat_history', (data) => {
      console.log('📝 Historial de chat recibido');
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    socket.on('new_message', (data) => {
      console.log('📨 Nuevo mensaje recibido');
      setMessages(prev => [...prev, data.message]);
    });

    socket.on('message_blocked', (data) => {
      console.log('⚠️ Mensaje bloqueado:', data);
      setError(`Mensaje bloqueado: ${data.violations.join(', ')}`);
      if (onMessageBlocked) {
        onMessageBlocked(data);
      }
    });

    socket.on('messages_read', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          data.messageIds.includes(msg._id)
            ? {
                ...msg,
                readBy: [
                  ...msg.readBy,
                  { userId: data.readBy, readAt: new Date().toISOString() }
                ]
              }
            : msg
        )
      );
    });

    // Eventos de estado de usuario
    socket.on('user_online', (data) => {
      console.log(`👤 Usuario ${data.userId} en línea`);
      if (onUserOnline) {
        onUserOnline(data.userId);
      }
    });

    socket.on('user_offline', (data) => {
      console.log(`👤 Usuario ${data.userId} fuera de línea`);
      if (onUserOffline) {
        onUserOffline(data.userId);
      }
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        setOtherUserTyping(data.isTyping);
        
        if (data.isTyping) {
          // Limpiar timeout previo
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Establecer timeout para limpiar estado de typing
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3000);
        }
      }
    });

    socket.on('chat_closed', (data) => {
      console.log('💔 Chat cerrado');
      if (currentChat && currentChat._id === data.chatId) {
        setCurrentChat(prev => prev ? { ...prev, status: 'closed' } : null);
      }
    });

    socket.on('error', (data) => {
      console.error('Error del servidor:', data.message);
      setError(data.message);
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [userId, userType, token, onMessageBlocked, onUserOnline, onUserOffline]);

  // Conectar a un chat específico
  const connectToChat = useCallback(async (chatId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      setError('No hay conexión autenticada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener información del chat
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo información del chat');
      }

      const data = await response.json();
      if (data.success) {
        setCurrentChat(data.data.chat);
        
        // Unirse al chat via WebSocket
        socketRef.current.emit('join_chat', { chatId });
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error conectando al chat:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!socketRef.current || !currentChat || !content.trim()) {
      return;
    }

    setError(null);
    
    socketRef.current.emit('send_message', {
      chatId: currentChat._id,
      content: content.trim(),
      messageType: 'text'
    });
  }, [currentChat]);

  // Marcar mensajes como leídos
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!socketRef.current || !currentChat || messageIds.length === 0) {
      return;
    }

    socketRef.current.emit('mark_as_read', {
      chatId: currentChat._id,
      messageIds
    });
  }, [currentChat]);

  // Establecer estado de typing
  const setTypingStatus = useCallback((typing: boolean) => {
    if (!socketRef.current || !currentChat) {
      return;
    }

    setIsTyping(typing);
    socketRef.current.emit('typing', {
      chatId: currentChat._id,
      isTyping: typing
    });
  }, [currentChat]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setCurrentChat(null);
    setMessages([]);
    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  return {
    isConnected,
    isAuthenticated,
    currentChat,
    messages,
    isLoading,
    error,
    isTyping,
    otherUserTyping,
    connectToChat,
    sendMessage,
    markAsRead,
    setTyping: setTypingStatus,
    disconnect,
    onMessageBlocked,
    onUserOnline,
    onUserOffline
  };
};

