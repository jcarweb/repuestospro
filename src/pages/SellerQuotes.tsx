import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Send,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Phone,
  Mail,
  RefreshCcw,
  Copy,
  Settings,
  Building,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import NewQuoteModal from '../components/NewQuoteModal';
import QuoteConditionsConfig from '../components/QuoteConditionsConfig';
import StoreInfoConfig from '../components/StoreInfoConfig';

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
    image?: string;
  }[];
  total: number;
  discount: number;
  discountPercentage: number;
  finalTotal: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  notes?: string;
  terms?: string;
  validFor: number; // días
  quoteNumber: string;
  isUrgent: boolean;
  tags: string[];
}

interface QuoteStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

const SellerQuotes: React.FC = () => {
  const { t } = useLanguage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState<boolean>(false);
  const [showConditionsConfig, setShowConditionsConfig] = useState<boolean>(false);
  const [showStoreInfoConfig, setShowStoreInfoConfig] = useState<boolean>(false);

  const statusOptions = [
    { value: 'all', label: t('quotes.filters.allStatuses') || 'Todos los estados' },
    { value: 'draft', label: t('quotes.status.draft') || 'Borrador' },
    { value: 'sent', label: t('quotes.status.sent') || 'Enviado' },
    { value: 'viewed', label: t('quotes.status.viewed') || 'Visto' },
    { value: 'accepted', label: t('quotes.status.accepted') || 'Aceptado' },
    { value: 'rejected', label: t('quotes.status.rejected') || 'Rechazado' },
    { value: 'expired', label: t('quotes.status.expired') || 'Expirado' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: t('quotes.filters.allDates') || 'Todas las fechas' },
    { value: 'today', label: t('quotes.filters.today') || 'Hoy' },
    { value: 'week', label: t('quotes.filters.thisWeek') || 'Esta semana' },
    { value: 'month', label: t('quotes.filters.thisMonth') || 'Este mes' },
    { value: 'quarter', label: t('quotes.filters.thisQuarter') || 'Este trimestre' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: t('quotes.sort.createdAt') || 'Fecha de creación' },
    { value: 'expiresAt', label: t('quotes.sort.expiresAt') || 'Fecha de expiración' },
    { value: 'finalTotal', label: t('quotes.sort.finalTotal') || 'Valor total' },
    { value: 'customerName', label: t('quotes.sort.customerName') || 'Cliente' },
    { value: 'status', label: t('quotes.sort.status') || 'Estado' },
  ];

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock quotes data
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
              image: '/api/placeholder/60/60',
            },
            {
              productId: 'prod2',
              productName: 'Pastillas de Freno Delanteras',
              quantity: 1,
              unitPrice: 45.00,
              totalPrice: 45.00,
              image: '/api/placeholder/60/60',
            },
          ],
          total: 95.00,
          discount: 10.00,
          discountPercentage: 10.5,
          finalTotal: 85.00,
          status: 'sent',
          createdAt: '2023-10-26T14:30:00Z',
          updatedAt: '2023-10-26T14:30:00Z',
          expiresAt: '2023-10-28T14:30:00Z',
          notes: 'Descuento especial por compra múltiple',
          terms: 'Pago al contado, entrega en 2-3 días hábiles',
          validFor: 2,
          quoteNumber: 'COT-2023-001',
          isUrgent: false,
          tags: ['Descuento', 'Múltiple'],
        },
        {
          _id: 'quote2',
          customerId: 'cust2',
          customerName: 'María García',
          customerPhone: '0424-9876543',
          customerEmail: 'maria.garcia@email.com',
          products: [
            {
              productId: 'prod3',
              productName: 'Batería 12V 60Ah',
              quantity: 1,
              unitPrice: 120.00,
              totalPrice: 120.00,
              image: '/api/placeholder/60/60',
            },
          ],
          total: 120.00,
          discount: 0.00,
          discountPercentage: 0,
          finalTotal: 120.00,
          status: 'accepted',
          createdAt: '2023-10-25T10:15:00Z',
          updatedAt: '2023-10-25T16:20:00Z',
          expiresAt: '2023-10-27T10:15:00Z',
          terms: 'Pago al contado, entrega en 3-5 días hábiles',
          validFor: 2,
          quoteNumber: 'COT-2023-002',
          isUrgent: true,
          tags: ['Urgente'],
        },
        {
          _id: 'quote3',
          customerId: 'cust3',
          customerName: 'Carlos Ruiz',
          customerPhone: '0416-5554433',
          customerEmail: 'carlos.ruiz@email.com',
          products: [
            {
              productId: 'prod4',
              productName: 'Aceite Motor 5W-30',
              quantity: 3,
              unitPrice: 35.00,
              totalPrice: 105.00,
              image: '/api/placeholder/60/60',
            },
            {
              productId: 'prod1',
              productName: 'Filtro de Aceite Motor',
              quantity: 3,
              unitPrice: 25.00,
              totalPrice: 75.00,
              image: '/api/placeholder/60/60',
            },
          ],
          total: 180.00,
          discount: 18.00,
          discountPercentage: 10,
          finalTotal: 162.00,
          status: 'draft',
          createdAt: '2023-10-26T16:45:00Z',
          updatedAt: '2023-10-26T16:45:00Z',
          expiresAt: '2023-10-30T16:45:00Z',
          notes: 'Cliente frecuente, descuento por volumen',
          terms: 'Pago al contado, entrega en 1-2 días hábiles',
          validFor: 4,
          quoteNumber: 'COT-2023-003',
          isUrgent: false,
          tags: ['Volumen', 'Frecuente'],
        },
      ];

      // Calculate stats
      const total = mockQuotes.length;
      const pending = mockQuotes.filter(q => ['draft', 'sent', 'viewed'].includes(q.status)).length;
      const accepted = mockQuotes.filter(q => q.status === 'accepted').length;
      const rejected = mockQuotes.filter(q => q.status === 'rejected').length;
      const expired = mockQuotes.filter(q => q.status === 'expired').length;
      const totalValue = mockQuotes.reduce((sum, q) => sum + q.finalTotal, 0);
      const averageValue = totalValue / total;
      const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

      setQuotes(mockQuotes);
      setStats({
        total,
        pending,
        accepted,
        rejected,
        expired,
        totalValue,
        averageValue,
        conversionRate,
      });
    } catch (err) {
      setError('Error al cargar las cotizaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customerPhone.includes(searchTerm) ||
      quote.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const now = new Date();
      const quoteDate = new Date(quote.createdAt);
      
      switch (filterDateRange) {
        case 'today':
          matchesDate = quoteDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = quoteDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = quoteDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = quoteDate >= quarterAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'expiresAt':
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      case 'finalTotal':
        return b.finalTotal - a.finalTotal;
      case 'customerName':
        return a.customerName.localeCompare(b.customerName);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'draft':
        return Edit;
      case 'sent':
        return Send;
      case 'viewed':
        return Eye;
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

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return t('quotes.status.draft') || 'Borrador';
      case 'sent':
        return t('quotes.status.sent') || 'Enviado';
      case 'viewed':
        return t('quotes.status.viewed') || 'Visto';
      case 'accepted':
        return t('quotes.status.accepted') || 'Aceptado';
      case 'rejected':
        return t('quotes.status.rejected') || 'Rechazado';
      case 'expired':
        return t('quotes.status.expired') || 'Expirado';
      default:
        return status;
    }
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setQuotes(prev => prev.map(quote => 
        quote._id === quoteId 
          ? { ...quote, status: 'sent' as const, updatedAt: new Date().toISOString() }
          : quote
      ));
      
      alert('Cotización enviada exitosamente');
    } catch (err) {
      console.error('Error enviando cotización:', err);
    }
  };

  const handleDuplicateQuote = async (quoteId: string) => {
    try {
      const originalQuote = quotes.find(q => q._id === quoteId);
      if (!originalQuote) return;

      const newQuote: Quote = {
        ...originalQuote,
        _id: `quote${Date.now()}`,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + originalQuote.validFor * 24 * 60 * 60 * 1000).toISOString(),
        quoteNumber: `COT-2023-${String(quotes.length + 1).padStart(3, '0')}`,
        notes: '',
      };

      setQuotes(prev => [newQuote, ...prev]);
      alert('Cotización duplicada exitosamente');
    } catch (err) {
      console.error('Error duplicando cotización:', err);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setQuotes(prev => prev.filter(quote => quote._id !== quoteId));
      alert('Cotización eliminada exitosamente');
    } catch (err) {
      console.error('Error eliminando cotización:', err);
    }
  };

  const handleSaveNewQuote = (quoteData: any) => {
    // Crear nueva cotización con los datos del modal
    const newQuote: Quote = {
      _id: `quote${Date.now()}`,
      customerId: quoteData.customer._id,
      customerName: quoteData.customer.name,
      customerPhone: quoteData.customer.phone,
      customerEmail: quoteData.customer.email,
      products: quoteData.items.map((item: any) => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: item.product.image
      })),
      total: quoteData.totals.subtotal,
      discount: quoteData.totals.discount,
      discountPercentage: quoteData.config.discountType === 'percentage' ? quoteData.config.discount : 0,
      finalTotal: quoteData.totals.total,
      status: 'draft',
      createdAt: quoteData.createdAt,
      updatedAt: quoteData.createdAt,
      expiresAt: new Date(new Date(quoteData.createdAt).getTime() + quoteData.config.validityDays * 24 * 60 * 60 * 1000).toISOString(),
      notes: quoteData.config.notes,
      terms: quoteData.config.terms,
      validFor: quoteData.config.validityDays,
      quoteNumber: `COT-2023-${String(quotes.length + 1).padStart(3, '0')}`,
      isUrgent: false,
      tags: []
    };

    // Agregar a la lista de cotizaciones
    setQuotes(prev => [newQuote, ...prev]);
    
    // Actualizar estadísticas
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
        totalValue: prev.totalValue + newQuote.finalTotal,
        averageValue: (prev.totalValue + newQuote.finalTotal) / (prev.total + 1)
      } : null);
    }

    alert('Cotización creada exitosamente');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600">Cargando cotizaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-red-600">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchQuotes}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#333333] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('quotes.title') || 'Gestión de Cotizaciones'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('quotes.subtitle') || 'Crea, envía y gestiona cotizaciones para tus clientes'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-[#444444] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#555555] transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span>{t('quotes.filters.title') || 'Filtros'}</span>
          </button>
          <button
            onClick={() => setShowConditionsConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-[#444444] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#555555] transition-colors shadow-sm"
            title={t('quotes.conditions.configure') || 'Configurar condiciones de cotizaciones'}
          >
            <Settings className="w-4 h-4" />
            <span>{t('quotes.conditions.configure') || 'Condiciones'}</span>
          </button>
          <button
            onClick={() => setShowStoreInfoConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-[#444444] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#555555] transition-colors shadow-sm"
            title={t('quotes.storeConfig.configure') || 'Configurar información de la tienda'}
          >
            <Building className="w-4 h-4" />
            <span>{t('quotes.storeConfig.configure') || 'Tienda'}</span>
          </button>
          <button
            onClick={() => setShowNewQuoteModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-lg hover:bg-[#E6B800] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>{t('quotes.actions.newQuote') || 'Nueva Cotización'}</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#444444] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-[#FFC300] rounded-lg">
                <FileText className="h-6 w-6 text-[#333333]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('quotes.stats.total') || 'Total Cotizaciones'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#444444] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-[#E63946] rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('quotes.stats.pending') || 'Pendientes'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#444444] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-[#333333] rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('quotes.stats.accepted') || 'Aceptadas'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#444444] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-[#000000] rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('quotes.stats.totalValue') || 'Valor Total'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white dark:bg-[#444444] rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('quotes.filters.status') || 'Estado'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('quotes.filters.dateRange') || 'Rango de Fecha'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('quotes.filters.sortBy') || 'Ordenar por'}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('quotes.filters.search') || 'Buscar'}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('quotes.filters.searchPlaceholder') || 'Cliente, teléfono, email...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#555555] text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de cotizaciones */}
      <div className="bg-white dark:bg-[#444444] rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-[#555555]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.quote') || 'Cotización'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.customer') || 'Cliente'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.products') || 'Productos'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.total') || 'Total'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.status') || 'Estado'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.expires') || 'Expira'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('quotes.table.actions') || 'Acciones'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#444444] divide-y divide-gray-200 dark:divide-gray-600">
              {sortedQuotes.map(quote => {
                const StatusIcon = getStatusIcon(quote.status);
                const expired = isExpired(quote.expiresAt);
                
                return (
                  <tr key={quote._id} className="hover:bg-gray-50 dark:hover:bg-[#555555] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-[#FFC300]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quote.quoteNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {quote.customerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {quote.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {quote.products.length} {t('quotes.table.productCount') || 'producto'}{quote.products.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {quote.products.map(p => p.productName).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${quote.finalTotal.toFixed(2)}
                      </div>
                      {quote.discount > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          -${quote.discount.toFixed(2)} ({quote.discountPercentage.toFixed(1)}%)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2 text-[#FFC300]" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                        {quote.isUrgent && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                            {t('quotes.urgent') || 'Urgente'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {new Date(quote.expiresAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {expired ? (t('quotes.expired') || 'Expirado') : `${Math.ceil((new Date(quote.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ${t('quotes.days') || 'días'}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="text-[#FFC300] hover:text-[#E6B800] transition-colors"
                          title={t('quotes.actions.view') || 'Ver detalles'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {quote.status === 'draft' && (
                          <button
                            onClick={() => handleSendQuote(quote._id)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title={t('quotes.actions.send') || 'Enviar cotización'}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicateQuote(quote._id)}
                          className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                          title={t('quotes.actions.duplicate') || 'Duplicar'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote._id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title={t('quotes.actions.delete') || 'Eliminar'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Cotización */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('quotes.details.title') || 'Cotización'} {selectedQuote.quoteNumber}
              </h2>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del cliente */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('quotes.details.customerInfo') || 'Información del Cliente'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-[#FFC300] mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">{selectedQuote.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-[#FFC300] mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">{selectedQuote.customerPhone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-[#FFC300] mr-3" />
                      <span className="text-sm text-gray-900 dark:text-white">{selectedQuote.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Información de la cotización */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('quotes.details.quoteDetails') || 'Detalles de la Cotización'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.status') || 'Estado'}:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedQuote.status)}`}>
                        {getStatusLabel(selectedQuote.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.created') || 'Creada'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedQuote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.expires') || 'Expira'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedQuote.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.validFor') || 'Válida por'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedQuote.validFor} {t('quotes.days') || 'días'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('quotes.details.products') || 'Productos'}
                </h3>
                <div className="space-y-4">
                  {selectedQuote.products.map((product, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                      <img
                        src={product.image}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{product.productName}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.quantity') || 'Cantidad'}: {product.quantity}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.unitPrice') || 'Precio unitario'}: ${product.unitPrice.toFixed(2)}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('quotes.details.total') || 'Total'}: ${product.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de precios */}
              <div className="mt-8 bg-gray-50 dark:bg-[#555555] rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('quotes.details.priceSummary') || 'Resumen de Precios'}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.subtotal') || 'Subtotal'}:</span>
                    <span className="text-sm text-gray-900 dark:text-white">${selectedQuote.total.toFixed(2)}</span>
                  </div>
                  {selectedQuote.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('quotes.details.discount') || 'Descuento'} ({selectedQuote.discountPercentage.toFixed(1)}%):</span>
                      <span className="text-sm text-green-600 dark:text-green-400">-${selectedQuote.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{t('quotes.details.total') || 'Total'}:</span>
                    <span className="text-lg font-bold text-[#FFC300]">${selectedQuote.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notas y términos */}
              {(selectedQuote.notes || selectedQuote.terms) && (
                <div className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedQuote.notes && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('quotes.details.notes') || 'Notas'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          {selectedQuote.notes}
                        </p>
                      </div>
                    )}
                    {selectedQuote.terms && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('quotes.details.terms') || 'Términos y Condiciones'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          {selectedQuote.terms}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="mt-8 flex space-x-3">
                {selectedQuote.status === 'draft' && (
                  <button
                    onClick={() => handleSendQuote(selectedQuote._id)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t('quotes.actions.sendQuote') || 'Enviar Cotización'}
                  </button>
                )}
                <button
                  onClick={() => handleDuplicateQuote(selectedQuote._id)}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {t('quotes.actions.duplicate') || 'Duplicar'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Cotización ${selectedQuote.quoteNumber} - ${selectedQuote.customerName}`);
                    alert(t('quotes.actions.copied') || 'Información copiada al portapapeles');
                  }}
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  {t('quotes.actions.copyInfo') || 'Copiar Info'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Cotización */}
      <NewQuoteModal
        isOpen={showNewQuoteModal}
        onClose={() => setShowNewQuoteModal(false)}
        onSave={handleSaveNewQuote}
      />

      {/* Modal de Configuración de Condiciones */}
      <QuoteConditionsConfig
        isOpen={showConditionsConfig}
        onClose={() => setShowConditionsConfig(false)}
        onSave={(conditions) => {
          console.log('Condiciones guardadas:', conditions);
          setShowConditionsConfig(false);
        }}
      />

      {/* Modal de Configuración de la Tienda */}
      <StoreInfoConfig
        isOpen={showStoreInfoConfig}
        onClose={() => setShowStoreInfoConfig(false)}
        onSave={(storeInfo) => {
          console.log('Información de la tienda guardada:', storeInfo);
          setShowStoreInfoConfig(false);
        }}
      />
    </div>
  );
};

export default SellerQuotes;
