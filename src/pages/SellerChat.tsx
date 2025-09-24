import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  User,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Star,
  FileText,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Archive,
  Pin,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ChatMessage {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isFromCustomer: boolean;
  productId?: string;
  productName?: string;
  type: 'text' | 'product_inquiry' | 'price_request' | 'quote_request' | 'image' | 'file';
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  rating: number;
}

const SellerChat: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: 'all', label: 'Todos los chats' },
    { value: 'unread', label: 'No leídos' },
    { value: 'online', label: 'En línea' },
    { value: 'pinned', label: 'Fijados' },
    { value: 'archived', label: 'Archivados' },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock customers data
      const mockCustomers: Customer[] = [
        {
          _id: 'cust1',
          name: 'Juan Pérez',
          phone: '0412-1234567',
          email: 'juan.perez@email.com',
          avatar: '/api/placeholder/40/40',
          lastMessage: 'Necesito información sobre filtros de aceite para mi Toyota Corolla 2018',
          lastMessageTime: '2023-10-26T14:30:00Z',
          unreadCount: 2,
          isOnline: true,
          isPinned: false,
          isArchived: false,
          tags: ['VIP', 'Frecuente'],
          totalOrders: 15,
          totalSpent: 1250.00,
          rating: 4.8,
        },
        {
          _id: 'cust2',
          name: 'María García',
          phone: '0424-9876543',
          email: 'maria.garcia@email.com',
          avatar: '/api/placeholder/40/40',
          lastMessage: '¿Cuál es el precio de las pastillas de freno Brembo?',
          lastMessageTime: '2023-10-26T13:45:00Z',
          unreadCount: 0,
          isOnline: false,
          isPinned: true,
          isArchived: false,
          tags: ['Nuevo'],
          totalOrders: 3,
          totalSpent: 180.00,
          rating: 4.5,
        },
        {
          _id: 'cust3',
          name: 'Carlos Ruiz',
          phone: '0416-5554433',
          email: 'carlos.ruiz@email.com',
          avatar: '/api/placeholder/40/40',
          lastMessage: 'Necesito una cotización para cambio completo de frenos',
          lastMessageTime: '2023-10-26T12:15:00Z',
          unreadCount: 1,
          isOnline: true,
          isPinned: false,
          isArchived: false,
          tags: ['Cotización'],
          totalOrders: 8,
          totalSpent: 650.00,
          rating: 4.2,
        },
        {
          _id: 'cust4',
          name: 'Ana López',
          phone: '0426-7778899',
          email: 'ana.lopez@email.com',
          avatar: '/api/placeholder/40/40',
          lastMessage: '¿Tienen aceite para motor 5W-30?',
          lastMessageTime: '2023-10-25T16:20:00Z',
          unreadCount: 0,
          isOnline: false,
          isPinned: false,
          isArchived: true,
          tags: ['Consulta'],
          totalOrders: 1,
          totalSpent: 45.00,
          rating: 4.0,
        },
      ];

      setCustomers(mockCustomers);
    } catch (err) {
      setError('Error al cargar los clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock messages data
      const mockMessages: ChatMessage[] = [
        {
          _id: 'msg1',
          customerId,
          customerName: customers.find(c => c._id === customerId)?.name || 'Cliente',
          customerPhone: customers.find(c => c._id === customerId)?.phone || '',
          customerEmail: customers.find(c => c._id === customerId)?.email || '',
          message: 'Hola, necesito información sobre filtros de aceite para mi Toyota Corolla 2018',
          timestamp: '2023-10-26T14:30:00Z',
          isRead: true,
          isFromCustomer: true,
          productId: 'prod1',
          productName: 'Filtro de Aceite Motor',
          type: 'product_inquiry',
        },
        {
          _id: 'msg2',
          customerId,
          customerName: customers.find(c => c._id === customerId)?.name || 'Cliente',
          customerPhone: customers.find(c => c._id === customerId)?.phone || '',
          customerEmail: customers.find(c => c._id === customerId)?.email || '',
          message: 'Perfecto, tenemos el filtro Mann-Filter compatible con tu Toyota Corolla 2018. El precio es $25.00 y tenemos stock disponible.',
          timestamp: '2023-10-26T14:32:00Z',
          isRead: true,
          isFromCustomer: false,
          type: 'text',
        },
        {
          _id: 'msg3',
          customerId,
          customerName: customers.find(c => c._id === customerId)?.name || 'Cliente',
          customerPhone: customers.find(c => c._id === customerId)?.phone || '',
          customerEmail: customers.find(c => c._id === customerId)?.email || '',
          message: '¿Pueden hacer descuento si compro 2 filtros?',
          timestamp: '2023-10-26T14:35:00Z',
          isRead: false,
          isFromCustomer: true,
          type: 'price_request',
        },
      ];

      setMessages(mockMessages);
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const message: ChatMessage = {
        _id: `msg${Date.now()}`,
        customerId: selectedCustomer,
        customerName: customers.find(c => c._id === selectedCustomer)?.name || 'Cliente',
        customerPhone: customers.find(c => c._id === selectedCustomer)?.phone || '',
        customerEmail: customers.find(c => c._id === selectedCustomer)?.email || '',
        message: newMessage,
        timestamp: new Date().toISOString(),
        isRead: true,
        isFromCustomer: false,
        type: 'text',
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate customer typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate customer response
        const customerResponse: ChatMessage = {
          _id: `msg${Date.now() + 1}`,
          customerId: selectedCustomer,
          customerName: customers.find(c => c._id === selectedCustomer)?.name || 'Cliente',
          customerPhone: customers.find(c => c._id === selectedCustomer)?.phone || '',
          customerEmail: customers.find(c => c._id === selectedCustomer)?.email || '',
          message: 'Gracias por la información. ¿Puedo pasar a recogerlo mañana?',
          timestamp: new Date(Date.now() + 2000).toISOString(),
          isRead: false,
          isFromCustomer: true,
          type: 'text',
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 3000);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterStatus) {
      case 'unread':
        matchesFilter = customer.unreadCount > 0;
        break;
      case 'online':
        matchesFilter = customer.isOnline;
        break;
      case 'pinned':
        matchesFilter = customer.isPinned;
        break;
      case 'archived':
        matchesFilter = customer.isArchived;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // Pinned customers first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by unread count
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    
    // Finally by last message time
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  const selectedCustomerData = customers.find(c => c._id === selectedCustomer);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchCustomers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-gray-100 flex">
      {/* Lista de clientes */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat con Clientes</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtros */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 overflow-y-auto">
          {sortedCustomers.map(customer => (
            <div
              key={customer._id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedCustomer === customer._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
              onClick={() => setSelectedCustomer(customer._id)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {customer.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {customer.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {customer.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                      {customer.unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                          {customer.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {customer.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(customer.lastMessageTime).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-gray-500">{customer.rating}</span>
                    </div>
                  </div>
                  {customer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customer.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Header del chat */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedCustomerData?.avatar}
                    alt={selectedCustomerData?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedCustomerData?.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        selectedCustomerData?.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCustomerData?.isOnline ? 'En línea' : 'Desconectado'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedCustomerData?.totalOrders} órdenes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isFromCustomer
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.type === 'product_inquiry' && (
                      <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                        <Package className="w-4 h-4 inline mr-1" />
                        <span className="text-sm font-medium">{message.productName}</span>
                      </div>
                    )}
                    {message.type === 'price_request' && (
                      <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        <span className="text-sm font-medium">Solicitud de precio</span>
                      </div>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.isFromCustomer ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un cliente para comenzar el chat
              </h3>
              <p className="text-gray-500">
                Elige un cliente de la lista para ver su historial de conversación
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerChat;
