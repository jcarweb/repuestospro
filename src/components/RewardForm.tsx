import React, { useState, useRef } from 'react';
import { Upload, X, Save, Edit } from 'lucide-react';

interface RewardFormProps {
  reward?: {
    _id?: string;
    name: string;
    description: string;
    image?: string;
    pointsRequired: number;
    cashRequired: number;
    category: string;
    stock: number;
    isActive: boolean;
  };
  onSubmit: (rewardData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RewardForm: React.FC<RewardFormProps> = ({ 
  reward, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: reward?.name || '',
    description: reward?.description || '',
    image: reward?.image || '',
    pointsRequired: reward?.pointsRequired || 0,
    cashRequired: reward?.cashRequired || 0,
    category: reward?.category || 'accessories',
    stock: reward?.stock || 0,
    isActive: reward?.isActive ?? true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(reward?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'tools', label: 'Herramientas' },
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'accessories', label: 'Accesorios' },
    { value: 'gift_cards', label: 'Tarjetas de Regalo' },
    { value: 'discounts', label: 'Descuentos' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rewardData = {
      ...formData,
      imageFile
    };
    
    onSubmit(rewardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del premio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Premio *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Gorra con logo, Descuento 20%"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el premio y sus beneficios"
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen del Premio
          </label>
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Imagen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Puntos requeridos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puntos Requeridos *
          </label>
          <input
            type="number"
            name="pointsRequired"
            value={formData.pointsRequired}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Monto en efectivo (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto en Efectivo (Opcional)
          </label>
          <input
            type="number"
            name="cashRequired"
            value={formData.cashRequired}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="text-sm text-gray-500 mt-1">
            Para premios mixtos (ej: gorra + $5)
          </p>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Disponible *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Premio activo y disponible para canje
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {reward ? <Edit className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{reward ? 'Actualizar' : 'Crear'} Premio</span>
              </>
            )}
          </button>
        </div>
      </form>
  );
};

export default RewardForm;
