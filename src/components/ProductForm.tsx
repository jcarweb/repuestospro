import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { Upload, X } from 'lucide-react';

interface ProductFormProps {
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    brand: initialData?.brand || '',
    subcategory: initialData?.subcategory || '',
    sku: initialData?.sku || '',
    originalPartCode: initialData?.originalPartCode || '',
    stock: initialData?.stock || 0,
    isFeatured: initialData?.isFeatured || false,
    tags: initialData?.tags?.join(', ') || '',
    specifications: initialData?.specifications ? JSON.stringify(initialData.specifications, null, 2) : '',
    storeId: initialData?.store?._id || initialData?.storeId || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Array<{ _id: string; name: string; type: string }>>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  // Hook para manejo de imágenes
  const {
    images,
    isLoading: imagesLoading,
    error: imagesError,
    addImages,
    removeImage,
    clearImages
  } = useImageUpload({
    maxImages: 5,
    maxSize: 10,
    onError: (error) => console.error('Error con imágenes:', error),
    onSuccess: (images) => console.log('Imágenes cargadas:', images.length),
    initialImages: initialData?.images || []
  });

  // Establecer storeId si no está definido y el usuario tiene tiendas
  useEffect(() => {
    console.log('🔍 useEffect ejecutado, storeId actual:', formData.storeId);
    
    // Cargar tiendas del usuario
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        console.log('🔍 Haciendo fetch a /api/user/stores...');
        const response = await fetch('/api/user/stores', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log('🔍 Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Datos de tiendas recibidos:', data);
          setStores(data.data || []);
          
          // Si no hay storeId definido y hay tiendas disponibles, seleccionar la primera
          if (!formData.storeId && data.data && data.data.length > 0) {
            const defaultStoreId = data.data[0]._id;
            console.log('🔍 Estableciendo storeId:', defaultStoreId);
            setFormData(prev => ({
              ...prev,
              storeId: defaultStoreId
            }));
            console.log('✅ StoreId establecido automáticamente:', defaultStoreId);
          } else if (data.data && data.data.length === 0) {
            console.log('❌ No se encontraron tiendas para el usuario');
            setError('No tienes tiendas asignadas. Contacta al administrador.');
          }
        } else {
          console.log('❌ Error en la respuesta:', response.status, response.statusText);
          setError('Error al cargar las tiendas. Intenta de nuevo.');
        }
      } catch (error) {
        console.error('❌ Error obteniendo tiendas del usuario:', error);
        setError('Error al cargar las tiendas. Intenta de nuevo.');
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, []); // Solo ejecutar una vez al montar el componente

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error de validación
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpiar error general
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t('productForm.errors.nameRequired');
    }

