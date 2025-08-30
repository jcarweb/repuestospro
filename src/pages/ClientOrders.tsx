import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Eye, 
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  CreditCard,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';


interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  rating?: number;
  review?: string;
}

const ClientOrders: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de pedidos con traducciones
  const orderStatuses = [
    { value: 'all', label: t('orders.status.all'), icon: Package, color: 'text-gray-600' },
    { value: 'pending', label: t('orders.status.pending'), icon: Clock, color: 'text-yellow-600' },
    { value: 'confirmed', label: t('orders.status.confirmed'), icon: CheckCircle, color: 'text-blue-600' },
    { value: 'processing', label: t('orders.status.processing'), icon: Package, color: 'text-purple-600' },
    { value: 'shipped', label: t('orders.status.shipped'), icon: Truck, color: 'text-orange-600' },
    { value: 'delivered', label: t('orders.status.delivered'), icon: CheckCircle, color: 'text-green-600' },
    { value: 'cancelled', label: t('orders.status.cancelled'), icon: XCircle, color: 'text-red-600' }
  ];

  // Datos de ejemplo
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 245.50,
        items: [
          {
            id: '1',
            name: 'Filtro de Aceite Motor',
            price: 45.50,
            quantity: 2,
            image: '/placeholder-product.jpg',
            brand: 'Bosch'
          },
          {
            id: '2',
            name: 'Pastillas de Freno Delanteras',
            price: 77.25,
            quantity: 1,
            image: '/placeholder-product.jpg',
            brand: 'Brembo'
          }
        ],
        shippingAddress: 'Av. Principal 123, Caracas, Venezuela',
        paymentMethod: 'Tarjeta de Crédito',
        estimatedDelivery: '2024-01-20',
        trackingNumber: 'TRK-123456789',
        rating: 5,
        review: 'Excelente servicio, productos de calidad'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        date: '2024-01-20',
        status: 'shipped',
        total: 89.99,
        items: [
          {
            id: '3',
            name: 'Batería Automotriz 12V',
            price: 89.99,
            quantity: 1,
            image: '/placeholder-product.jpg',
            brand: 'ACDelco'
          }
        ],
        shippingAddress: 'Calle Comercial 456, Valencia, Venezuela',
        paymentMethod: 'Transferencia Bancaria',
        estimatedDelivery: '2024-01-25',
        trackingNumber: 'TRK-987654321'
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        date: '2024-01-22',
        status: 'processing',
        total: 156.75,
        items: [
          {
            id: '4',
            name: 'Kit de Embrague Completo',
            price: 156.75,
            quantity: 1,
            image: '/placeholder-product.jpg',
            brand: 'LUK'
          }
        ],
        shippingAddress: 'Urbanización Los Rosales 789, Maracay, Venezuela',
        paymentMethod: 'Efectivo',
        estimatedDelivery: '2024-01-28'
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        date: '2024-01-18',
        status: 'cancelled',
        total: 67.80,
        items: [
          {
            id: '5',
            name: 'Aceite de Motor Sintético',
            price: 33.90,
            quantity: 2,
            image: '/placeholder-product.jpg',
            brand: 'Mobil'
          }
        ],
        shippingAddress: 'Plaza Bolívar 321, Barquisimeto, Venezuela',
        paymentMethod: 'Tarjeta de Débito'
      }
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
    setLoading(false);
  }, []);

  // Filtrar pedidos
  useEffect(() => {
    let filtered = orders;

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm]);

  const getStatusIcon = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    if (statusConfig) {
      const Icon = statusConfig.icon;
      return <Icon className={`w-5 h-5 ${statusConfig.color}`} />;
    }
    return <Package className="w-5 h-5 text-gray-600" />;
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return statusConfig?.label || 'Desconocido';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return statusConfig?.color || 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      // Mostrar indicador de carga
      const button = document.querySelector(`[data-order-id="${orderId}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = `
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
          ${t('orders.downloading')}
        `;
      }

      // Simular llamada al backend para generar factura
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar factura en PDF
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Orden no encontrada');
      }

      // Crear contenido de la factura como HTML
      const invoiceHTML = generateInvoiceHTML(order);
      
      // Crear un elemento temporal para renderizar el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = invoiceHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Convertir HTML a PDF usando la API de impresión del navegador
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        
        // Esperar a que se cargue el contenido
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }

      // Limpiar elemento temporal
      document.body.removeChild(tempDiv);

      // Mostrar mensaje de éxito
      showNotification(t('orders.download.success'), 'success');

    } catch (error) {
      console.error('Error al descargar factura:', error);
      showNotification(t('orders.download.error'), 'error');
    } finally {
      // Restaurar botón
      const button = document.querySelector(`[data-order-id="${orderId}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = `
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          ${t('orders.actions.download')}
        `;
      }
    }
  };

  const generateInvoiceHTML = (order: Order): string => {
    // Generar contenido HTML de la factura optimizado para impresión
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${order.orderNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: black;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #FFC300; 
            padding-bottom: 20px; 
          }
          
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #FFC300; 
            margin-bottom: 10px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 0;
          }
          
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            gap: 40px;
          }
          
          .customer-info, .invoice-details { 
            flex: 1; 
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #FFC300;
            padding-bottom: 5px;
          }
          
          .info-row {
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            background: white;
          }
          
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          
          .items-table th { 
            background-color: #FFC300; 
            color: black;
            font-weight: bold;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .total { 
            text-align: right; 
            font-size: 20px; 
            font-weight: bold; 
            background: #FFC300;
            color: black;
            padding: 15px;
            border-radius: 8px;
          }
          
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FFC300;
            color: black;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
          }
          
          .print-button:hover {
            background: #e6b800;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir Factura</button>
        
        <div class="header">
          <div class="logo">PIEZAS YA</div>
          <h1 class="invoice-title">FACTURA</h1>
        </div>
        
        <div class="invoice-info">
          <div class="customer-info">
            <h3 class="section-title">Información del Cliente</h3>
            <div class="info-row">
              <span class="info-label">Nombre:</span> ${user?.name || 'Cliente'}
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span> ${user?.email || 'N/A'}
            </div>
            <div class="info-row">
              <span class="info-label">Dirección:</span> ${order.shippingAddress}
            </div>
          </div>
          <div class="invoice-details">
            <h3 class="section-title">Detalles de la Factura</h3>
            <div class="info-row">
              <span class="info-label">Número de Factura:</span> ${order.orderNumber}
            </div>
            <div class="info-row">
              <span class="info-label">Fecha:</span> ${formatDate(order.date)}
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span> ${getStatusLabel(order.status)}
            </div>
            <div class="info-row">
              <span class="info-label">Método de Pago:</span> ${order.paymentMethod}
            </div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.brand || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>TOTAL: $${order.total.toFixed(2)}</p>
        </div>
        
        <div class="footer">
          <p><strong>Gracias por su compra en PIEZAS YA</strong></p>
          <p>Para consultas: soporte@piezasyaya.com</p>
          <p>Teléfono: +58 212-123-4567</p>
        </div>
      </body>
      </html>
    `;

    return invoiceHTML;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const handleRateOrder = (order: Order) => {
    // Implementar sistema de calificación
    console.log('Calificando orden:', order.id);
    alert('Sistema de calificación en desarrollo');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('orders.title')}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('orders.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('orders.total')}: {filteredOrders.length}
          </span>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('orders.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Filtro de estado */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron pedidos
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no has realizado ningún pedido'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow hover:shadow-md transition-shadow`}>
              <div className="p-6">
                {/* Header del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {order.orderNumber}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${order.total.toFixed(2)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Productos */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {item.name} x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{order.paymentMethod}</span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Entrega estimada: {formatDate(order.estimatedDelivery)}
                      </span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Tracking: {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Calificación si está entregado */}
                {order.status === 'delivered' && order.rating && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-green-700">
                        Calificación: {order.rating}/5 estrellas
                      </span>
                    </div>
                    {order.review && (
                      <p className="text-sm text-green-600 mt-1">
                        "{order.review}"
                      </p>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC300] ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t('orders.actions.view')}
                  </button>
                  
                  <button
                    onClick={() => handleDownloadInvoice(order.id)}
                    data-order-id={order.id}
                    className="inline-flex items-center px-3 py-2 bg-[#FFC300] text-black rounded-md text-sm font-medium hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('orders.actions.download')}
                  </button>

                  {order.status === 'delivered' && !order.rating && (
                    <button
                      onClick={() => handleRateOrder(order)}
                      className="inline-flex items-center px-3 py-2 border border-[#FFC300] rounded-md text-sm font-medium text-[#FFC300] bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {t('orders.actions.rate')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Pedido {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Pedido</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de orden:</span>
                      <span className="font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Envío</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Dirección:</span>
                      <p className="font-medium">{selectedOrder.shippingAddress}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Método de pago:</span>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <div>
                        <span className="text-gray-600">Entrega estimada:</span>
                        <p className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</p>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div>
                        <span className="text-gray-600">Número de seguimiento:</span>
                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        {item.brand && (
                          <p className="text-sm text-gray-500">Marca: {item.brand}</p>
                        )}
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calificación si está entregado */}
              {selectedOrder.status === 'delivered' && selectedOrder.rating && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu Calificación</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < selectedOrder.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600">
                      {selectedOrder.rating}/5 estrellas
                    </span>
                  </div>
                  {selectedOrder.review && (
                    <p className="text-gray-700 italic">"{selectedOrder.review}"</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  data-order-id={selectedOrder.id}
                  className="px-4 py-2 bg-[#FFC300] text-black rounded-md text-sm font-medium hover:bg-yellow-400"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  {t('orders.actions.download')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrders;
