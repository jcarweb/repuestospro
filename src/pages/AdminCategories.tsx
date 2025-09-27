import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Folder, 
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
  ArrowDown
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  parentCategory?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  order: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categoriesWithProducts: number;
}

const AdminCategories: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: '',
    order: '0'
  });

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || "process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"""""""/api/categories?${params}`, {
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
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/admin/categories/stats', {
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
      fetchCategories();
      fetchStats();
    }
  }, [user, token, searchTerm, selectedStatus]);

  // Crear categoría
  const handleCreateCategory = async () => {
    if (!formData.name || !formData.description) {
              alert(t('adminCategories.errors.requiredFields'));
      return;
    }

    try {
      const categoryData = {
        ...formData,
        order: Number(formData.order) || 0,
        parentCategory: formData.parentCategory || undefined
      };

      const response = await fetch('process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '', description: '', image: '', parentCategory: '', order: '0'
        });
        fetchCategories();
        fetchStats();
        alert(t('adminCategories.messages.categoryCreated'));
      } else {
        alert(data.message || t('adminCategories.errors.createError'));
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert(t('adminCategories.errors.connection'));
    }
  };

  // Actualizar categoría
  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    
    if (!formData.name || !formData.description) {
      alert(t('adminCategories.errors.requiredFields'));
      return;
    }
    
    try {
      const categoryData = {
        ...formData,
        order: Number(formData.order) || 0,
        parentCategory: formData.parentCategory || undefined
      };

      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/categories/${selectedCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        setSelectedCategory(null);
        fetchCategories();
        alert(t('adminCategories.messages.categoryUpdated'));
      } else {
        alert(data.message || t('adminCategories.errors.updateError'));
      }
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      alert(t('adminCategories.errors.connection'));
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm(t('adminCategories.delete.confirm'));
    if (!confirmed) return;

    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
        fetchStats();
        alert(t('adminCategories.messages.categoryDeleted'));
      } else {
        alert(data.message || t('adminCategories.errors.deleteError'));
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert(t('adminCategories.errors.connection'));
    }
  };

  // Cambiar estado de categoría
  const handleToggleStatus = async (categoryId: string) => {
    try {
      const response = await fetch(`process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"/api/categories/${categoryId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
        fetchStats();
        alert(t('adminCategories.messages.statusUpdated'));
      } else {
        alert(data.message || t('adminCategories.errors.statusUpdateError'));
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert(t('adminCategories.errors.connection'));
    }
  };

  // Abrir modal de edición
  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || '',
      parentCategory: category.parentCategory?._id || '',
      order: category.order.toString()
    });
    setShowEditModal(true);
  };

  // Abrir modal de visualización
  const openViewModal = (category: Category) => {
    setSelectedCategory(category);
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

  // Obtener categorías hijas
  const getChildCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentCategory?._id === parentId);
  };

  // Obtener categorías raíz (sin padre)
  const getRootCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  // Renderizar categoría y sus hijos recursivamente
  const renderCategory = (category: Category, level: number = 0) => {
    const childCategories = getChildCategories(category._id);
    const hasChildren = childCategories.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
      <div key={category._id} className="border-b border-gray-200 last:border-b-0">
        <div 
          className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <button
                onClick={() => toggleExpansion(category._id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            <div className="flex items-center space-x-3">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                  <Folder className="w-4 h-4 text-gray-400" />
                </div>
              )}
              
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.description}</div>
                <div className="text-xs text-gray-400">
                  {t('adminCategories.categoryList.order')}: {category.order} • {t('adminCategories.categoryList.products')}: {category.productCount || 0}
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
              {category.isActive ? t('adminCategories.categoryList.active') : t('adminCategories.categoryList.inactive')}
            </span>
            
            <div className="flex space-x-1">
              <button 
                onClick={() => openViewModal(category)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                title={t('adminCategories.categoryList.viewDetails')}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => openEditModal(category)}
                className="text-green-600 hover:text-green-900 p-1 rounded"
                title={t('adminCategories.categoryList.edit')}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleToggleStatus(category._id)}
                className={`p-1 rounded ${
                  category.isActive 
                    ? 'text-orange-600 hover:text-orange-900' 
                    : 'text-green-600 hover:text-green-900'
                }`}
                title={category.isActive ? t('adminCategories.categoryList.deactivate') : t('adminCategories.categoryList.activate')}
              >
                {category.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleDeleteCategory(category._id)}
                className="text-red-600 hover:text-red-900 p-1 rounded"
                title={t('adminCategories.categoryList.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {childCategories.map(child => renderCategory(child, level + 1))}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('adminCategories.accessDenied.title')}</h2>
          <p className="text-gray-600">{t('adminCategories.accessDenied.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('adminCategories.title')}</h1>
        <p className="text-gray-600 mt-2">{t('adminCategories.subtitle')}</p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Folder className="w-8 h-8 text-[#FFC300]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminCategories.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminCategories.stats.active')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminCategories.stats.inactive')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ImageIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{t('adminCategories.stats.withProducts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoriesWithProducts}</p>
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
            placeholder={t('adminCategories.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
        >
          <option value="all">{t('adminCategories.statusFilter.all')}</option>
          <option value="active">{t('adminCategories.statusFilter.active')}</option>
          <option value="inactive">{t('adminCategories.statusFilter.inactive')}</option>
        </select>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-white px-4 py-2 rounded-lg hover:bg-[#E6B000] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('adminCategories.newCategoryButton')}
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC300] mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('adminCategories.loadingCategories')}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('adminCategories.noCategoriesFound')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('adminCategories.createFirstCategory')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {getRootCategories().map(category => renderCategory(category))}
          </div>
        )}
      </div>

             {/* Modal para crear categoría */}
       {showCreateModal && (
         <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
                             <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminCategories.createModal.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.createModal.name')}</label>
                  <input
                    type="text"
                    placeholder={t('adminCategories.createModal.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.createModal.description')}</label>
                  <textarea
                    placeholder={t('adminCategories.createModal.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.createModal.imageUrlOptional')}</label>
                  <input
                    type="url"
                    placeholder={t('adminCategories.createModal.imageUrlPlaceholder')}
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.createModal.parentCategoryOptional')}</label>
                  <select
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({...formData, parentCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="">{t('adminCategories.createModal.noParentCategory')}</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.createModal.order')}</label>
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
                      name: '', description: '', image: '', parentCategory: '', order: '0'
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminCategories.createModal.cancel')}
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
                >
                  {t('adminCategories.createModal.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Modal para editar categoría */}
       {showEditModal && selectedCategory && (
         <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
                             <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminCategories.editModal.title')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.editModal.name')}</label>
                  <input
                    type="text"
                    placeholder={t('adminCategories.editModal.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.editModal.description')}</label>
                  <textarea
                    placeholder={t('adminCategories.editModal.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.editModal.imageUrlOptional')}</label>
                  <input
                    type="url"
                    placeholder={t('adminCategories.editModal.imageUrlPlaceholder')}
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.editModal.parentCategoryOptional')}</label>
                  <select
                    value={formData.parentCategory}
                    onChange={(e) => setFormData({...formData, parentCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFC300] text-gray-900 bg-white"
                  >
                    <option value="">{t('adminCategories.editModal.noParentCategory')}</option>
                    {categories
                      .filter(cat => cat._id !== selectedCategory._id)
                      .map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminCategories.editModal.order')}</label>
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
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminCategories.editModal.cancel')}
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-[#FFC300] text-white rounded-md hover:bg-[#E6B000]"
                >
                  {t('adminCategories.editModal.update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Modal para ver detalles */}
       {showViewModal && selectedCategory && (
         <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
                             <h3 className="text-lg font-medium text-[#FFC300] mb-4">{t('adminCategories.viewModal.title')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.name')}:</label>
                  <p className="text-sm text-gray-900">{selectedCategory.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.description')}:</label>
                  <p className="text-sm text-gray-900">{selectedCategory.description}</p>
                </div>
                {selectedCategory.image && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.image')}:</label>
                    <img 
                      src={selectedCategory.image} 
                      alt={selectedCategory.name}
                      className="w-16 h-16 rounded object-cover mt-1"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.parentCategory')}:</label>
                  <p className="text-sm text-gray-900">
                    {selectedCategory.parentCategory?.name || t('adminCategories.viewModal.noParentCategory')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.order')}:</label>
                  <p className="text-sm text-gray-900">{selectedCategory.order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.status')}:</label>
                  <p className="text-sm text-gray-900">
                    {selectedCategory.isActive ? t('adminCategories.viewModal.active') : t('adminCategories.viewModal.inactive')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.products')}:</label>
                  <p className="text-sm text-gray-900">{selectedCategory.productCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('adminCategories.viewModal.createdAt')}:</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedCategory.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  {t('adminCategories.viewModal.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 