    if (!formData.description.trim()) {
      errors.description = t('productForm.errors.descriptionRequired');
    }

    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = t('productForm.errors.priceRequired');
    }

    if (!formData.category.trim()) {
      errors.category = t('productForm.errors.categoryRequired');
    }

    if (!formData.sku.trim()) {
      errors.sku = t('productForm.errors.skuRequired');
    }

    if (!formData.storeId) {
      errors.storeId = 'Debe seleccionar una tienda';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleSubmit ejecutado');
    console.log('🔍 Formulario enviado', formData); // Debug

    if (!validateForm()) {
      console.log('❌ Errores de validación:', validationErrors); // Debug
      return;
    }

    console.log('✅ Validación pasada, procesando datos...');

    try {
      const productData: any = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : [],
        images: images, // Imágenes en base64
      };

      // Manejar especificaciones de forma segura
      if (formData.specifications && formData.specifications.trim()) {
        try {
          // Intentar parsear como JSON
          productData.specifications = JSON.parse(formData.specifications);
        } catch (jsonError) {
          // Si no es JSON válido, guardarlo como texto simple
          console.log('Especificaciones no son JSON válido, guardando como texto:', formData.specifications);
          productData.specifications = formData.specifications;
        }
      } else {
        productData.specifications = {};
      }

      // Solo incluir storeId si está definido
      if (formData.storeId) {
        productData.storeId = formData.storeId;
        console.log('✅ StoreId incluido:', formData.storeId);
      } else {
        // Si no hay storeId, mostrar error
        console.log('❌ No hay storeId definido');
        setError('Debe seleccionar una tienda para crear el producto');
        return;
      }

      console.log('🚀 Datos del producto a enviar:', productData); // Debug
      console.log('🚀 Llamando a onSubmit...');
      await onSubmit(productData);
      console.log('✅ onSubmit completado exitosamente');
    } catch (error) {
      console.error('❌ Error submitting product:', error);
      setError('Error al crear el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // Manejar drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      addImages(files);
    }
  };

  const categories = [
    'Motor',
    'Frenos',
    'Suspensión',
    'Transmisión',
    'Eléctrico',
    'Carrocería',
    'Accesorios'
  ];

  const brands = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'Mazda',
    'Hyundai',
    'Kia',
    'Volkswagen',
    'BMW',
    'Mercedes-Benz',
    'Audi'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-carbon-900">
          {isEditing ? t('productForm.editTitle') : t('productForm.createTitle')}
        </h2>
        <p className="text-carbon-600 mt-2">
          {isEditing ? t('productForm.editSubtitle') : t('productForm.createSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mostrar error general */}
        {error && (
          <div className="bg-alert-50 border border-alert-200 rounded-lg p-4">
            <p className="text-sm text-alert-600">{error}</p>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.name')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
                validationErrors.name ? 'border-alert-500' : 'border-carbon-300'
              }`}
              placeholder={t('productForm.namePlaceholder')}
            />
            {validationErrors.name && (
              <p className="text-alert-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.sku')} *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
                validationErrors.sku ? 'border-alert-500' : 'border-carbon-300'
              }`}
              placeholder={t('productForm.skuPlaceholder')}
            />
            {validationErrors.sku && (
              <p className="text-alert-500 text-sm mt-1">{validationErrors.sku}</p>
            )}
          </div>
        </div>

        {/* Selector de tienda */}
        <div>
          <label className="block text-sm font-medium text-carbon-700 mb-2">
            Tienda *
          </label>
          {loadingStores ? (
            <div className="w-full px-3 py-2 border border-carbon-300 rounded-lg bg-carbon-50">
              <span className="text-carbon-500">Cargando tiendas...</span>
            </div>
          ) : stores.length > 0 ? (
            <select
              name="storeId"
              value={formData.storeId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
                validationErrors.storeId ? 'border-alert-500' : 'border-carbon-300'
              }`}
            >
              <option value="">Selecciona una tienda</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name} {store.type && `(${store.type})`}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-alert-300 rounded-lg bg-alert-50">
              <span className="text-alert-600">No tienes tiendas asignadas</span>
            </div>
          )}
          {validationErrors.storeId && (
            <p className="text-alert-500 text-sm mt-1">{validationErrors.storeId}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-carbon-700 mb-2">
            {t('productForm.description')} *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
              validationErrors.description ? 'border-alert-500' : 'border-carbon-300'
            }`}
            placeholder={t('productForm.descriptionPlaceholder')}
          />
          {validationErrors.description && (
            <p className="text-alert-500 text-sm mt-1">{validationErrors.description}</p>
          )}
        </div>

        {/* Precio y stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.price')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-carbon-500">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
                  validationErrors.price ? 'border-alert-500' : 'border-carbon-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {validationErrors.price && (
              <p className="text-alert-500 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.stock')}
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.originalPartCode')}
            </label>
            <input
              type="text"
              name="originalPartCode"
              value={formData.originalPartCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
              placeholder={t('productForm.originalPartCodePlaceholder')}
            />
          </div>
        </div>

        {/* Categoría y marca */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.category')} *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 ${
                validationErrors.category ? 'border-alert-500' : 'border-carbon-300'
              }`}
            >
              <option value="">{t('productForm.selectCategory')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-alert-500 text-sm mt-1">{validationErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.brand')}
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
            >
              <option value="">{t('productForm.selectBrand')}</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-carbon-700 mb-2">
              {t('productForm.subcategory')}
            </label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
              placeholder={t('productForm.subcategoryPlaceholder')}
            />
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-carbon-700 mb-2">
            {t('productForm.tags')}
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500"
            placeholder={t('productForm.tagsPlaceholder')}
          />
          <p className="text-xs text-carbon-500 mt-1">{t('productForm.tagsHelp')}</p>
        </div>

        {/* Especificaciones */}
        <div>
          <label className="block text-sm font-medium text-carbon-700 mb-2">
            {t('productForm.specifications')}
          </label>
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-carbon-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-racing-500 font-mono text-sm"
            placeholder="Ejemplo: Material: acero, Color: plateado, Tamaño: estándar"
          />
          <p className="text-xs text-carbon-500 mt-1">
            Puedes escribir texto libre o usar formato JSON: {'{"material": "acero", "color": "plateado"}'}
          </p>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-carbon-700 mb-2">
            {t('productForm.images')}
          </label>
          
          {/* Área de drag and drop */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${dragActive 
                ? 'border-racing-500 bg-racing-50' 
                : 'border-carbon-300 hover:border-carbon-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => {
                if (e.target.files) {
                  addImages(e.target.files);
                }
                // Limpiar input
                e.target.value = '';
              }}
              className="hidden"
            />
            
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-carbon-400" />
              <div className="text-sm text-carbon-600">
                <p className="font-medium">
                  Arrastra y suelta imágenes aquí, o{' '}
                  <span className="text-racing-600 hover:text-racing-500">
                    haz clic para seleccionar
                  </span>
                </p>
                <p className="text-xs text-carbon-500 mt-1">
                  Máximo 5 imágenes, 10MB cada una
                </p>
                <p className="text-xs text-carbon-500">
                  Formatos: jpeg, jpg, png, gif, webp
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {imagesError && (
            <div className="bg-alert-50 border border-alert-200 rounded-md p-3 mt-2">
              <p className="text-sm text-alert-600">{imagesError}</p>
            </div>
          )}

          {/* Preview de imágenes */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-carbon-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-alert-500 text-white rounded-full p-1 hover:bg-alert-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Contador de imágenes */}
          {images.length > 0 && (
            <div className="text-sm text-carbon-500 text-center mt-2">
              {images.length} de 5 imágenes
            </div>
          )}
          
          <p className="text-xs text-carbon-500 mt-1">
            Máximo 5 imágenes, 10MB cada una. Formatos: JPG, PNG, GIF, WebP
          </p>
        </div>

        {/* Producto destacado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="h-4 w-4 text-racing-600 focus:ring-racing-500 border-carbon-300 rounded"
          />
          <label className="ml-2 block text-sm text-carbon-900">
            {t('productForm.isFeatured')}
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-carbon-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-carbon-300 rounded-lg text-carbon-700 hover:bg-carbon-50 focus:outline-none focus:ring-2 focus:ring-racing-500"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            onClick={() => console.log('🔍 Botón submit clickeado')}
            className="px-6 py-2 bg-racing-500 text-white rounded-lg hover:bg-racing-600 focus:outline-none focus:ring-2 focus:ring-racing-500 disabled:opacity-50"
            disabled={isLoading || imagesLoading}
          >
            {isLoading ? t('common.saving') : (isEditing ? t('common.update') : t('common.create'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
