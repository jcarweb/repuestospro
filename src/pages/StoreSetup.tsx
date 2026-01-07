import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';

interface StoreSetupData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  banner: string;
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

const StoreSetup: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStore, setCheckingStore] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [administrativeDivisions, setAdministrativeDivisions] = useState({
    stateRef: '',
    municipalityRef: '',
    parishRef: ''
  });
  const [formData, setFormData] = useState<StoreSetupData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Venezuela',
    phone: '',
    email: user?.email || '',
    website: '',
    logo: '',
    banner: '',
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

  // Obtener divisiones administrativas por defecto
  useEffect(() => {
    const getDefaultAdministrativeDivisions = async () => {
      try {
        // Obtener estados
        const statesResponse = await fetch(`${API_BASE_URL}/api/locations/states`);
        const statesData = await statesResponse.json();
        
        if (statesData.success && statesData.data.length > 0) {
          // Buscar Distrito Capital
          const distritoCapital = statesData.data.find((state: any) => 
            state.name.toLowerCase().includes('distrito') || 
            state.name.toLowerCase().includes('capital')
          );
          
          if (distritoCapital) {
            setAdministrativeDivisions(prev => ({
              ...prev,
              stateRef: distritoCapital._id
            }));
            
            // Obtener municipios del Distrito Capital
            const municipalitiesResponse = await fetch(`${API_BASE_URL}/api/locations/states/${distritoCapital._id}/municipalities`);
            const municipalitiesData = await municipalitiesResponse.json();
            
            if (municipalitiesData.success && municipalitiesData.data.length > 0) {
              // Buscar Libertador
              const libertador = municipalitiesData.data.find((municipality: any) => 
                municipality.name.toLowerCase().includes('libertador')
              );
              
              if (libertador) {
                setAdministrativeDivisions(prev => ({
                  ...prev,
                  municipalityRef: libertador._id
                }));
                
                // Obtener parroquias de Libertador
                const parishesResponse = await fetch(`${API_BASE_URL}/api/locations/municipalities/${libertador._id}/parishes`);
                const parishesData = await parishesResponse.json();
                
                if (parishesData.success && parishesData.data.length > 0) {
                  // Usar la primera parroquia como defecto
                  setAdministrativeDivisions(prev => ({
                    ...prev,
                    parishRef: parishesData.data[0]._id
                  }));
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error obteniendo divisiones administrativas:', error);
        // Usar valores por defecto si hay error
        setAdministrativeDivisions({
          stateRef: '507f1f77bcf86cd799439011',
          municipalityRef: '507f1f77bcf86cd799439012',
          parishRef: '507f1f77bcf86cd799439013'
        });
      }
    };

    getDefaultAdministrativeDivisions();
  }, []);

  // Verificar si el usuario ya tiene una tienda
  useEffect(() => {
    const checkExistingStore = async () => {
      if (!user?.id || !token) {
        setCheckingStore(false);
        return;
      }

      try {
        console.log('🔍 Verificando si el usuario ya tiene tiendas...');
        console.log('🔍 User ID:', user.id);
        console.log('🔍 Token disponible:', !!token);
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        
        const url = `${API_BASE_URL}/api/stores/user/stores`;
        console.log('🔍 URL completa:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔍 Respuesta de verificación de tiendas:', data);
        
        if (data.success && data.data && data.data.length > 0) {
          // El usuario ya tiene una tienda, redirigir al dashboard
          console.log(`✅ Usuario ya tiene ${data.data.length} tienda(s), redirigiendo al dashboard`);
          navigate('/store-manager/dashboard', { replace: true });
          return;
        } else {
          console.log('✅ Usuario no tiene tiendas, mostrando formulario de setup');
        }
      } catch (error) {
        console.error('❌ Error verificando tienda existente:', error);
        console.log('⚠️ Error en verificación, mostrando formulario de setup');
        // En caso de error, mostrar el formulario de setup
      } finally {
        setCheckingStore(false);
      }
    };

    checkExistingStore();
  }, [user?.id, token, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.address && formData.city && formData.state && formData.phone);
      case 2:
        return !!(formData.latitude && formData.longitude);
      case 3:
        return true; // Configuración opcional
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos en el formato que espera el backend
      const storeData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo: formData.logo,
        banner: formData.banner,
        coordinates: {
          latitude: Number(formData.latitude) || 0,
          longitude: Number(formData.longitude) || 0
        },
        // Campos requeridos por el backend - usar IDs reales obtenidos
        stateRef: administrativeDivisions.stateRef,
        municipalityRef: administrativeDivisions.municipalityRef,
        parishRef: administrativeDivisions.parishRef,
        businessHours: formData.businessHours,
        settings: {
          currency: formData.currency,
          taxRate: Number(formData.taxRate),
          deliveryRadius: Number(formData.deliveryRadius),
          minimumOrder: Number(formData.minimumOrder),
          autoAcceptOrders: formData.autoAcceptOrders
        }
      };

      console.log('Enviando datos de tienda:', storeData);

      const response = await fetch(`${API_BASE_URL}/api/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      const data = await response.json();
      console.log('Datos de respuesta:', data);
      
      if (data.success) {
        alert('¡Tienda creada exitosamente! Ahora puedes comenzar a gestionar tus productos.');
        navigate('/store-manager/dashboard');
      } else {
        alert(data.message || 'Error creando la tienda');
      }
    } catch (error) {
      console.error('Error creando tienda:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica si ya tiene tienda
  if (checkingStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando...</h2>
          <p className="text-gray-600">Comprobando si ya tienes una tienda configurada.</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'store_manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Store className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Tienda</h1>
          </div>
          <p className="text-gray-600">Configura tu tienda para comenzar a gestionar productos</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-semibold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Información Básica
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Ubicación
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Configuración
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Información Básica de la Tienda</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Tienda *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: AutoParts Express"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe tu tienda y los servicios que ofreces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Av. Principal #123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Caracas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Distrito Capital"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1010"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: +58 212 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tienda@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.tutienda.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Ubicación */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ubicación de la Tienda</h2>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Nota:</strong> Las coordenadas son importantes para que los clientes puedan encontrar tu tienda en el mapa. 
                  Puedes obtenerlas desde Google Maps haciendo clic derecho en tu ubicación.
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setFormData(prev => ({
                                ...prev,
                                latitude: position.coords.latitude.toString(),
                                longitude: position.coords.longitude.toString()
                              }));
                            },
                            (error) => {
                              console.error('Error obteniendo ubicación:', error);
                              alert('No se pudo obtener tu ubicación. Por favor, ingresa las coordenadas manualmente.');
                            }
                          );
                        } else {
                          alert('Tu navegador no soporta geolocalización. Por favor, ingresa las coordenadas manualmente.');
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      📍 Obtener mi ubicación actual
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 10.4806"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: -66.9036"
                  />
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Cómo obtener las coordenadas:</h3>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Ve a <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                  <li>2. Busca la dirección de tu tienda</li>
                  <li>3. Haz clic derecho en el punto exacto de tu tienda</li>
                  <li>4. Selecciona las coordenadas que aparecen en la parte superior</li>
                  <li>5. Copia y pega los números en los campos de arriba</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 3: Configuración */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuración de Negocio</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="VES">VES - Bolívar Soberano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de IVA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="16.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radio de Entrega (km)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pedido Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.minimumOrder}
                    onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoAcceptOrders"
                  checked={formData.autoAcceptOrders}
                  onChange={(e) => handleInputChange('autoAcceptOrders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoAcceptOrders" className="ml-2 text-sm text-gray-700">
                  Aceptar pedidos automáticamente
                </label>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de Atención</h3>
                <div className="space-y-3">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day === 'monday' ? 'Lunes' :
                           day === 'tuesday' ? 'Martes' :
                           day === 'wednesday' ? 'Miércoles' :
                           day === 'thursday' ? 'Jueves' :
                           day === 'friday' ? 'Viernes' :
                           day === 'saturday' ? 'Sábado' : 'Domingo'}
                        </span>
                      </div>
                      
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      
                      {hours.isOpen && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-gray-500">a</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </>
                      )}
                      
                      {!hours.isOpen && (
                        <span className="text-gray-500 text-sm">Cerrado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Tienda
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSetup;
