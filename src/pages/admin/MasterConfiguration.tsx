import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Car, 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Package,
  Award,
  Search
} from 'lucide-react';

// Interfaces
interface VehicleType {
  _id: string;
  name: string;
  description?: string;
  deliveryType: 'delivery_motorizado' | 'pickup';
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  _id: string;
  name: string;
  description?: string;
  vehicleTypes: VehicleType[];
  country?: string;
  website?: string;
  logo?: string;
  history?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  category: Category;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

type MasterType = 'vehicle-types' | 'brands' | 'categories' | 'subcategories';

const MasterConfiguration: React.FC = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<MasterType>('vehicle-types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para los datos
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  // Estados para paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('');
  
  // Estados para formularios
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Configuración de tabs
  const tabs = [
    { id: 'vehicle-types', label: 'Tipos de Vehículo', icon: Car, color: 'bg-blue-500' },
    { id: 'brands', label: 'Marcas', icon: Award, color: 'bg-green-500' },
    { id: 'categories', label: 'Categorías', icon: Package, color: 'bg-purple-500' },
    { id: 'subcategories', label: 'Subcategorías', icon: Layers, color: 'bg-orange-500' }
  ];

  // Cargar datos según el tab activo
  useEffect(() => {
    if (token) {
      console.log('🔍 MasterConfiguration - useEffect triggered, loading data');
      setPagination(prev => ({ ...prev, page: 1 }));
      setSearchTerm('');
      setVehicleTypeFilter('');
      loadData(1, '', '');
    } else {
      console.log('🔍 MasterConfiguration - No token available, skipping data load');
    }
  }, [activeTab, token]);

  // Debug effect to monitor token changes
  useEffect(() => {
    console.log('🔍 MasterConfiguration - Token changed:', token ? 'present' : 'missing');
    console.log('🔍 MasterConfiguration - User:', user);
  }, [token, user]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🔍 MasterConfiguration - Unhandled promise rejection:', event.reason);
      setError('Error inesperado: ' + (event.reason?.message || 'Error desconocido'));
    };

    const handleError = (event: ErrorEvent) => {
      console.error('🔍 MasterConfiguration - Global error:', event.error);
      setError('Error inesperado: ' + (event.error?.message || 'Error desconocido'));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Cargar tipos de vehículos cuando se necesiten para el formulario de marcas
  useEffect(() => {
    console.log('🔍 MasterConfiguration - useEffect activeTab:', activeTab);
    console.log('🔍 MasterConfiguration - vehicleTypes.length:', vehicleTypes.length);
    console.log('🔍 MasterConfiguration - vehicleTypes actuales:', vehicleTypes.map(vt => ({ name: vt.name, id: vt._id })));
    
    if (activeTab === 'brands' && vehicleTypes.length === 0) {
      console.log('🔍 MasterConfiguration - Cargando tipos de vehículo...');
      loadVehicleTypes();
    }
  }, [activeTab, vehicleTypes.length]);

  // Efecto adicional para forzar la carga de tipos de vehículo
  useEffect(() => {
    if (activeTab === 'brands') {
      console.log('🔍 MasterConfiguration - Efecto adicional - activeTab es brands');
      console.log('🔍 MasterConfiguration - Efecto adicional - vehicleTypes.length:', vehicleTypes.length);
      
      // Si no hay tipos de vehículo cargados, forzar la carga
      if (vehicleTypes.length === 0) {
        console.log('🔍 MasterConfiguration - Efecto adicional - Forzando carga de tipos de vehículo');
        loadVehicleTypes();
      }
    }
  }, [activeTab]);

  const loadVehicleTypes = async () => {
    try {
      if (!token) {
        console.warn('No token available for loading vehicle types');
        return;
      }

      console.log('🔍 MasterConfiguration - Cargando tipos de vehículo...');
      console.log('🔍 MasterConfiguration - Token:', token ? 'present' : 'missing');
      
      const response = await fetch(`${API_BASE_URL}/masters/vehicle-types?limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('🔍 MasterConfiguration - Response status:', response.status);
      console.log('🔍 MasterConfiguration - Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 MasterConfiguration - Response data:', data);
        
        if (data.success) {
          console.log('🔍 MasterConfiguration - Tipos de vehículo cargados:', data.data.length);
          console.log('🔍 MasterConfiguration - Datos de tipos:', data.data.map(vt => ({ name: vt.name, id: vt._id })));
          
          // Verificar específicamente maquinaria agrícola
          const agricultural = data.data.find(vt => vt.name === 'maquinaria agrícola');
          if (agricultural) {
            console.log('🔍 MasterConfiguration - Maquinaria agrícola encontrada:', agricultural._id);
          } else {
            console.log('❌ MasterConfiguration - Maquinaria agrícola NO encontrada en la respuesta de la API');
          }
          
          setVehicleTypes(data.data);
          console.log('🔍 MasterConfiguration - Estado vehicleTypes actualizado');
        } else {
          console.error('Error en la respuesta de la API:', data.message);
        }
      } else {
        console.error('Error loading vehicle types:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error cargando tipos de vehículos:', error);
    }
  };

  const loadData = async (page = 1, search = '', vehicleType = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar autenticación antes de hacer la petición
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      console.log('🔍 MasterConfiguration - Iniciando loadData');
      console.log('🔍 MasterConfiguration - Token:', token ? 'present' : 'missing');
      console.log('🔍 MasterConfiguration - Active tab:', activeTab);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (vehicleType && activeTab === 'brands') {
        params.append('vehicleType', vehicleType);
        console.log('🔍 MasterConfiguration - Agregando vehicleType al filtro:', vehicleType);
      }

      const url = `${API_BASE_URL}/masters/${activeTab}?${params}`;
      console.log('🔍 MasterConfiguration - URL:', url);
      console.log('🔍 MasterConfiguration - Parámetros completos:', Object.fromEntries(params));

      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('🔍 MasterConfiguration - Headers:', headers);
      console.log('🔍 MasterConfiguration - Making request...');

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      console.log('🔍 MasterConfiguration - Response status:', response.status);
      console.log('🔍 MasterConfiguration - Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `Error al cargar los datos: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          // Si es error de autenticación, redirigir al login
          if (response.status === 401 || response.status === 403) {
            console.log('🔍 MasterConfiguration - Authentication error, redirecting to login');
            // No hacer logout aquí para evitar loops, solo mostrar error
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('🔍 MasterConfiguration - Response data:', data);
      
      if (data.success) {
        switch (activeTab) {
          case 'vehicle-types':
            setVehicleTypes(data.data);
            console.log('🔍 MasterConfiguration - Vehicle types set:', data.data.length);
            break;
          case 'brands':
            setBrands(data.data);
            console.log('🔍 MasterConfiguration - Brands set:', data.data.length);
            break;
          case 'categories':
            setCategories(data.data);
            console.log('🔍 MasterConfiguration - Categories set:', data.data.length);
            break;
          case 'subcategories':
            setSubcategories(data.data);
            console.log('🔍 MasterConfiguration - Subcategories set:', data.data.length);
            break;
        }
        
        if (data.pagination) {
          setPagination(data.pagination);
          console.log('🔍 MasterConfiguration - Pagination set:', data.pagination);
        }
      } else {
        throw new Error(data.message || 'Error al cargar los datos');
      }
    } catch (error: any) {
      console.error('🔍 MasterConfiguration - Error:', error);
      console.error('🔍 MasterConfiguration - Error type:', typeof error);
      console.error('🔍 MasterConfiguration - Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('🔍 MasterConfiguration - Error message:', error instanceof Error ? error.message : 'Unknown');
      
      // Manejar errores de red específicamente
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    if (!token) {
      setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/masters/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Error al eliminar el elemento';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing delete response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Elemento eliminado exitosamente');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.message || 'Error al eliminar el elemento');
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleTypeFilter = (vehicleType: string) => {
    console.log('🔍 MasterConfiguration - Filtro de tipo de vehículo seleccionado:', vehicleType);
    console.log('🔍 MasterConfiguration - Tipos disponibles:', vehicleTypes.map(vt => ({ name: vt.name, id: vt._id })));
    
    // Mapeo de IDs incorrectos a correctos
    const idMapping: { [key: string]: string } = {
      '68c2cf4e1fcfdca87558f09a': '68c2ce030a382362d8d5568b', // maquinaria agrícola incorrecto -> correcto
      '68c2cf4e1fcfdca87558f09b': '68c2ce030a382362d8d55689', // maquinaria industrial incorrecto -> correcto
      '68c2cf4e1fcfdca87558f09c': '68c2ce030a382362d8d55682', // automóviles incorrecto -> correcto
      '68c2cf4e1fcfdca87558f09d': '68c2ce030a382362d8d55687', // camiones incorrecto -> correcto
      '68c2cf4e1fcfdca87558f09e': '68c2ce030a382362d8d55685'  // motos incorrecto -> correcto
    };
    
    // Verificar si el ID seleccionado existe en los tipos disponibles
    let correctedVehicleType = vehicleType;
    const selectedType = vehicleTypes.find(vt => vt._id === vehicleType);
    
    if (selectedType) {
      console.log('✅ MasterConfiguration - Tipo seleccionado encontrado:', selectedType.name, selectedType._id);
    } else {
      console.log('❌ MasterConfiguration - Tipo seleccionado NO encontrado en los tipos disponibles');
      
      // Intentar corregir usando el mapeo
      if (idMapping[vehicleType]) {
        correctedVehicleType = idMapping[vehicleType];
        console.log('🔧 MasterConfiguration - ID corregido usando mapeo:', vehicleType, '->', correctedVehicleType);
      } else {
        // Buscar por nombre como fallback
        console.log('🔍 MasterConfiguration - Buscando tipo con nombre "maquinaria agrícola"...');
        const agricultural = vehicleTypes.find(vt => vt.name === 'maquinaria agrícola');
        if (agricultural) {
          correctedVehicleType = agricultural._id;
          console.log('✅ MasterConfiguration - Maquinaria agrícola encontrada:', agricultural._id);
        } else {
          console.log('❌ MasterConfiguration - No se pudo corregir el ID');
        }
      }
    }
    
    console.log('🔍 MasterConfiguration - ID final a usar:', correctedVehicleType);
    setVehicleTypeFilter(correctedVehicleType);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(1, searchTerm, correctedVehicleType);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setVehicleTypeFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(1, '', '');
  };

  const forceReload = () => {
    console.log('🔄 MasterConfiguration - Forzando recarga completa...');
    
    // Limpiar todos los estados
    setVehicleTypes([]);
    setBrands([]);
    setCategories([]);
    setSubcategories([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchTerm('');
    setVehicleTypeFilter('');
    
    // Limpiar localStorage y sessionStorage completamente
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🔄 MasterConfiguration - Cache del navegador limpiado completamente');
    } catch (error) {
      console.log('🔄 MasterConfiguration - No se pudo limpiar el cache:', error);
    }
    
    // Forzar recarga de la página con cache busting
    setTimeout(() => {
      console.log('🔄 MasterConfiguration - Recargando página con cache busting...');
      window.location.href = window.location.href + '?t=' + Date.now();
    }, 500);
  };

  const forceReloadVehicleTypes = async () => {
    console.log('🔄 MasterConfiguration - Forzando recarga de tipos de vehículo...');
    
    // Limpiar tipos de vehículo
    setVehicleTypes([]);
    
    // Recargar tipos de vehículo
    await loadVehicleTypes();
    
    // Esperar un momento y luego recargar datos
    setTimeout(() => {
      console.log('🔄 MasterConfiguration - Recargando datos después de cargar tipos...');
      loadData(1, searchTerm, '');
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
        const url = editingItem 
          ? `${API_BASE_URL}/masters/${activeTab}/${editingItem._id}`
          : `${API_BASE_URL}/masters/${activeTab}`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Error al guardar el elemento';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing submit response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingItem ? 'Elemento actualizado exitosamente' : 'Elemento creado exitosamente');
        setShowForm(false);
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.message || 'Error al guardar el elemento');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'vehicle-types':
        return {
          name: '',
          description: '',
          deliveryType: 'delivery_motorizado',
          icon: '',
          isActive: true
        };
      case 'brands':
        return {
          name: '',
          description: '',
          vehicleTypes: [],
          country: '',
          website: '',
          logo: '',
          history: '',
          isActive: true
        };
      case 'categories':
        return {
          name: '',
          description: '',
          icon: '',
          color: '',
          sortOrder: 0,
          isActive: true
        };
      case 'subcategories':
        return {
          name: '',
          description: '',
          category: '',
          sortOrder: 0,
          isActive: true
        };
      default:
        return {};
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'vehicle-types':
        return vehicleTypes;
      case 'brands':
        return brands;
      case 'categories':
        return categories;
      case 'subcategories':
        return subcategories;
      default:
        return [];
    }
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? 'Editar' : 'Crear'} {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'vehicle-types' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Despacho *
                  </label>
                  <select
                    value={formData.deliveryType || 'delivery_motorizado'}
                    onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  >
                    <option value="delivery_motorizado">Delivery Motorizado</option>
                    <option value="pickup">Pick up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    placeholder="Nombre del icono de Lucide React"
                  />
                </div>
              </>
            )}

            {activeTab === 'brands' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipos de Vehículo *
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {vehicleTypes.map((vehicleType) => (
                      <label key={vehicleType._id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.vehicleTypes?.includes(vehicleType._id) || false}
                          onChange={(e) => {
                            const currentTypes = formData.vehicleTypes || [];
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                vehicleTypes: [...currentTypes, vehicleType._id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                vehicleTypes: currentTypes.filter((id: string) => id !== vehicleType._id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{vehicleType.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Historia de la Marca
                  </label>
                  <textarea
                    value={formData.history || ''}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    rows={4}
                  />
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    placeholder="Nombre del icono de Lucide React"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    placeholder="Ej: #FFC300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder || 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>
              </>
            )}

            {activeTab === 'subcategories' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder || 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-[#FFC300] focus:ring-[#FFC300]"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Activo
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const data = getCurrentData();
    
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300]"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay elementos registrados</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              {activeTab === 'brands' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipos de Vehículo
                </th>
              )}
              {activeTab === 'subcategories' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item: any) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    )}
                  </div>
                </td>
                {activeTab === 'brands' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.vehicleTypes?.map((vehicleType: any) => (
                        <span
                          key={vehicleType._id}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {vehicleType.name}
                        </span>
                      ))}
                    </div>
                  </td>
                )}
                {activeTab === 'subcategories' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {item.category?.name}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-[#FFC300] hover:text-[#FFB800]"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Mostrar mensaje si no hay autenticación
  if (!token) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-[#FFC300] rounded-lg">
              <Settings className="h-6 w-6 text-[#333333]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuración de Maestros
            </h1>
          </div>
          <p className="text-gray-600">
            Administra los tipos de vehículos, marcas, categorías y subcategorías del sistema
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p>No hay token de autenticación. Por favor, inicia sesión para acceder a esta funcionalidad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#FFC300] rounded-lg">
            <Settings className="h-6 w-6 text-[#333333]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configuración de Maestros
          </h1>
        </div>
        <p className="text-gray-600">
          Administra los tipos de vehículos, marcas, categorías y subcategorías del sistema
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MasterType)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#FFC300] text-[#FFC300]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Búsqueda y Botón Crear */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadData(1, searchTerm, vehicleTypeFilter);
                  }
                }}
                className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
              />
              <button
                onClick={() => loadData(1, searchTerm, vehicleTypeFilter)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            
            {/* Filtro por tipo de vehículo - Solo para marcas */}
            {activeTab === 'brands' && vehicleTypes.length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => handleVehicleTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFC300] focus:border-[#FFC300]"
                >
                  <option value="">Todos los tipos</option>
                  {vehicleTypes.map((vehicleType) => (
                    <option key={vehicleType._id} value={vehicleType._id}>
                      {vehicleType.name}
                    </option>
                  ))}
                </select>
                {vehicleTypeFilter && (
                  <button
                    onClick={clearFilters}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              {pagination.total} elementos registrados
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={forceReloadVehicleTypes}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Recargar tipos de vehículo"
          >
            <Car className="h-4 w-4" />
            <span>Recargar Tipos</span>
          </button>
          <button
            onClick={forceReload}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Recargar datos"
          >
            <Settings className="h-4 w-4" />
            <span>Recargar</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#FFB800] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Crear</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      {renderTable()}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadData(pagination.page - 1, searchTerm, vehicleTypeFilter)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
              if (pageNum > pagination.pages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => loadData(pageNum, searchTerm, vehicleTypeFilter)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    pageNum === pagination.page
                      ? 'bg-[#FFC300] text-[#333333] border-[#FFC300]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => loadData(pagination.page + 1, searchTerm, vehicleTypeFilter)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Formulario Modal */}
      {renderForm()}
    </div>
  );
};

export default MasterConfiguration;
