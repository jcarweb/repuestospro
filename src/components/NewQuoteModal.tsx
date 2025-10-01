import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Download,
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  Clock,
  User,
  Phone,
  Mail as MailIcon,
  Settings,
  HelpCircle,
  Save,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Tag,
  Hash,
  QrCode,
  Star,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import StoreSellerInfo from './StoreSellerInfo';

interface Product {
  _id: string;
  name: string;
  sku: string;
  originalCode: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  brand: string;
  description?: string;
}

interface QuoteItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: any) => void;
}

const NewQuoteModal: React.FC<NewQuoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  
  // Estados principales
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  
  // Configuración de la cotización
  const [quoteConfig, setQuoteConfig] = useState({
    validityDays: 7,
    notes: '',
    terms: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    taxRate: 16,
    showPrices: true,
    showStock: false,
    includeImages: true,
    includeDescriptions: true
  });
  
  // Estados de UI
  const [showTutorial, setShowTutorial] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customConditions, setCustomConditions] = useState<any[]>([]);

  // Datos de la tienda y vendedor
  const [storeInfo, setStoreInfo] = useState({
    _id: 'store1',
    name: 'PiezasYA - Repuestos Automotrices',
    address: 'Av. Principal 123, Caracas, Venezuela',
    phone: '+58 212-1234567',
    email: 'ventas@piezasy.com',
    website: 'www.piezasy.com',
    logo: '/logo-piezasya.png',
    ruc: 'J-12345678-9',
    description: 'Repuestos Automotrices de Calidad',
    businessHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '8:00 AM - 2:00 PM',
      sunday: 'Cerrado'
    },
    socialMedia: {
      facebook: 'PiezasYA',
      instagram: '@piezasy',
      whatsapp: '+58 212-1234567'
    }
  });

  const [sellerInfo, setSellerInfo] = useState({
    _id: 'seller1',
    name: 'Juan Pérez',
    email: 'juan.perez@piezasy.com',
    phone: '+58 412-1234567',
    role: 'seller' as 'seller' | 'store_manager',
    avatar: '/uploads/perfil/default-avatar.svg',
    employeeId: 'EMP-001',
    department: 'Ventas',
    signature: 'Juan Pérez - Vendedor'
  });

  // Cargar productos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCustomConditions();
    }
  }, [isOpen]);

  // Cargar condiciones personalizadas
  const loadCustomConditions = async () => {
    try {
      // Simular carga de condiciones personalizadas
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockConditions = [
        {
          _id: 'cond1',
          title: 'Validez de la Cotización',
          content: 'Esta cotización tiene una validez de {days} días a partir de la fecha de emisión.',
          isActive: true,
          category: 'validity',
          order: 1
        },
        {
          _id: 'cond2',
          title: 'Precios Sujetos a Cambios',
          content: 'Los precios están sujetos a cambios sin previo aviso debido a fluctuaciones del mercado.',
          isActive: true,
          category: 'general',
          order: 2
        },
        {
          _id: 'cond3',
          title: 'Condiciones de Pago',
          content: 'El pago debe realizarse según las condiciones acordadas. Se aceptan transferencias bancarias y efectivo.',
          isActive: true,
          category: 'payment',
          order: 3
        },
        {
          _id: 'cond4',
          title: 'Tiempos de Entrega',
          content: 'Los tiempos de entrega son estimados y pueden variar según disponibilidad de stock.',
          isActive: true,
          category: 'delivery',
          order: 4
        }
      ];

      setCustomConditions(mockConditions);
    } catch (error) {
      console.error('Error loading custom conditions:', error);
    }
  };

  // Búsqueda de productos
  const searchProducts = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simular búsqueda de productos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - en producción vendría del backend
      const mockProducts: Product[] = [
        {
          _id: 'prod1',
          name: 'Filtro de Aceite Motor',
          sku: 'FIL-001',
          originalCode: '12345',
          price: 25.00,
          stock: 50,
          image: '/api/placeholder/60/60',
          category: 'Filtros',
          brand: 'Mann Filter',
          description: 'Filtro de aceite para motor diesel'
        },
        {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          sku: 'PAS-002',
          originalCode: '67890',
          price: 45.00,
          stock: 25,
          image: '/api/placeholder/60/60',
          category: 'Frenos',
          brand: 'Brembo',
          description: 'Pastillas de freno delanteras para vehículos ligeros'
        },
        {
          _id: 'prod3',
          name: 'Batería 12V 60Ah',
          sku: 'BAT-003',
          originalCode: '11111',
          price: 120.00,
          stock: 15,
          image: '/api/placeholder/60/60',
          category: 'Baterías',
          brand: 'Varta',
          description: 'Batería de 12V 60Ah para automóviles'
        }
      ];

      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.sku.toLowerCase().includes(term.toLowerCase()) ||
        product.originalCode.toLowerCase().includes(term.toLowerCase()) ||
        product.brand.toLowerCase().includes(term.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Cargar productos iniciales
  const loadProducts = async () => {
    try {
      // Simular carga de productos populares
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockProducts: Product[] = [
        {
          _id: 'prod1',
          name: 'Filtro de Aceite Motor',
          sku: 'FIL-001',
          originalCode: '12345',
          price: 25.00,
          stock: 50,
          image: '/api/placeholder/60/60',
          category: 'Filtros',
          brand: 'Mann Filter',
          description: 'Filtro de aceite para motor diesel'
        },
        {
          _id: 'prod2',
          name: 'Pastillas de Freno Delanteras',
          sku: 'PAS-002',
          originalCode: '67890',
          price: 45.00,
          stock: 25,
          image: '/api/placeholder/60/60',
          category: 'Frenos',
          brand: 'Brembo',
          description: 'Pastillas de freno delanteras para vehículos ligeros'
        }
      ];
      setSearchResults(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Agregar producto a la cotización
  const addProductToQuote = (product: Product) => {
    const existingItem = quoteItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      setQuoteItems(prev => prev.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: QuoteItem = {
        product,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        notes: ''
      };
      setQuoteItems(prev => [...prev, newItem]);
    }
  };

  // Actualizar cantidad de producto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromQuote(productId);
      return;
    }

    setQuoteItems(prev => prev.map(item => 
      item.product._id === productId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  // Remover producto de la cotización
  const removeProductFromQuote = (productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.product._id !== productId));
  };

  // Actualizar precio unitario
  const updateUnitPrice = (productId: string, price: number) => {
    setQuoteItems(prev => prev.map(item => 
      item.product._id === productId 
        ? { ...item, unitPrice: price, totalPrice: item.quantity * price }
        : item
    ));
  };

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = quoteConfig.discountType === 'percentage' 
      ? (subtotal * quoteConfig.discount) / 100
      : quoteConfig.discount;
    const tax = (subtotal - discount) * (quoteConfig.taxRate / 100);
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  // Guardar cotización
  const handleSaveQuote = async () => {
    if (!selectedCustomer || quoteItems.length === 0) {
      alert(t('quotes.newQuote.validation.required') || 'Debe seleccionar un cliente y agregar al menos un producto');
      return;
    }

    setIsSaving(true);
    try {
      const totals = calculateTotals();
      const quoteData = {
        customer: selectedCustomer,
        items: quoteItems,
        config: quoteConfig,
        totals,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(quoteData);
      onClose();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert(t('quotes.newQuote.errors.save') || 'Error al guardar la cotización');
    } finally {
      setIsSaving(false);
    }
  };

  // Búsqueda de clientes
  const searchCustomers = async (term: string) => {
    if (term.length < 2) {
      setCustomerResults([]);
      return;
    }

    try {
      // Simular búsqueda de clientes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockCustomers: Customer[] = [
        {
          _id: 'cust1',
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '0412-1234567',
          address: 'Caracas, Venezuela'
        },
        {
          _id: 'cust2',
          name: 'María García',
          email: 'maria.garcia@email.com',
          phone: '0424-9876543',
          address: 'Valencia, Venezuela'
        },
        {
          _id: 'cust3',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          phone: '0416-5555555',
          address: 'Maracaibo, Venezuela'
        },
        {
          _id: 'cust4',
          name: 'Ana López',
          email: 'ana.lopez@email.com',
          phone: '0426-7777777',
          address: 'Barquisimeto, Venezuela'
        }
      ];

      const filtered = mockCustomers.filter(customer => 
        customer.name.toLowerCase().includes(term.toLowerCase()) ||
        customer.email.toLowerCase().includes(term.toLowerCase()) ||
        customer.phone.includes(term)
      );

      setCustomerResults(filtered);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  // Seleccionar cliente
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
    setCustomerResults([]);
  };

  // Crear nuevo cliente
  const createNewCustomer = () => {
    const newCustomer: Customer = {
      _id: `cust${Date.now()}`,
      name: customerSearchTerm,
      email: '',
      phone: '',
      address: ''
    };
    setSelectedCustomer(newCustomer);
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
    setCustomerResults([]);
  };

  if (!isOpen) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('quotes.newQuote.title') || 'Nueva Cotización'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('quotes.newQuote.subtitle') || 'Crea una cotización personalizada para tu cliente'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#FFC300] transition-colors"
              title={t('quotes.newQuote.tutorial') || 'Tutorial'}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex h-[calc(95vh-120px)]">
          {/* Panel izquierdo - Búsqueda de productos */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-600 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('quotes.newQuote.searchProducts') || 'Buscar Productos'}
              </h3>
              
              {/* Barra de búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('quotes.newQuote.searchPlaceholder') || 'Buscar por nombre, SKU, código original...'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchProducts(e.target.value);
                  }}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFC300]"></div>
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map(product => (
                  <div key={product._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#555555] rounded-lg hover:bg-gray-100 dark:hover:bg-[#666666] transition-colors">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Hash className="w-3 h-3 mr-1" />
                          {product.sku}
                        </span>
                        <span className="flex items-center">
                          <QrCode className="w-3 h-3 mr-1" />
                          {product.originalCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-[#FFC300]">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {product.stock} en stock
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addProductToQuote(product)}
                      className="p-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho - Cotización */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {/* Información del cliente */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('quotes.newQuote.customerInfo') || 'Información del Cliente'}
              </h3>
              
              {selectedCustomer ? (
                <div className="p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#FFC300] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#333333]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {selectedCustomer.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedCustomer.email} • {selectedCustomer.phone}
                        </p>
                        {selectedCustomer.address && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedCustomer.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowCustomerSearch(true)}
                        className="p-2 text-gray-500 hover:text-[#FFC300] transition-colors"
                        title={t('quotes.newQuote.changeCustomer') || 'Cambiar Cliente'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title={t('quotes.newQuote.removeCustomer') || 'Remover Cliente'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowCustomerSearch(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-[#FFC300] hover:text-[#FFC300] transition-colors"
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <span>{t('quotes.newQuote.selectCustomer') || 'Seleccionar Cliente'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Productos en la cotización */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('quotes.newQuote.quoteItems') || 'Productos en la Cotización'} ({quoteItems.length})
              </h3>
              
              {quoteItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('quotes.newQuote.noItems') || 'No hay productos en la cotización'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quoteItems.map(item => (
                    <div key={item.product._id} className="p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                      <div className="flex items-start space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.product.sku} • {item.product.brand}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Precio:</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateUnitPrice(item.product._id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded"
                              step="0.01"
                            />
                          </div>
                          <div className="text-sm font-semibold text-[#FFC300]">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeProductFromQuote(item.product._id)}
                            className="text-red-600 hover:text-red-700 transition-colors mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen de totales */}
            {quoteItems.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('quotes.newQuote.summary') || 'Resumen'}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${totals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Descuento:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      -${totals.discount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Impuestos:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${totals.tax.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-[#FFC300]">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Configuración de la cotización */}
            <div className="mb-6">
              <button
                onClick={() => setShowConditions(!showConditions)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-[#555555] rounded-lg hover:bg-gray-100 dark:hover:bg-[#666666] transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('quotes.newQuote.configuration') || 'Configuración'}
                </span>
                {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showConditions && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('quotes.newQuote.validityDays') || 'Días de validez'}
                      </label>
                      <input
                        type="number"
                        value={quoteConfig.validityDays}
                        onChange={(e) => setQuoteConfig(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                        min="1"
                        max="365"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('quotes.newQuote.discount') || 'Descuento'}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={quoteConfig.discount}
                          onChange={(e) => setQuoteConfig(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                          step="0.01"
                        />
                        <select
                          value={quoteConfig.discountType}
                          onChange={(e) => setQuoteConfig(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('quotes.newQuote.notes') || 'Notas'}
                    </label>
                    <textarea
                      value={quoteConfig.notes}
                      onChange={(e) => setQuoteConfig(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                      rows={3}
                      placeholder={t('quotes.newQuote.notesPlaceholder') || 'Notas adicionales para la cotización...'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveQuote}
                disabled={!selectedCustomer || quoteItems.length === 0 || isSaving}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333333]"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{t('quotes.newQuote.save') || 'Guardar Cotización'}</span>
              </button>
              
              <button
                onClick={() => setShowPreview(true)}
                disabled={quoteItems.length === 0}
                className="px-4 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Selección de Clientes */}
        {showCustomerSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('quotes.newQuote.selectCustomer') || 'Seleccionar Cliente'}
                  </h3>
                  <button
                    onClick={() => setShowCustomerSearch(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Barra de búsqueda de clientes */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('quotes.newQuote.searchCustomerPlaceholder') || 'Buscar cliente por nombre, email o teléfono...'}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value);
                      searchCustomers(e.target.value);
                    }}
                  />
                </div>

                {/* Resultados de búsqueda */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customerResults.map(customer => (
                    <div
                      key={customer._id}
                      onClick={() => selectCustomer(customer)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-[#555555] rounded-lg hover:bg-gray-100 dark:hover:bg-[#666666] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-[#FFC300] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#333333]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {customer.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.phone} • {customer.address}
                        </p>
                      </div>
                      <button className="p-2 text-[#FFC300] hover:text-[#E6B800] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {customerSearchTerm.length >= 2 && customerResults.length === 0 && (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {t('quotes.newQuote.noCustomersFound') || 'No se encontraron clientes'}
                      </p>
                      <button
                        onClick={createNewCustomer}
                        className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
                      >
                        {t('quotes.newQuote.createNewCustomer') || 'Crear Nuevo Cliente'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('quotes.newQuote.preview') || 'Vista Previa de la Cotización'}
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                {/* Información de la tienda y vendedor */}
                <StoreSellerInfo
                  storeInfo={storeInfo}
                  sellerInfo={sellerInfo}
                  quoteNumber={`COT-2023-${String(Date.now()).slice(-3)}`}
                  quoteDate={new Date().toISOString()}
                  className="mb-6"
                />

                {/* Información del cliente */}
                {selectedCustomer && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {t('quotes.newQuote.customerInfo') || 'Información del Cliente'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nombre:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dirección:</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Productos */}
                {quoteItems.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('quotes.newQuote.products') || 'Productos'}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-[#555555]">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                              {t('quotes.newQuote.product') || 'Producto'}
                            </th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-900 dark:text-white">
                              {t('quotes.newQuote.quantity') || 'Cantidad'}
                            </th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {t('quotes.newQuote.unitPrice') || 'Precio Unit.'}
                            </th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {t('quotes.newQuote.total') || 'Total'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {quoteItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#555555]">
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.sku}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                {item.quantity}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                ${item.unitPrice.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium text-[#FFC300]">
                                ${item.totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Resumen de totales */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('quotes.newQuote.summary') || 'Resumen'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${totals.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Descuento:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -${totals.discount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Impuestos ({quoteConfig.taxRate}%):</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${totals.tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-[#FFC300]">
                        ${totals.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notas y términos */}
                {quoteConfig.notes && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('quotes.newQuote.notes') || 'Notas'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{quoteConfig.notes}</p>
                  </div>
                )}

                {/* Términos y condiciones personalizados */}
                <div className="p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('quotes.newQuote.termsAndConditions') || 'Términos y Condiciones'}
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {customConditions
                      .filter(condition => condition.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((condition, index) => (
                        <li key={condition._id}>
                          • {condition.content.replace('{days}', quoteConfig.validityDays.toString())}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-[#444444]">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('quotes.newQuote.close') || 'Cerrar'}
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
                  >
                    {t('quotes.newQuote.saveQuote') || 'Guardar Cotización'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewQuoteModal;
