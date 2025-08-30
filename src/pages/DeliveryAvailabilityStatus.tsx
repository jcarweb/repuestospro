import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Coffee, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock as ClockIcon,
  User,
  Settings,
  Bell,
  RefreshCw,
  Download,
  Share2,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import AvailabilityControl from '../components/AvailabilityControl';
import { 
  mockAvailabilityStatus,
  getCurrentAvailability,
  updateAvailabilityStatus,
  type AvailabilityStatus
} from '../data/mockWorkSchedule';

interface AvailabilityHistory {
  _id: string;
  deliveryId: string;
  date: Date;
  status: 'available' | 'busy' | 'offline' | 'break';
  duration: number; // en minutos
  startTime: string;
  endTime?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
}

// Datos de prueba para historial de disponibilidad
const mockAvailabilityHistory: AvailabilityHistory[] = [
  {
    _id: 'history_001',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-15T00:00:00Z'),
    status: 'available',
    duration: 480, // 8 horas
    startTime: '08:00',
    endTime: '16:00',
    notes: 'Horario normal de trabajo',
    location: {
      lat: 10.4806,
      lng: -66.9036,
      address: 'Caracas, Venezuela'
    },
    createdAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    _id: 'history_002',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-16T00:00:00Z'),
    status: 'busy',
    duration: 540, // 9 horas
    startTime: '08:00',
    endTime: '17:00',
    notes: 'Muchos pedidos pendientes',
    location: {
      lat: 10.4806,
      lng: -66.9036,
      address: 'Caracas, Venezuela'
    },
    createdAt: new Date('2024-01-16T08:00:00Z')
  },
  {
    _id: 'history_003',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-17T00:00:00Z'),
    status: 'break',
    duration: 60, // 1 hora
    startTime: '12:00',
    endTime: '13:00',
    notes: 'Pausa para almuerzo',
    location: {
      lat: 10.4806,
      lng: -66.9036,
      address: 'Caracas, Venezuela'
    },
    createdAt: new Date('2024-01-17T12:00:00Z')
  },
  {
    _id: 'history_004',
    deliveryId: 'delivery_001',
    date: new Date('2024-01-18T00:00:00Z'),
    status: 'offline',
    duration: 0,
    startTime: '00:00',
    notes: 'Día libre',
    createdAt: new Date('2024-01-18T00:00:00Z')
  }
];

