import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Car,
  Truck,
  Bike,
  Bus,
  Layers
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
    name: string;
  };
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bus';
  isActive: boolean;
  order: number;
  icon?: string;
  image?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface SubcategoryStats {
  totalSubcategories: number;
  activeSubcategories: number;
  inactiveSubcategories: number;
  subcategoriesWithProducts: number;
  byVehicleType: {
    car: number;
    motorcycle: number;
    truck: number;
    bus: number;
  };
}

const AdminSubcategories: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<SubcategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    vehicleType: 'car' as 'car' | 'motorcycle' | 'truck' | 'bus',
    order: '0',
    icon: '',
    image: ''
  });

  // Cargar subcategorías
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedVehicleType !== 'all') params.append('vehicleType', selectedVehicleType);
      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000""""""""/api/subcategories?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSubcategories(data.data);
      }
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/admin/subcategories/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchSubcategories();
      fetchCategories();
      fetchStats();
    }
  }, [user, token, searchTerm, selectedCategory, selectedVehicleType, selectedStatus]);

  // Crear subcategoría
  const handleCreateSubcategory = async () => {
    if (!formData.name || !formData.categoryId) {
      alert(t('adminSubcategories.errors.requiredFields'));
      return;
    }

    try {
      const subcategoryData = {
        ...formData,
        order: Number(formData.order) || 0
      };

      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '', description: '', categoryId: '', vehicleType: 'car', order: '0', icon: '', image: ''
        });
        fetchSubcategories();
        fetchStats();
        alert(t('adminSubcategories.messages.subcategoryCreated'));
      } else {
        alert(data.message || t('adminSubcategories.errors.creatingSubcategory'));
      }
    } catch (error) {
      console.error('Error creando subcategoría:', error);
      alert(t('adminSubcategories.errors.connection'));
    }
  };

  // Actualizar subcategoría
  const handleUpdateSubcategory = async () => {
    if (!selectedSubcategory) return;
    
    if (!formData.name || !formData.categoryId) {
      alert(t('adminSubcategories.errors.requiredFields'));
      return;
    }
    
    try {
      const subcategoryData = {
        ...formData,
        order: Number(formData.order) || 0
      };

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/subcategories/${selectedSubcategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedSubcategory(null);
        fetchSubcategories();
        alert(t('adminSubcategories.messages.subcategoryUpdated'));
      } else {
        alert(data.message || t('adminSubcategories.errors.updatingSubcategory'));
      }
    } catch (error) {
      console.error('Error actualizando subcategoría:', error);
      alert(t('adminSubcategories.errors.connection'));
    }
  };

  // Eliminar subcategoría
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    const confirmed = window.confirm(t('adminSubcategories.confirm.delete'));
    if (!confirmed) return;

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSubcategories();
        fetchStats();
        alert(t('adminSubcategories.messages.subcategoryDeleted'));
      } else {
        alert(data.message || t('adminSubcategories.errors.deletingSubcategory'));
      }
    } catch (error) {
      console.error('Error eliminando subcategoría:', error);
      alert(t('adminSubcategories.errors.connection'));
    }
  };

  // Cambiar estado de subcategoría
  const handleToggleStatus = async (subcategoryId: string) => {
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/subcategories/${subcategoryId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchSubcategories();
        fetchStats();
        alert(t('adminSubcategories.messages.statusUpdated'));
      } else {
        alert(data.message || t('adminSubcategories.errors.updatingStatus'));
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert(t('adminSubcategories.errors.connection'));
    }
  };

  // Abrir modal de edición
  const openEditModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId._id,
      vehicleType: subcategory.vehicleType,
      order: subcategory.order.toString(),
      icon: subcategory.icon || '',
      image: subcategory.image || ''
    });
    setShowEditModal(true);
  };

  // Abrir modal de visualización
  const openViewModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowViewModal(true);
  };

  // Manejar expansión de categorías
  const toggleExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Obtener subcategorías por categoría
  const getSubcategoriesByCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.categoryId._id === categoryId);
  };

  // Obtener icono de tipo de vehículo
  const getVehicleTypeIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return <Car className="w-4 h-4" />;
      case 'motorcycle': return <Bike className="w-4 h-4" />;
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  // Renderizar subcategoría
  const renderSubcategory = (subcategory: Subcategory) => {
    return (
      <div key={subcategory._id} className="border-b border-gray-200 last:border-b-0">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 ml-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              {subcategory.image ? (
                <img 
                  src={subcategory.image} 
                  alt={subcategory.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                </div>
              )}
              
              <div>
                <div className="font-medium text-gray-900">{subcategory.name}</div>
                <div className="text-sm text-gray-500">{subcategory.description}</div>
                <div className="text-xs text-gray-400">
                  {t('adminSubcategories.order')}: {subcategory.order} • {t('adminSubcategories.products')}: {subcategory.productCount || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-gray-500">
              {getVehicleTypeIcon(subcategory.vehicleType)}
              <span className="text-xs capitalize">{subcategory.vehicleType}</span>
            </div>
            
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              subcategory.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {subcategory.isActive ? t('adminSubcategories.status.active') : t('adminSubcategories.status.inactive')}
            </span>
            
            <div className="flex space-x-1">
              <button 
                onClick={() => openViewModal(subcategory)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                title={t('adminSubcategories.actions.viewDetails')}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => openEditModal(subcategory)}
                className="text-green-600 hover:text-green-900 p-1 rounded"
                title={t('adminSubcategories.actions.edit')}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleToggleStatus(subcategory._id)}
                className={`p-1 rounded ${
                  subcategory.isActive 
                    ? 'text-orange-600 hover:text-orange-900' 
                    : 'text-green-600 hover:text-green-900'
                }`}
                title={subcategory.isActive ? t('adminSubcategories.actions.deactivate') : t('adminSubcategories.actions.activate')}
              >
                {subcategory.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleDeleteSubcategory(subcategory._id)}
                className="text-red-600 hover:text-red-900 p-1 rounded"
                title={t('adminSubcategories.actions.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar categoría y sus subcategorías
  const renderCategoryWithSubcategories = (category: Category) => {
    const categorySubcategories = getSubcategoriesByCategory(category._id);
    const hasSubcategories = categorySubcategories.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
      <div key={category._id} className="border-b border-gray-200 last:border-b-0">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 bg-gray-50">
          <div className="flex items-center space-x-3">
            {hasSubcategories && (
              <button
                onClick={() => toggleExpansion(category._id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasSubcategories && <div className="w-4" />}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.description}</div>
                <div className="text-xs text-gray-400">
                  {t('adminSubcategories.subcategories')}: {categorySubcategories.length}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? t('adminSubcategories.status.active') : t('adminSubcategories.status.inactive')}
            </span>
          </div>
        </div>

        {hasSubcategories && isExpanded && (
          <div className="bg-white">
            {categorySubcategories.map(subcategory => renderSubcategory(subcategory))}
          </div>
        )}
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminSubcategories.accessDenied.title')}</h2>
          <p className="text-gray-600">{t('adminSubcategories.access.noPermissions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminSubcategories.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminSubcategories.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
                             <FolderOpen className="w-8 h-8 text-[#FFC300]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubcategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubcategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.inactive')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveSubcategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ImageIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.withProducts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.subcategoriesWithProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.automobiles')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byVehicleType.car}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Bike className="w-8 h-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminSubcategories.stats.motorcycles')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byVehicleType.motorcycle}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('adminSubcategories.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminSubcategories.allCategories')}</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>

        <select
          value={selectedVehicleType}
          onChange={(e) => setSelectedVehicleType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminSubcategories.allTypes')}</option>
          <option value="car">{t('adminSubcategories.vehicleTypes.car')}</option>
          <option value="motorcycle">{t('adminSubcategories.vehicleTypes.motorcycle')}</option>
          <option value="truck">{t('adminSubcategories.vehicleTypes.truck')}</option>
          <option value="bus">{t('adminSubcategories.vehicleTypes.bus')}</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminSubcategories.allStatuses')}</option>
          <option value="active">{t('adminSubcategories.active')}</option>
          <option value="inactive">{t('adminSubcategories.inactive')}</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-white px-4 py-2 rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('adminSubcategories.newSubcategory')}
        </button>
      </div>

      {/* Lista de subcategorías */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('adminSubcategories.loading')}</p>
          </div>
        ) : subcategories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('adminSubcategories.noSubcategories')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('adminSubcategories.createFirst')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map(category => renderCategoryWithSubcategories(category))}
          </div>
        )}
      </div>

      {/* Modal para crear subcategoría */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminSubcategories.modals.create.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.name')} *</label>
                  <input
                    type="text"
                    placeholder={t('adminSubcategories.modals.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.description')}</label>
                  <textarea
                    placeholder={t('adminSubcategories.modals.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.category')} *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="">{t('adminSubcategories.modals.selectCategory')}</option>
                    {categories.filter(cat => cat.isActive).map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.vehicleType')} *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="car">{t('adminSubcategories.modals.car')}</option>
                    <option value="motorcycle">{t('adminSubcategories.modals.motorcycle')}</option>
                    <option value="truck">{t('adminSubcategories.modals.truck')}</option>
                    <option value="bus">{t('adminSubcategories.modals.bus')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.imageUrl')}</label>
                  <input
                    type="url"
                    placeholder={t('adminSubcategories.modals.imagePlaceholder')}
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.order')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '', description: '', categoryId: '', vehicleType: 'car', order: '0', icon: '', image: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminSubcategories.modals.cancel')}
                </button>
                <button
                  onClick={handleCreateSubcategory}
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
                >
                  {t('adminSubcategories.modals.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar subcategoría */}
      {showEditModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminSubcategories.modals.edit.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.name')} *</label>
                  <input
                    type="text"
                    placeholder={t('adminSubcategories.modals.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.description')}</label>
                  <textarea
                    placeholder={t('adminSubcategories.modals.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.category')} *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="">{t('adminSubcategories.modals.selectCategory')}</option>
                    {categories.filter(cat => cat.isActive).map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.vehicleType')} *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="car">{t('adminSubcategories.modals.car')}</option>
                    <option value="motorcycle">{t('adminSubcategories.modals.motorcycle')}</option>
                    <option value="truck">{t('adminSubcategories.modals.truck')}</option>
                    <option value="bus">{t('adminSubcategories.modals.bus')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.imageUrl')}</label>
                  <input
                    type="url"
                    placeholder={t('adminSubcategories.modals.imagePlaceholder')}
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminSubcategories.modals.order')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSubcategory(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminSubcategories.modals.cancel')}
                </button>
                <button
                  onClick={handleUpdateSubcategory}
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
                >
                  {t('adminSubcategories.modals.update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminSubcategories.modals.view.title')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.name')}:</label>
                  <p className="text-sm text-gray-900">{selectedSubcategory.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.description')}:</label>
                  <p className="text-sm text-gray-900">{selectedSubcategory.description || t('adminSubcategories.modals.noDescription')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.category')}:</label>
                  <p className="text-sm text-gray-900">{selectedSubcategory.categoryId.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.vehicleTypeLabel')}:</label>
                  <div className="flex items-center space-x-2">
                    {getVehicleTypeIcon(selectedSubcategory.vehicleType)}
                    <span className="text-sm text-gray-900 capitalize">{selectedSubcategory.vehicleType}</span>
                  </div>
                </div>
                {selectedSubcategory.image && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.image')}:</label>
                    <img 
                      src={selectedSubcategory.image} 
                      alt={selectedSubcategory.name}
                      className="w-16 h-16 rounded object-cover mt-1"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.order')}:</label>
                  <p className="text-sm text-gray-900">{selectedSubcategory.order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.status')}:</label>
                  <p className="text-sm text-gray-900">
                    {selectedSubcategory.isActive ? t('adminSubcategories.status.active') : t('adminSubcategories.status.inactive')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.products')}:</label>
                  <p className="text-sm text-gray-900">{selectedSubcategory.productCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminSubcategories.modals.created')}:</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedSubcategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminSubcategories.modals.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;
