import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Package,
  Users,
  ShoppingCart,
  Bell,
  Filter,
  RefreshCcw,
  Eye,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  Shield,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  specifications: ProductSpecification[];
  compatibleVehicles: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
}

interface ProductSpecification {
  name: string;
  value: string;
}

interface ChatMessage {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  productId?: string;
  productName?: string;
  type: 'text' | 'product_inquiry' | 'price_request' | 'quote_request';
}

interface Quote {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  total: number;
  discount: number;
  finalTotal: number;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  notes?: string;
}

const SellerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showQuotes, setShowQuotes] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const categories = [
    'Motores',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Eléctrico',
    'Filtros',
    'Aceites',
    'Neumáticos',
    'Accesorios',
    'Herramientas',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock products data
      const mockProducts: Product[] = [
        {
          _id: 'prod1',
          name: 'Filtro de Aceite Motor',
          description: 'Filtro de aceite de alta calidad para motores de gasolina',
          price: 25.00,
          originalPrice: 30.00,
          image: '/api/placeholder/200/200',
          category: 'Filtros',
          subcategory: 'Filtros de Aceite',
          brand: 'Mann-Filter',
          stock: 50,
          rating: 4.5,
          reviews: 23,
          specifications: [
            { name: 'Tipo', value: 'Filtro de Aceite' },
            { name: 'Material', value: 'Papel Filtro' },
            { name: 'Compatibilidad', value: 'Toyota Corolla 2015-2020' },
          ],
          compatibleVehicles: ['Toyota Corolla 2015-2020', 'Honda Civic 2016-2021'],
          isOnSale: true,
          discountPercentage: 17,
        },
        {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          description: 'Pastillas de freno cerámicas para mejor rendimiento',
          price: 45.00,
          image: '/api/placeholder/200/200',
          category: 'Frenos',
          subcategory: 'Pastillas de Freno',
          brand: 'Brembo',
          stock: 30,
          rating: 4.8,
          reviews: 45,
          specifications: [
            { name: 'Tipo', value: 'Pastillas Cerámicas' },
            { name: 'Material', value: 'Cerámica' },
            { name: 'Compatibilidad', value: 'Nissan Sentra 2014-2019' },
          ],
          compatibleVehicles: ['Nissan Sentra 2014-2019', 'Mazda 3 2013-2018'],
        },
        {
          _id: 'prod3',
          name: 'Batería 12V 60Ah',
          description: 'Batería de plomo-ácido para vehículos',
          price: 120.00,
          image: '/api/placeholder/200/200',
          category: 'Eléctrico',
          subcategory: 'Baterías',
          brand: 'ACDelco',
          stock: 15,
          rating: 4.3,
          reviews: 67,
          specifications: [
            { name: 'Voltaje', value: '12V' },
            { name: 'Capacidad', value: '60Ah' },
            { name: 'Tipo', value: 'Plomo-Ácido' },
          ],
          compatibleVehicles: ['Chevrolet Aveo 2010-2015', 'Ford Focus 2012-2018'],
        },
      ];

      // Mock chat messages
      const mockChatMessages: ChatMessage[] = [
        {
          _id: 'msg1',
          customerId: 'cust1',
          customerName: 'Juan Pérez',
          customerPhone: '0412-1234567',
          message: 'Hola, necesito información sobre filtros de aceite para mi Toyota Corolla 2018',
          timestamp: '2023-10-26T14:30:00Z',
          isRead: false,
          productId: 'prod1',
          productName: 'Filtro de Aceite Motor',
          type: 'product_inquiry',
        },
        {
          _id: 'msg2',
          customerId: 'cust2',
          customerName: 'María García',
          customerPhone: '0424-9876543',
          message: '¿Cuál es el precio de las pastillas de freno Brembo?',
          timestamp: '2023-10-26T13:45:00Z',
          isRead: true,
          productId: 'prod2',
          productName: 'Pastillas de Freno Delanteras',
          type: 'price_request',
        },
        {
          _id: 'msg3',
          customerId: 'cust3',
          customerName: 'Carlos Ruiz',
          customerPhone: '0416-5554433',
          message: 'Necesito una cotización para cambio completo de frenos',
          timestamp: '2023-10-26T12:15:00Z',
          isRead: false,
          type: 'quote_request',
        },
      ];

      // Mock quotes
      const mockQuotes: Quote[] = [
        {
          _id: 'quote1',
          customerId: 'cust1',
          customerName: 'Juan Pérez',
          customerPhone: '0412-1234567',
          customerEmail: 'juan.perez@email.com',
          products: [
            {
              productId: 'prod1',
              productName: 'Filtro de Aceite Motor',
              quantity: 2,
              unitPrice: 25.00,
              totalPrice: 50.00,
            },
            {
              productId: 'prod2',
              productName: 'Pastillas de Freno Delanteras',
              quantity: 1,
              unitPrice: 45.00,
              totalPrice: 45.00,
            },
          ],
          total: 95.00,
          discount: 10.00,
          finalTotal: 85.00,
          status: 'pending',
          createdAt: '2023-10-26T14:30:00Z',
          expiresAt: '2023-10-28T14:30:00Z',
          notes: 'Descuento especial por compra múltiple',
        },
      ];

      setProducts(mockProducts);
      setChatMessages(mockChatMessages);
      setQuotes(mockQuotes);
    } catch (err) {
      setError('Error al cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSendMessage = async (customerId: string, message: string) => {
    if (!message.trim()) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMessage: ChatMessage = {
        _id: `msg${Date.now()}`,
        customerId,
        customerName: chatMessages.find(m => m.customerId === customerId)?.customerName || 'Cliente',
        customerPhone: chatMessages.find(m => m.customerId === customerId)?.customerPhone || '',
        message,
        timestamp: new Date().toISOString(),
        isRead: true,
        type: 'text',
      };

      setChatMessages(prev => [...prev, newMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  };

  const handleCreateQuote = async (customerId: string, productIds: string[]) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedProducts = products.filter(p => productIds.includes(p._id));
      const quoteProducts = selectedProducts.map(product => ({
        productId: product._id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      }));

      const total = quoteProducts.reduce((sum, p) => sum + p.totalPrice, 0);
      const discount = total * 0.1; // 10% discount
      const finalTotal = total - discount;

      const newQuote: Quote = {
        _id: `quote${Date.now()}`,
        customerId,
        customerName: chatMessages.find(m => m.customerId === customerId)?.customerName || 'Cliente',
        customerPhone: chatMessages.find(m => m.customerId === customerId)?.customerPhone || '',
        customerEmail: `${customerId}@email.com`,
        products: quoteProducts,
        total,
        discount,
        finalTotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      };

      setQuotes(prev => [...prev, newQuote]);
      alert('Cotización creada exitosamente');
    } catch (err) {
      console.error('Error creando cotización:', err);
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'sent':
        return Send;
      case 'accepted':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'expired':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Vendedor</h1>
          <p className="text-gray-600 mt-2">Consulta precios y atiende clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuotes(!showQuotes)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Cotizaciones</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat ({chatMessages.filter(m => !m.isRead).length})</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mensajes Sin Leer</p>
              <p className="text-2xl font-bold text-gray-900">
                {chatMessages.filter(m => !m.isRead).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cotizaciones Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {quotes.filter(q => q.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
              <p className="text-2xl font-bold text-gray-900">4.7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Búsqueda de Productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Consulta de Precios</h2>
              <p className="text-gray-600 mt-1">Busca productos y consulta precios para clientes</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat de Clientes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Chat con Clientes</h2>
              <p className="text-gray-600 mt-1">Atiende consultas en tiempo real</p>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chatMessages.map(message => (
                  <div
                    key={message._id}
                    className={`p-3 rounded-lg ${
                      message.isRead 
                        ? 'bg-gray-50' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.customerName}
                          </span>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                        {message.productName && (
                          <p className="text-xs text-blue-600 mt-1">
                            Producto: {message.productName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCustomer(message.customerId)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Marca:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.brand}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Categoría:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Stock:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedProduct.stock} unidades</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Calificación:</span>
                      <div className="flex items-center ml-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-900">{selectedProduct.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({selectedProduct.reviews} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Especificaciones</h3>
                    <div className="space-y-2">
                      {selectedProduct.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-gray-600">{spec.name}:</span>
                          <span className="text-sm text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Vehículos Compatibles</h3>
                    <div className="space-y-1">
                      {selectedProduct.compatibleVehicles.map((vehicle, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {vehicle}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        // Lógica para crear cotización
                        alert('Cotización creada para este producto');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Cotización
                    </button>
                    <button
                      onClick={() => {
                        // Lógica para enviar por chat
                        alert('Producto enviado por chat');
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Enviar por Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Chat */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Chat con Cliente</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages
                  .filter(m => m.customerId === selectedCustomer)
                  .map(message => (
                    <div
                      key={message._id}
                      className={`p-3 rounded-lg ${
                        message.type === 'text' 
                          ? 'bg-blue-100 ml-8' 
                          : 'bg-gray-100 mr-8'
                      }`}
                    >
                      <p className="text-sm text-gray-900">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(selectedCustomer, newMessage);
                    }
                  }}
                />
                <button
                  onClick={() => handleSendMessage(selectedCustomer, newMessage)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
