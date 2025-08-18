import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Calendar, 
  Clock, 
  Target, 
  Smartphone, 
  Monitor,
  MapPin,
  Users,
  Tag,
  Settings,
  BarChart3,
  Search,
  Eye,
  Zap
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  navigationUrl?: string;
  store: Store;
  displayType: 'fullscreen' | 'footer' | 'mid_screen' | 'search_card';
  targetPlatform: 'android' | 'ios' | 'both';
  targetAudience: {
    userRoles: string[];
    loyaltyLevels: string[];
    locations: string[];
    deviceTypes: string[];
    operatingSystems: string[];
    ageRanges: string[];
    interests: string[];
  };
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  displaySettings: {
    maxImpressions: number;
    currentImpressions: number;
    maxClicks: number;
    currentClicks: number;
    frequency: number;
    priority: number;
    isActive: boolean;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';
}

interface AdvertisementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  advertisement?: Advertisement | null;
  isEditing?: boolean;
  token: string;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  advertisement,
  isEditing = false,
  token
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    navigationUrl: '',
    store: '',
    displayType: 'search_card' as const,
    targetPlatform: 'both' as const,
    targetAudience: {
      userRoles: [] as string[],
      loyaltyLevels: [] as string[],
      locations: [] as string[],
      deviceTypes: [] as string[],
      operatingSystems: [] as string[],
      ageRanges: [] as string[],
      interests: [] as string[]
    },
    schedule: {
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '18:00',
      daysOfWeek: [] as number[],
      timeSlots: [] as { start: string; end: string }[]
    },
    displaySettings: {
      maxImpressions: 0,
      maxClicks: 0,
      frequency: 1,
      priority: 5,
      isActive: false
    }
  });

  // Cargar tiendas
  const fetchStores = async () => {
    try {
      console.log('🔍 AdvertisementForm - Cargando tiendas...');
      
      const response = await fetch('http://localhost:5000/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📊 AdvertisementForm - Respuesta de tiendas:', data);
      
      if (data.success && data.data && data.data.stores && Array.isArray(data.data.stores)) {
        setStores(data.data.stores);
        console.log('✅ AdvertisementForm - Tiendas cargadas:', data.data.stores.length);
      } else {
        console.error('❌ AdvertisementForm - Respuesta inesperada de la API de tiendas:', data);
        setStores([]);
      }
    } catch (error) {
      console.error('❌ AdvertisementForm - Error cargando tiendas:', error);
      setStores([]);
    }
  };

  // Cargar datos de analytics
  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/advertisements/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error cargando datos de analytics:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('🔍 AdvertisementForm - Modal abierto, cargando datos...');
      fetchStores();
      fetchAnalyticsData();
    }
  }, [isOpen, token]);

  // Log para depurar el estado de stores
  useEffect(() => {
    console.log('📊 AdvertisementForm - Estado de stores:', stores);
  }, [stores]);

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (advertisement && isEditing) {
      console.log('🔍 AdvertisementForm - Inicializando formulario con datos existentes:', advertisement);
      setFormData({
        title: advertisement.title,
        description: advertisement.description,
        content: advertisement.content,
        imageUrl: advertisement.imageUrl || '',
        videoUrl: advertisement.videoUrl || '',
        navigationUrl: advertisement.navigationUrl || '',
        store: advertisement.store._id,
        displayType: advertisement.displayType,
        targetPlatform: advertisement.targetPlatform,
        targetAudience: advertisement.targetAudience,
        schedule: {
          ...advertisement.schedule,
          startDate: advertisement.schedule.startDate ? new Date(advertisement.schedule.startDate).toISOString().split('T')[0] : '',
          endDate: advertisement.schedule.endDate ? new Date(advertisement.schedule.endDate).toISOString().split('T')[0] : ''
        },
        displaySettings: advertisement.displaySettings
      });
      console.log('✅ AdvertisementForm - Formulario inicializado con datos de edición');
    } else {
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        navigationUrl: '',
        store: '',
        displayType: 'search_card',
        targetPlatform: 'both',
        targetAudience: {
          userRoles: [],
          loyaltyLevels: [],
          locations: [],
          deviceTypes: [],
          operatingSystems: [],
          ageRanges: [],
          interests: []
        },
        schedule: {
          startDate: '',
          endDate: '',
          startTime: '09:00',
          endTime: '18:00',
          daysOfWeek: [],
          timeSlots: []
        },
        displaySettings: {
          maxImpressions: 0,
          maxClicks: 0,
          frequency: 1,
          priority: 5,
          isActive: false
        }
      });
    }
  }, [advertisement, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 AdvertisementForm - Enviando formulario:', formData);
      console.log('🔍 AdvertisementForm - Modo edición:', isEditing);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('❌ AdvertisementForm - Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetAudienceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }));
  };

  const handleScheduleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
    }));
  };

  const handleDisplaySettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      displaySettings: {
        ...prev.displaySettings,
        [field]: value
      }
    }));
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = formData.schedule.daysOfWeek;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleScheduleChange('daysOfWeek', newDays);
  };

  const addTimeSlot = () => {
    const newTimeSlot = { start: '09:00', end: '10:00' };
    const currentSlots = formData.schedule.timeSlots;
    handleScheduleChange('timeSlots', [...currentSlots, newTimeSlot]);
  };

  const removeTimeSlot = (index: number) => {
    const currentSlots = formData.schedule.timeSlots;
    const newSlots = currentSlots.filter((_, i) => i !== index);
    handleScheduleChange('timeSlots', newSlots);
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    const currentSlots = formData.schedule.timeSlots;
    const newSlots = currentSlots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    handleScheduleChange('timeSlots', newSlots);
  };

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
  ];

  const displayTypes = [
    { value: 'fullscreen', label: 'Pantalla Completa', icon: Monitor },
    { value: 'footer', label: 'Pie de Página', icon: BarChart3 },
    { value: 'mid_screen', label: 'Mitad de Pantalla', icon: Target },
    { value: 'search_card', label: 'Card de Búsqueda', icon: Search }
  ];

  const platforms = [
    { value: 'android', label: 'Android', icon: Smartphone },
    { value: 'ios', label: 'iOS', icon: Smartphone },
    { value: 'both', label: 'Ambas', icon: Monitor }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Publicidad' : 'Nueva Publicidad'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-gray-200">
            {[
              { id: 'basic', label: 'Información Básica', icon: Eye },
              { id: 'targeting', label: 'Segmentación', icon: Target },
              { id: 'schedule', label: 'Programación', icon: Calendar },
              { id: 'display', label: 'Configuración', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Información Básica */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tienda *
                    </label>
                    <select
                      value={formData.store}
                      onChange={(e) => handleInputChange('store', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar tienda</option>
                      {Array.isArray(stores) && stores.map(store => (
                        <option key={store._id} value={store._id}>
                          {store.name} - {store.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Contenido completo de la publicidad..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Video
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://ejemplo.com/video.mp4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Navegación
                  </label>
                  <input
                    type="url"
                    value={formData.navigationUrl}
                    onChange={(e) => handleInputChange('navigationUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/promocion-o-producto"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL a la que navegará el cliente cuando haga clic en la publicidad
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Display *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {displayTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('displayType', type.value)}
                          className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                            formData.displayType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plataforma Objetivo *
                    </label>
                    <div className="space-y-2">
                      {platforms.map(platform => (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => handleInputChange('targetPlatform', platform.value)}
                          className={`flex items-center space-x-2 w-full p-3 border rounded-lg transition-colors ${
                            formData.targetPlatform === platform.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <platform.icon className="w-4 h-4" />
                          <span>{platform.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Segmentación */}
            {activeTab === 'targeting' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roles de Usuario
                    </label>
                    <div className="space-y-2">
                      {['client', 'store_manager', 'delivery', 'admin'].map(role => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetAudience.userRoles.includes(role)}
                            onChange={(e) => {
                              const currentRoles = formData.targetAudience.userRoles;
                              const newRoles = e.target.checked
                                ? [...currentRoles, role]
                                : currentRoles.filter(r => r !== role);
                              handleTargetAudienceChange('userRoles', newRoles);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveles de Fidelización
                    </label>
                    <div className="space-y-2">
                      {['bronze', 'silver', 'gold', 'platinum'].map(level => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetAudience.loyaltyLevels.includes(level)}
                            onChange={(e) => {
                              const currentLevels = formData.targetAudience.loyaltyLevels;
                              const newLevels = e.target.checked
                                ? [...currentLevels, level]
                                : currentLevels.filter(l => l !== level);
                              handleTargetAudienceChange('loyaltyLevels', newLevels);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de Dispositivo
                    </label>
                    <div className="space-y-2">
                      {['mobile', 'tablet', 'desktop'].map(device => (
                        <label key={device} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetAudience.deviceTypes.includes(device)}
                            onChange={(e) => {
                              const currentDevices = formData.targetAudience.deviceTypes;
                              const newDevices = e.target.checked
                                ? [...currentDevices, device]
                                : currentDevices.filter(d => d !== device);
                              handleTargetAudienceChange('deviceTypes', newDevices);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{device}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sistemas Operativos
                    </label>
                    <div className="space-y-2">
                      {['android', 'ios', 'web'].map(os => (
                        <label key={os} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetAudience.operatingSystems.includes(os)}
                            onChange={(e) => {
                              const currentOS = formData.targetAudience.operatingSystems;
                              const newOS = e.target.checked
                                ? [...currentOS, os]
                                : currentOS.filter(o => o !== os);
                              handleTargetAudienceChange('operatingSystems', newOS);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{os}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicaciones
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {analyticsData?.locationBreakdown && Object.keys(analyticsData.locationBreakdown).map(location => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.locations.includes(location)}
                          onChange={(e) => {
                            const currentLocations = formData.targetAudience.locations;
                            const newLocations = e.target.checked
                              ? [...currentLocations, location]
                              : currentLocations.filter(l => l !== location);
                            handleTargetAudienceChange('locations', newLocations);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intereses
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {analyticsData?.interests && analyticsData.interests.map((interest: string) => (
                      <label key={interest} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.interests.includes(interest)}
                          onChange={(e) => {
                            const currentInterests = formData.targetAudience.interests;
                            const newInterests = e.target.checked
                              ? [...currentInterests, interest]
                              : currentInterests.filter(i => i !== interest);
                            handleTargetAudienceChange('interests', newInterests);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Programación */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.schedule.startDate}
                      onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      value={formData.schedule.endDate}
                      onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.startTime}
                      onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fin *
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.endTime}
                      onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de la Semana
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDayOfWeek(day.value)}
                        className={`p-2 text-sm border rounded-lg transition-colors ${
                          formData.schedule.daysOfWeek.includes(day.value)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Si no seleccionas ningún día, la publicidad se mostrará todos los días
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Slots de Tiempo Específicos
                    </label>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Agregar Slot
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.schedule.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span>a</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Si no agregas slots específicos, se usará el horario general
                  </p>
                </div>
              </div>
            )}

            {/* Configuración */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impresiones Máximas
                    </label>
                    <input
                      type="number"
                      value={formData.displaySettings.maxImpressions}
                      onChange={(e) => handleDisplaySettingsChange('maxImpressions', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0 = sin límite"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = sin límite de impresiones
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clicks Máximos
                    </label>
                    <input
                      type="number"
                      value={formData.displaySettings.maxClicks}
                      onChange={(e) => handleDisplaySettingsChange('maxClicks', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0 = sin límite"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = sin límite de clicks
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia por Usuario
                    </label>
                    <input
                      type="number"
                      value={formData.displaySettings.frequency}
                      onChange={(e) => handleDisplaySettingsChange('frequency', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número de veces que se mostrará por usuario
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <input
                      type="number"
                      value={formData.displaySettings.priority}
                      onChange={(e) => handleDisplaySettingsChange('priority', parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      1 = más baja, 10 = más alta
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.displaySettings.isActive}
                      onChange={(e) => handleDisplaySettingsChange('isActive', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Activar publicidad inmediatamente
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Si no está marcado, la publicidad se creará como borrador
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvertisementForm;
