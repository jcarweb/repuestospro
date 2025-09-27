import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import FreeStoreLocationMap from './FreeStoreLocationMap';
import AdministrativeDivisionSelector from './AdministrativeDivisionSelector';
import InventoryConfigModal from './InventoryConfigModal';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Settings,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Plus,
  Building2,
  Loader2,
  Navigation,
  Facebook,
  Instagram,
  Twitter,
  Share2
} from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  phoneLocal?: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  isActive: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  settings: {
    currency: string;
    taxRate: number;
    deliveryRadius: number;
    minimumOrder: number;
    autoAcceptOrders: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface StoreSetupData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  phoneLocal: string;
  email: string;
  website: string;
  logo: string;
  banner: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
  };
  latitude: string;
  longitude: string;
  currency: string;
  taxRate: string;
  deliveryRadius: string;
  minimumOrder: string;
  autoAcceptOrders: boolean;
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
}

const StoreManagerInitializer: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { userStores, refreshStores } = useActiveStore();

  console.log('🔍 StoreManagerInitializer: Componente montado');
  console.log('🔍 StoreManagerInitializer: User:', user);
  console.log('🔍 StoreManagerInitializer: Location:', location.pathname);
  
  const [loading, setLoading] = useState(true);
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [showBranchesManager, setShowBranchesManager] = useState(false);
  const [showInventoryConfig, setShowInventoryConfig] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StoreSetupData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Venezuela',
    phone: '',
    phoneLocal: '',
    email: user?.email || '',
    website: '',
    logo: '',
    banner: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    latitude: '',
    longitude: '',
    currency: 'USD',
    taxRate: '16.0',
    deliveryRadius: '10',
    minimumOrder: '0',
    autoAcceptOrders: false,
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '14:00', isOpen: true },
      sunday: { open: '08:00', close: '14:00', isOpen: false }
    }
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [selectedAdministrativeDivision, setSelectedAdministrativeDivision] = useState<{
    stateId: string;
    municipalityId: string;
    parishId: string;
    stateName: string;
    municipalityName: string;
    parishName: string;
  } | null>(null);

  // Verificar si el usuario ya tiene tiendas
  useEffect(() => {
    const checkUserStores = async () => {
      try {
        await refreshStores();
        
        if (userStores.length === 0) {
          // No tiene tiendas, mostrar formulario de creación
          setShowStoreSetup(true);
        } else {
          // Tiene tiendas, mostrar gestor de sucursales
          setShowBranchesManager(true);
        }
      } catch (error) {
        console.error('Error verificando tiendas del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkUserStores();
    }
  }, [token, refreshStores, userStores.length]);

  const handleCreateStore = async () => {
    setLoading(true);
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          coordinates: {
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0
          },
          // Referencias a las divisiones administrativas
          stateRef: selectedAdministrativeDivision?.stateId,
          municipalityRef: selectedAdministrativeDivision?.municipalityId,
          parishRef: selectedAdministrativeDivision?.parishId,
          // Redes sociales (filtrar campos vacíos)
          socialMedia: Object.fromEntries(
            Object.entries(formData.socialMedia).filter(([_, value]) => value.trim() !== '')
          ),
          settings: {
            currency: formData.currency,
            taxRate: parseFloat(formData.taxRate),
            deliveryRadius: parseFloat(formData.deliveryRadius),
            minimumOrder: parseFloat(formData.minimumOrder),
            autoAcceptOrders: formData.autoAcceptOrders
          }
        })
      });

      const data = await response.json();
      
             if (data.success) {
         // Tienda creada exitosamente, refrescar las tiendas y redirigir al dashboard
         await refreshStores();
         navigate('/store-manager/dashboard');
       } else {
         alert(data.message || 'Error al crear la tienda');
       }
    } catch (error) {
      console.error('Error creando tienda:', error);
      alert('Error al crear la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    navigate('/store-manager/dashboard');
  };

  const handleLocationSelect = (locationData: { latitude: number; longitude: number; address: string }) => {
    setSelectedLocation(locationData);
    
    // Actualizar el formulario con las coordenadas
    setFormData(prev => ({
      ...prev,
      latitude: locationData.latitude.toString(),
      longitude: locationData.longitude.toString(),
      address: locationData.address
    }));
  };

  const handleAdministrativeDivisionChange = (locationData: {
    stateId: string;
    municipalityId: string;
    parishId: string;
    stateName: string;
    municipalityName: string;
    parishName: string;
  }) => {
    setSelectedAdministrativeDivision(locationData);
    
    // Actualizar solo el estado en el formulario, la ciudad es independiente
    setFormData(prev => ({
      ...prev,
      state: locationData.stateName
      // No actualizamos city aquí porque es un campo independiente
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFC300] mx-auto mb-4" />
          <p className="text-[#333333]">Verificando configuración de tienda...</p>
        </div>
      </div>
    );
  }

  // Si está en una ruta específica del store manager, no mostrar el inicializador
  if (location.pathname !== '/store-manager' && location.pathname !== '/store-setup') {
    return null;
  }

  // Mostrar formulario de creación de tienda
  if (showStoreSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-[#FFC300] rounded-full flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido a tu Panel de Gestión!
            </h1>
            <p className="text-lg text-gray-600">
              Para comenzar, necesitamos configurar tu primera tienda
            </p>
          </div>

          {/* Formulario de configuración de tienda */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Información de la Tienda
              </h2>
              <p className="text-gray-600">
                Completa los datos básicos de tu tienda para comenzar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre de la tienda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Tienda *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="Ej: Repuestos Pérez"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="Breve descripción de tu tienda"
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="Dirección completa de la tienda"
                />
              </div>

              {/* División Administrativa y Ciudad */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Ubicación Administrativa *
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Selecciona el Estado, Municipio y Parroquia donde se encuentra tu tienda. Esto permite búsquedas más precisas.
                    </p>
                  </div>
                  
                  {/* Selectores de División Administrativa */}
                  <div className="mb-4">
                    <AdministrativeDivisionSelector
                      onLocationChange={handleAdministrativeDivisionChange}
                      required={true}
                    />
                  </div>
                  
                  {/* Campo de Ciudad independiente */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                      placeholder="Ej: Caracas, Valencia, Maracaibo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Especifica la ciudad exacta donde se encuentra tu tienda
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapa de Ubicación GPS */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Navigation className="inline h-4 w-4 mr-1" />
                  Ubicación GPS (Coordenadas) *
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Selecciona la ubicación exacta de tu tienda en el mapa. Esto es crucial para que los clientes puedan encontrarte.
                    </p>
                    {selectedLocation && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <div className="flex items-center text-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Ubicación seleccionada</span>
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          <div>Latitud: {selectedLocation.latitude.toFixed(6)}</div>
                          <div>Longitud: {selectedLocation.longitude.toFixed(6)}</div>
                          <div className="mt-1">{selectedLocation.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <FreeStoreLocationMap
                    onLocationSelect={handleLocationSelect}
                    height="300px"
                  />
                </div>
              </div>



              {/* Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="Código postal"
                />
              </div>

              {/* Teléfono Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Principal *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="+58 412-123-4567"
                />
              </div>

              {/* Teléfono Local */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Local
                </label>
                <input
                  type="tel"
                  value={formData.phoneLocal}
                  onChange={(e) => setFormData({...formData, phoneLocal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="0212-123-4567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de teléfono local (opcional)
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="tienda@ejemplo.com"
                />
              </div>

              {/* Sitio web */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                  placeholder="https://www.tutienda.com"
                />
              </div>

              {/* Redes Sociales */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Share2 className="inline h-4 w-4 mr-1" />
                  Redes Sociales
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Facebook className="inline h-3 w-3 mr-1" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData({
                        ...formData, 
                        socialMedia: {...formData.socialMedia, facebook: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-sm"
                      placeholder="https://facebook.com/tutienda"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Instagram className="inline h-3 w-3 mr-1" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => setFormData({
                        ...formData, 
                        socialMedia: {...formData.socialMedia, instagram: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-sm"
                      placeholder="https://instagram.com/tutienda"
                    />
                  </div>

                  {/* Twitter/X */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Twitter className="inline h-3 w-3 mr-1" />
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => setFormData({
                        ...formData, 
                        socialMedia: {...formData.socialMedia, twitter: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-sm"
                      placeholder="https://twitter.com/tutienda"
                    />
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      <Share2 className="inline h-3 w-3 mr-1" />
                      TikTok
                    </label>
                    <input
                      type="url"
                      value={formData.socialMedia.tiktok}
                      onChange={(e) => setFormData({
                        ...formData, 
                        socialMedia: {...formData.socialMedia, tiktok: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent text-sm"
                      placeholder="https://tiktok.com/@tutienda"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Agrega los enlaces a tus redes sociales para que los clientes puedan encontrarte
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={handleCreateStore}
                disabled={loading || !formData.name || !formData.address || !formData.city || !formData.zipCode || !formData.phone || !formData.email || !selectedLocation || !selectedAdministrativeDivision}
                className="px-6 py-3 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Crear Tienda
              </button>
              
              {!selectedLocation && (
                <div className="flex items-center text-amber-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Debes seleccionar una ubicación GPS en el mapa para continuar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar gestor de sucursales
  if (showBranchesManager) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-[#FFC300] rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Sucursales
            </h1>
            <p className="text-lg text-gray-600">
              Administra tus tiendas y sucursales
            </p>
          </div>

          {/* Lista de tiendas existentes */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
                         <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-semibold text-gray-900">
                 Tus Tiendas ({userStores.length})
               </h2>
              <button
                onClick={() => setShowStoreSetup(true)}
                className="px-4 py-2 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Nueva Sucursal
              </button>
            </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {userStores.map((store) => (
                <div key={store._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      store.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                                     <div className="space-y-2 text-sm text-gray-600">
                     <div className="flex items-center">
                       <MapPin className="h-4 w-4 mr-2" />
                       <span>{store.address}, {store.city}</span>
                     </div>
                     <div className="flex items-center">
                       <Phone className="h-4 w-4 mr-2" />
                       <span>{store.phone}</span>
                       {store.phoneLocal && (
                         <span className="ml-2 text-xs text-gray-500">({store.phoneLocal})</span>
                       )}
                     </div>
                     <div className="flex items-center">
                       <Mail className="h-4 w-4 mr-2" />
                       <span>{store.email}</span>
                     </div>
                     {store.socialMedia && Object.keys(store.socialMedia).length > 0 && (
                       <div className="flex items-center space-x-2">
                         <Share2 className="h-4 w-4 text-gray-400" />
                         <div className="flex space-x-1">
                           {store.socialMedia.facebook && (
                             <a href={store.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                               <Facebook className="h-3 w-3" />
                             </a>
                           )}
                           {store.socialMedia.instagram && (
                             <a href={store.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                               <Instagram className="h-3 w-3" />
                             </a>
                           )}
                           {store.socialMedia.twitter && (
                             <a href={store.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                               <Twitter className="h-3 w-3" />
                             </a>
                           )}
                           {store.socialMedia.tiktok && (
                             <a href={store.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-600">
                               <Share2 className="h-3 w-3" />
                             </a>
                           )}
                         </div>
                       </div>
                     )}
                   </div>

                                     <div className="mt-4 flex space-x-2">
                     <button
                       onClick={() => navigate('/store-manager/dashboard')}
                       className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                     >
                       Gestionar
                     </button>
                     <button
                       onClick={() => setShowInventoryConfig(true)}
                       className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                     >
                       Inventario
                     </button>
                     <button
                       onClick={() => {
                         // Aquí iría la lógica para editar la tienda
                         console.log('Editar tienda:', store._id);
                       }}
                       className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                     >
                       Editar
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón para continuar al dashboard */}
          <div className="text-center">
            <button
              onClick={handleContinueToDashboard}
              className="px-6 py-3 bg-[#FFC300] text-[#333333] font-medium rounded-md hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 flex items-center mx-auto"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Continuar al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

     return (
     <>
       {/* Modal de configuración de inventario */}
       <InventoryConfigModal
         isOpen={showInventoryConfig}
         onClose={() => setShowInventoryConfig(false)}
         onConfigSaved={() => {
           setShowInventoryConfig(false);
           // Aquí podrías mostrar un mensaje de éxito o refrescar datos
         }}
       />
     </>
   );
 };
 
 export default StoreManagerInitializer;
