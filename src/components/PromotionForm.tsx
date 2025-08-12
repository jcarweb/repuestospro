import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Tag, DollarSign, Percent, Package, Type } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: {
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface PromotionFormData {
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'custom';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  customText?: string;
  products: string[];
  categories: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
  ribbonText: string;
  ribbonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOriginalPrice: boolean;
  showDiscountAmount: boolean;
  maxUses?: number;
}

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PromotionFormData) => void;
  promotion?: any;
  isEditing?: boolean;
  token: string;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  isEditing = false,
  token
}) => {
  const [formData, setFormData] = useState<PromotionFormData>({
    name: '',
    description: '',
    type: 'percentage',
    discountPercentage: 0,
    discountAmount: 0,
    buyQuantity: 1,
    getQuantity: 1,
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
    maxUses: undefined
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCategories();
      if (promotion && isEditing) {
        setFormData({
          name: promotion.name,
          description: promotion.description,
          type: promotion.type,
          discountPercentage: promotion.discountPercentage || 0,
          discountAmount: promotion.discountAmount || 0,
          buyQuantity: promotion.buyQuantity || 1,
          getQuantity: promotion.getQuantity || 1,
          customText: promotion.customText || '',
          products: promotion.products.map((p: any) => p._id),
          categories: promotion.categories?.map((c: any) => c._id) || [],
          startDate: promotion.startDate.split('T')[0],
          startTime: promotion.startTime || '00:00',
          endDate: promotion.endDate.split('T')[0],
          endTime: promotion.endTime || '23:59',
          isActive: promotion.isActive,
          ribbonText: promotion.ribbonText || 'PROMO',
          ribbonPosition: promotion.ribbonPosition || 'top-left',
          showOriginalPrice: promotion.showOriginalPrice,
          showDiscountAmount: promotion.showDiscountAmount,
          maxUses: promotion.maxUses
        });
        setSelectedProducts(promotion.products || []);
      }
    }
  }, [isOpen, promotion, isEditing]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/promotions/products/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/promotions/categories/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof PromotionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (product: Product) => {
    if (!formData.products.includes(product._id)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, product._id]
      }));
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleProductRemove = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(id => id !== productId)
    }));
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handleCategorySelect = (categoryId: string) => {
    if (!formData.categories.includes(categoryId)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }));
    }
  };

  const handleCategoryRemove = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(id => id !== categoryId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.name || !formData.description) {
        alert('Nombre y descripción son requeridos');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        alert('Fechas de inicio y fin son requeridas');
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      if (formData.products.length === 0) {
        alert('Debe seleccionar al menos un producto');
        return;
      }

      // Validaciones específicas por tipo
      if (formData.type === 'percentage' && (!formData.discountPercentage || formData.discountPercentage <= 0 || formData.discountPercentage > 100)) {
        alert('El porcentaje de descuento debe estar entre 1 y 100');
        return;
      }

      if (formData.type === 'fixed' && (!formData.discountAmount || formData.discountAmount <= 0)) {
        alert('El monto de descuento debe ser mayor a 0');
        return;
      }

      if (formData.type === 'buy_x_get_y' && (!formData.buyQuantity || !formData.getQuantity || formData.buyQuantity < 1 || formData.getQuantity < 1)) {
        alert('Las cantidades de compra y obtención deben ser mayores a 0');
        return;
      }

      if (formData.type === 'custom' && !formData.customText) {
        alert('El texto personalizado es requerido');
        return;
      }

      onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Package className="h-4 w-4" />;
      case 'custom':
        return <Type className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Porcentaje';
      case 'fixed':
        return 'Monto Fijo';
      case 'buy_x_get_y':
        return 'Compra X Obtén Y';
      case 'custom':
        return 'Personalizado';
      default:
        return type;
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Editar Promoción' : 'Crear Nueva Promoción'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Promoción *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Descuento de Verano"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Promoción *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto Fijo</option>
                <option value="buy_x_get_y">Compra X Obtén Y</option>
                <option value="custom">Personalizado</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe la promoción..."
              required
            />
          </div>

          {/* Configuración específica por tipo */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración de {getTypeLabel(formData.type)}
            </h3>

            {formData.type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => handleInputChange('discountAmount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'buy_x_get_y' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a Comprar *
                  </label>
                  <input
                    type="number"
                    value={formData.buyQuantity}
                    onChange={(e) => handleInputChange('buyQuantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad a Obtener *
                  </label>
                  <input
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) => handleInputChange('getQuantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
            )}

            {formData.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto Personalizado *
                </label>
                <input
                  type="text"
                  value={formData.customText}
                  onChange={(e) => handleInputChange('customText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: ¡Oferta Especial!"
                  required
                />
              </div>
            )}
          </div>

          {/* Fechas */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas y Horas de Vigencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Consejo:</strong> Si no especificas una hora, la promoción se activará a las 00:00 del día de inicio y terminará a las 23:59 del día de fin.
              </p>
            </div>
          </div>

          {/* Productos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>
            
            {/* Productos seleccionados */}
            {selectedProducts.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productos Seleccionados ({selectedProducts.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleProductRemove(product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buscar productos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Productos
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por nombre o categoría..."
              />
            </div>

            {/* Lista de productos */}
            <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={`flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    formData.products.includes(product._id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex items-center space-x-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category.name} • ${product.price}</p>
                    </div>
                  </div>
                  {formData.products.includes(product._id) && (
                    <Plus className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuración visual */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Visual</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del Cintillo
                </label>
                <input
                  type="text"
                  value={formData.ribbonText}
                  onChange={(e) => handleInputChange('ribbonText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PROMO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posición del Cintillo
                </label>
                <select
                  value={formData.ribbonPosition}
                  onChange={(e) => handleInputChange('ribbonPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top-left">Superior Izquierda</option>
                  <option value="top-right">Superior Derecha</option>
                  <option value="bottom-left">Inferior Izquierda</option>
                  <option value="bottom-right">Inferior Derecha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showOriginalPrice"
                  checked={formData.showOriginalPrice}
                  onChange={(e) => handleInputChange('showOriginalPrice', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showOriginalPrice" className="ml-2 block text-sm text-gray-900">
                  Mostrar precio original tachado
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showDiscountAmount"
                  checked={formData.showDiscountAmount}
                  onChange={(e) => handleInputChange('showDiscountAmount', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showDiscountAmount" className="ml-2 block text-sm text-gray-900">
                  Mostrar monto de descuento
                </label>
              </div>
            </div>
          </div>

          {/* Configuración adicional */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Usos (Opcional)
                </label>
                <input
                  type="number"
                  value={formData.maxUses || ''}
                  onChange={(e) => handleInputChange('maxUses', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  placeholder="Sin límite"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Promoción activa
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm; 