const DeliveryAvailabilityStatus: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [currentAvailability, setCurrentAvailability] = useState<AvailabilityStatus | null>(null);
  const [availabilityHistory, setAvailabilityHistory] = useState<AvailabilityHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);
  
  // Estados para modales
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadAvailabilityData();
  }, [selectedPeriod]);

  const loadAvailabilityData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deliveryId = 'delivery_001';
      const availability = getCurrentAvailability(deliveryId);
      
      // Filtrar historial según el período seleccionado
      let filteredHistory = [...mockAvailabilityHistory];
      const today = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          filteredHistory = mockAvailabilityHistory.filter(h => 
            h.date.toDateString() === today.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          filteredHistory = mockAvailabilityHistory.filter(h => 
            h.date >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          filteredHistory = mockAvailabilityHistory.filter(h => 
            h.date >= monthAgo
          );
          break;
      }
      
      setCurrentAvailability(availability);
      setAvailabilityHistory(filteredHistory);
      
    } catch (error) {
      console.error('Error loading availability data:', error);
    }
  };

  const handleAvailabilityChange = (status: 'available' | 'busy' | 'offline' | 'break', notes?: string) => {
    const deliveryId = 'delivery_001';
    const newStatus = updateAvailabilityStatus(deliveryId, status, notes);
    setCurrentAvailability(newStatus);
    
    // Agregar al historial
    const newHistoryEntry: AvailabilityHistory = {
      _id: `history_${Date.now()}`,
      deliveryId,
      date: new Date(),
      status,
      duration: 0,
      startTime: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      notes,
      location: {
        lat: 10.4806,
        lng: -66.9036,
        address: 'Caracas, Venezuela'
      },
      createdAt: new Date()
    };
    
    setAvailabilityHistory([newHistoryEntry, ...availabilityHistory]);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: <Wifi className="h-5 w-5" />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          label: t('schedule.status.available')
        };
      case 'busy':
        return {
          icon: <Clock className="h-5 w-5" />,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-700',
          label: t('schedule.status.busy')
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-5 w-5" />,
          color: 'text-carbon-600 dark:text-carbon-400',
          bgColor: 'bg-carbon-100 dark:bg-carbon-700',
          borderColor: 'border-carbon-200 dark:border-carbon-600',
          label: t('schedule.status.offline')
        };
      case 'break':
        return {
          icon: <Coffee className="h-5 w-5" />,
          color: 'text-racing-600 dark:text-racing-400',
          bgColor: 'bg-racing-100 dark:bg-racing-900/20',
          borderColor: 'border-racing-200 dark:border-racing-700',
          label: t('schedule.status.break')
        };
      default:
        return {
          icon: <WifiOff className="h-5 w-5" />,
          color: 'text-carbon-600 dark:text-carbon-400',
          bgColor: 'bg-carbon-100 dark:bg-carbon-700',
          borderColor: 'border-carbon-200 dark:border-carbon-600',
          label: t('schedule.status.offline')
        };
    }
  };

  const getFilteredHistory = () => {
    let filtered = availabilityHistory;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(h => h.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location?.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStats = () => {
    const totalTime = availabilityHistory.reduce((total, h) => total + h.duration, 0);
    const availableTime = availabilityHistory
      .filter(h => h.status === 'available')
      .reduce((total, h) => total + h.duration, 0);
    const busyTime = availabilityHistory
      .filter(h => h.status === 'busy')
      .reduce((total, h) => total + h.duration, 0);
    const breakTime = availabilityHistory
      .filter(h => h.status === 'break')
      .reduce((total, h) => total + h.duration, 0);
    
    const availabilityRate = totalTime > 0 ? (availableTime / totalTime) * 100 : 0;
    
    return {
      totalTime,
      availableTime,
      busyTime,
      breakTime,
      availabilityRate,
      totalEntries: availabilityHistory.length
    };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = getStats();
  const filteredHistory = getFilteredHistory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-onix-900 dark:text-snow-500">
            {t('availability.title')}
          </h1>
          <p className="text-carbon-600 dark:text-carbon-400 mt-2">
            {t('availability.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadAvailabilityData}
            className="px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button className="px-4 py-2 bg-carbon-600 text-snow-500 rounded-lg hover:bg-carbon-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="px-4 py-2 bg-primary-600 text-snow-500 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Control de disponibilidad actual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AvailabilityControl
            currentStatus={currentAvailability}
            onStatusChange={handleAvailabilityChange}
          />
        </div>
        
        {/* Panel de estadísticas rápidas */}
        <div className="space-y-4">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-4 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-4">
              {t('availability.quickStats')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-carbon-600 dark:text-carbon-400">{t('availability.totalTime')}:</span>
                <span className="font-medium text-onix-900 dark:text-snow-500">
                  {formatDuration(stats.totalTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-carbon-600 dark:text-carbon-400">{t('availability.availableTime')}:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatDuration(stats.availableTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-carbon-600 dark:text-carbon-400">{t('availability.busyTime')}:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {formatDuration(stats.busyTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-carbon-600 dark:text-carbon-400">{t('availability.breakTime')}:</span>
                <span className="font-medium text-racing-600 dark:text-racing-400">
                  {formatDuration(stats.breakTime)}
                </span>
              </div>
              <div className="pt-2 border-t border-carbon-200 dark:border-carbon-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-carbon-600 dark:text-carbon-400">{t('availability.availabilityRate')}:</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {stats.availabilityRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-4 shadow-sm border border-carbon-200 dark:border-carbon-700">
            <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500 mb-4">
              {t('availability.quickActions')}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowLocationModal(true)}
                className="w-full px-3 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {t('availability.configureLocation')}
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full px-3 py-2 bg-racing-100 dark:bg-racing-900/20 text-racing-700 dark:text-racing-300 rounded-lg hover:bg-racing-200 dark:hover:bg-racing-900/40 transition-colors flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {t('availability.scheduleAvailability')}
              </button>
              <button className="w-full px-3 py-2 bg-carbon-100 dark:bg-carbon-700 text-carbon-700 dark:text-carbon-300 rounded-lg hover:bg-carbon-200 dark:hover:bg-carbon-600 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('availability.settings')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-4 shadow-sm border border-carbon-200 dark:border-carbon-700">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-carbon-700 dark:text-carbon-300">{t('availability.period')}:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'week' | 'month')}
                className="px-3 py-1 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500 text-sm"
              >
                <option value="today">{t('availability.today')}</option>
                <option value="week">{t('availability.thisWeek')}</option>
                <option value="month">{t('availability.thisMonth')}</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-carbon-700 dark:text-carbon-300">{t('availability.status')}:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500 text-sm"
              >
                <option value="all">{t('availability.all')}</option>
                <option value="available">{t('schedule.status.available')}</option>
                <option value="busy">{t('schedule.status.busy')}</option>
                <option value="break">{t('schedule.status.break')}</option>
                <option value="offline">{t('schedule.status.offline')}</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-carbon-400" />
              <input
                type="text"
                placeholder={t('availability.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-carbon-300 dark:border-carbon-600 rounded-lg focus:ring-2 focus:ring-racing-500 focus:border-transparent dark:bg-carbon-700 dark:text-snow-500 text-sm w-64"
              />
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-carbon-600 hover:text-carbon-700 dark:text-carbon-400 dark:hover:text-carbon-300 hover:bg-carbon-50 dark:hover:bg-carbon-700 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Historial de disponibilidad */}
      <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg shadow-sm border border-carbon-200 dark:border-carbon-700">
        <div className="p-4 border-b border-carbon-200 dark:border-carbon-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
              {t('availability.history')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-carbon-600 dark:text-carbon-400">
                {filteredHistory.length} {t('availability.recordsFound')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((entry) => {
                const statusConfig = getStatusConfig(entry.status);
                return (
                  <div key={entry._id} className="p-4 border border-carbon-200 dark:border-carbon-600 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                          <div className={statusConfig.color}>
                            {statusConfig.icon}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-onix-900 dark:text-snow-500">
                            {statusConfig.label}
                          </div>
                          <div className="text-sm text-carbon-600 dark:text-carbon-400">
                            {formatDate(entry.date)} • {entry.startTime}
                            {entry.endTime && ` - ${entry.endTime}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-onix-900 dark:text-snow-500">
                          {entry.duration > 0 ? formatDuration(entry.duration) : t('availability.noDuration')}
                        </div>
                        <div className="text-xs text-carbon-500 dark:text-carbon-400">
                          {entry.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mb-3 p-3 bg-carbon-50 dark:bg-carbon-700 rounded-lg">
                        <div className="text-sm text-carbon-600 dark:text-carbon-400">
                          <strong>{t('availability.notes')}:</strong> {entry.notes}
                        </div>
                      </div>
                    )}
                    
                    {entry.location && (
                      <div className="flex items-center gap-2 text-sm text-carbon-600 dark:text-carbon-400">
                        <MapPin className="h-4 w-4" />
                        <span>{entry.location.address}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-carbon-300 dark:text-carbon-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-carbon-600 dark:text-carbon-400 mb-2">
                {t('availability.noRecords')}
              </h3>
              <p className="text-sm text-carbon-500 dark:text-carbon-500">
                {searchTerm || statusFilter !== 'all' 
                  ? t('availability.noRecordsFiltered')
                  : t('availability.noHistory')
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('availability.configureLocationTitle')}
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-carbon-600 dark:text-carbon-400">
                {t('availability.configureLocationDesc')}
              </p>
              
              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors">
                  {t('availability.configure')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-onix-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-snow-500 dark:bg-carbon-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-onix-900 dark:text-snow-500">
                {t('availability.scheduleTitle')}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-carbon-600 dark:text-carbon-400">
                {t('availability.scheduleDesc')}
              </p>
              
              <div className="flex gap-3 pt-4 border-t border-carbon-200 dark:border-carbon-700">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-carbon-300 text-carbon-700 rounded-lg hover:bg-carbon-400 transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2 bg-racing-500 text-onix-900 rounded-lg hover:bg-racing-600 transition-colors">
                  {t('availability.schedule')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAvailabilityStatus;
