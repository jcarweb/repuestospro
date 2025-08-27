import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { 
  X, 
  Save, 
  Calendar,
  Clock,
  Tag,
  Percent,
  DollarSign,
  Package,
  ShoppingCart,
  Edit3,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  sku: string;
  category: {
    _id: string;
    name: string;
  };
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Store {
  _id: string;
  name: string;
  isMainStore: boolean;
}

interface Promotion {
  _id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  customText?: string;
  products: Product[];
  categories?: Category[];
  store: {
    _id: string;
    name: string;
  };
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  ribbonText: string;
  ribbonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOriginalPrice: boolean;
  showDiscountAmount: boolean;
  maxUses?: number;
  currentUses: number;
  scope?: 'store' | 'all_branches' | 'specific_branches';
  targetBranches?: string[];
  isMainStorePromotion?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Promotion | null;
  isEditing?: boolean;
  isLoading?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { activeStore } = useActiveStore();

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom',
    discountPercentage: '',
    discountAmount: '',
    buyQuantity: '',
    getQuantity: '',
    customText: '',
    products: [] as string[],
    categories: [] as string[],
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    isActive: true,
    ribbonText: 'PROMO',
    ribbonPosition: 'top-left' as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    showOriginalPrice: true,
    showDiscountAmount: true,
    maxUses: '',
    // Nuevos campos para alcance
    scope: 'store' as 'store' | 'all_branches' | 'specific_branches',
    targetBranches: [] as string[]
  });

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Store[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setProducts([]); // Inicializar como array vacío
      
      // Verificar si hay token válido
      if (!token) {
        console.error('No hay token válido para cargar productos');
        return;
      }
      
      const response = await fetch('/api/products/store-manager/all?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Productos cargados:', data);
        console.log('🔍 Estructura de datos:', {
          hasData: !!data.data,
          hasProducts: !!data.data?.products,
          productsIsArray: Array.isArray(data.data?.products),
          productsLength: data.data?.products?.length || 0
        });
        
        // Manejar diferentes formatos de respuesta y asegurar que sea un array
        const productsData = data.data?.products || data.products || data.data || [];
        console.log('🔍 Productos procesados:', productsData.length);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        console.error('Error en respuesta de productos:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        setProducts([]); // Asegurar array vacío en caso de error
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]); // Asegurar array vacío en caso de error
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategories([]); // Inicializar como array vacío
      
      // Verificar si hay token válido
      if (!token) {
        console.error('No hay token válido para cargar categorías');
        return;
      }
      
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Categorías cargadas:', data);
        console.log('🔍 Estructura de categorías:', {
          hasData: !!data.data,
          dataIsArray: Array.isArray(data.data),
          categoriesLength: data.data?.length || 0
        });
        
        // Manejar diferentes formatos de respuesta y asegurar que sea un array
        const categoriesData = data.data?.categories || data.categories || data.data || [];
        console.log('🔍 Categorías procesadas:', categoriesData.length);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error('Error en respuesta de categorías:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        setCategories([]); // Asegurar array vacío en caso de error
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]); // Asegurar array vacío en caso de error
    } finally {
      setLoadingCategories(false);
    }
  };

  // Cargar sucursales (solo para tienda principal)
  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      setBranches([]); // Inicializar como array vacío
      
      // Verificar si hay token válido
      if (!token) {
        console.error('No hay token válido para cargar sucursales');
        return;
      }
      
      const response = await fetch('/api/stores/branches', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Sucursales cargadas:', data);
        
        // Manejar diferentes formatos de respuesta y asegurar que sea un array
        const branchesData = data.data?.branches || data.branches || data.data || [];
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } else {
        console.error('Error en respuesta de sucursales:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        setBranches([]); // Asegurar array vacío en caso de error
      }
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      setBranches([]); // Asegurar array vacío en caso de error
    } finally {
      setLoadingBranches(false);
    }
  };

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
      
      // Cargar sucursales solo si es tienda principal
      if (activeStore?.isMainStore) {
        loadBranches();
      }
    }
  }, [isOpen]);

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (initialData && isEditing) {
             setFormData({
         name: initialData.name,
         description: initialData.description,
         type: initialData.type,
         discountPercentage: initialData.discountPercentage?.toString() || '',
         discountAmount: initialData.discountAmount?.toString() || '',
         buyQuantity: initialData.buyQuantity?.toString() || '',
         getQuantity: initialData.getQuantity?.toString() || '',
         customText: initialData.customText || '',
         products: initialData.products.map(p => p._id),
         categories: initialData.categories?.map(c => c._id) || [],
         startDate: initialData.startDate.split('T')[0],
         startTime: initialData.startTime,
         endDate: initialData.endDate.split('T')[0],
         endTime: initialData.endTime,
         isActive: initialData.isActive,
         ribbonText: initialData.ribbonText,
         ribbonPosition: initialData.ribbonPosition,
         showOriginalPrice: initialData.showOriginalPrice,
         showDiscountAmount: initialData.showDiscountAmount,
         maxUses: initialData.maxUses?.toString() || '',
         scope: initialData.scope || 'store',
         targetBranches: initialData.targetBranches || []
       });
    } else {
             // Resetear formulario
       setFormData({
         name: '',
         description: '',
         type: 'percentage',
         discountPercentage: '',
         discountAmount: '',
         buyQuantity: '',
         getQuantity: '',
         customText: '',
         products: [],
         categories: [],
         startDate: '',
         startTime: '00:00',
         endDate: '',
         endTime: '23:59',
         isActive: true,
         ribbonText: 'PROMO',
         ribbonPosition: 'top-left',
         showOriginalPrice: true,
         showDiscountAmount: true,
         maxUses: '',
         scope: 'store',
         targetBranches: []
       });
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (formData.products.length === 0) {
      newErrors.products = 'Debe seleccionar al menos un producto';
    }

    // Validaciones específicas por tipo
    switch (formData.type) {
      case 'percentage':
        if (!formData.discountPercentage || parseFloat(formData.discountPercentage) <= 0 || parseFloat(formData.discountPercentage) > 100) {
          newErrors.discountPercentage = 'El porcentaje debe estar entre 1 y 100';
        }
        break;
      case 'fixed':
        if (!formData.discountAmount || parseFloat(formData.discountAmount) <= 0) {
          newErrors.discountAmount = 'El monto debe ser mayor a 0';
        }
        break;
      case 'buy_x_get_y':
        if (!formData.buyQuantity || parseInt(formData.buyQuantity) <= 0) {
          newErrors.buyQuantity = 'La cantidad a comprar debe ser mayor a 0';
        }
        if (!formData.getQuantity || parseInt(formData.getQuantity) <= 0) {
          newErrors.getQuantity = 'La cantidad a obtener debe ser mayor a 0';
        }
        break;
      case 'custom':
        if (!formData.customText.trim()) {
          newErrors.customText = 'El texto personalizado es requerido';
        }
        break;
    }

    if (formData.maxUses && parseInt(formData.maxUses) <= 0) {
      newErrors.maxUses = 'El máximo de usos debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        buyQuantity: formData.buyQuantity ? parseInt(formData.buyQuantity) : undefined,
        getQuantity: formData.getQuantity ? parseInt(formData.getQuantity) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error enviando formulario:', error);
    }
  };

  // Manejar selección de productos
  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  // Manejar selección de categorías
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  // Manejar selección de sucursales
  const handleBranchToggle = (branchId: string) => {
    setFormData(prev => ({
      ...prev,
      targetBranches: prev.targetBranches.includes(branchId)
        ? prev.targetBranches.filter(id => id !== branchId)
        : [...prev.targetBranches, branchId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Promoción' : 'Crear Nueva Promoción'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Información Básica
              </h3>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Promoción *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Descuento de Verano"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe la promoción..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Tipo de promoción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Promoción *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Porcentaje de descuento</option>
                  <option value="fixed">Monto fijo de descuento</option>
                  <option value="buy_x_get_y">Compra X, obtén Y</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {/* Campos específicos por tipo */}
              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de Descuento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.01"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 15"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.discountPercentage && (
                    <p className="text-red-500 text-sm mt-1">{errors.discountPercentage}</p>
                  )}
                </div>
              )}

              {formData.type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto de Descuento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => handleInputChange('discountAmount', e.target.value)}
                      className={`w-full px-3 py-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.discountAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 10.50"
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.discountAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.discountAmount}</p>
                  )}
                </div>
              )}

              {formData.type === 'buy_x_get_y' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compra *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.buyQuantity}
                      onChange={(e) => handleInputChange('buyQuantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.buyQuantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 2"
                    />
                    {errors.buyQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.buyQuantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obtén *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.getQuantity}
                      onChange={(e) => handleInputChange('getQuantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.getQuantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: 3"
                    />
                    {errors.getQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.getQuantity}</p>
                    )}
                  </div>
                </div>
              )}

              {formData.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto Personalizado *
                  </label>
                  <input
                    type="text"
                    value={formData.customText}
                    onChange={(e) => handleInputChange('customText', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.customText ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: ¡Oferta especial!"
                  />
                  {errors.customText && (
                    <p className="text-red-500 text-sm mt-1">{errors.customText}</p>
                  )}
                </div>
              )}
            </div>

            {/* Configuración avanzada */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración Avanzada
              </h3>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Configuración de alcance (solo para tienda principal) */}
              {activeStore?.isMainStore && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alcance de la Promoción
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="store">Solo esta tienda</option>
                    <option value="all_branches">Todas las sucursales</option>
                    <option value="specific_branches">Sucursales específicas</option>
                  </select>
                  
                  {/* Selección de sucursales específicas */}
                  {formData.scope === 'specific_branches' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Sucursales
                      </label>
                      {loadingBranches ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">Cargando sucursales...</span>
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                          {!Array.isArray(branches) || branches.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay sucursales disponibles</p>
                          ) : (
                            <div className="space-y-2">
                              {branches.map((branch) => (
                                <label key={branch._id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.targetBranches.includes(branch._id)}
                                    onChange={() => handleBranchToggle(branch._id)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {branch.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Máximo de usos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Usos (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => handleInputChange('maxUses', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.maxUses ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Sin límite"
                />
                {errors.maxUses && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>
                )}
              </div>

              {/* Configuración de visualización */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Visualización</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto del Ribbon
                  </label>
                  <input
                    type="text"
                    value={formData.ribbonText}
                    onChange={(e) => handleInputChange('ribbonText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PROMO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posición del Ribbon
                  </label>
                  <select
                    value={formData.ribbonPosition}
                    onChange={(e) => handleInputChange('ribbonPosition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="top-left">Superior Izquierda</option>
                    <option value="top-right">Superior Derecha</option>
                    <option value="bottom-left">Inferior Izquierda</option>
                    <option value="bottom-right">Inferior Derecha</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showOriginalPrice}
                      onChange={(e) => handleInputChange('showOriginalPrice', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Mostrar precio original</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.showDiscountAmount}
                      onChange={(e) => handleInputChange('showDiscountAmount', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Mostrar monto de descuento</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Promoción activa</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de productos y categorías */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Productos y Categorías
            </h3>

            {/* Productos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos Incluidos *
              </label>
              {loadingProducts ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando productos...</span>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {!Array.isArray(products) || products.length === 0 ? (
                    <div className="text-center py-4">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No hay productos disponibles</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Asegúrate de tener productos en tu tienda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <label key={product._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.products.includes(product._id)}
                            onChange={() => handleProductToggle(product._id)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {product.name} - ${product.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors.products && (
                <p className="text-red-500 text-sm mt-1">{errors.products}</p>
              )}
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorías Incluidas (opcional)
              </label>
              {loadingCategories ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando categorías...</span>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {!Array.isArray(categories) || categories.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category._id)}
                            onChange={() => handleCategoryToggle(category._id)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-racing-500 text-white rounded-lg hover:bg-racing-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'} Promoción
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm; 