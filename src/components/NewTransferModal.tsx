import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActiveStore } from '../contexts/ActiveStoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  X, 
  Package, 
  Building2, 
  Truck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated: () => void;
}

const NewTransferModal: React.FC<NewTransferModalProps> = ({ 
  isOpen, 
  onClose, 
  onTransferCreated 
}) => {
  const { user } = useAuth();
  const { activeStore, userStores } = useActiveStore();
  const { theme } = useTheme();

  // Estados del formulario
  const [formData, setFormData] = useState({
    fromStore: '',
    toStore: '',
    product: '',
    quantity: '',
    notes: ''
  });

  // Estados de validación y UI
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Productos de ejemplo (en una implementación real vendrían de una API)
  const availableProducts = [
    { id: '1', name: 'Filtro de aceite', stock: 50 },
    { id: '2', name: 'Bujías', stock: 25 },
    { id: '3', name: 'Aceite de motor', stock: 30 },
    { id: '4', name: 'Frenos de disco', stock: 15 },
    { id: '5', name: 'Pastillas de freno', stock: 40 }
  ];

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && activeStore) {
      setFormData({
        fromStore: activeStore._id || '',
        toStore: '',
        product: '',
        quantity: '',
        notes: ''
      });
      setErrors({});
      setSubmitSuccess(false);
    }
  }, [isOpen, activeStore]);

  // Validar formulario
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fromStore) {
      newErrors.fromStore = 'Debe seleccionar una tienda de origen';
    }

    if (!formData.toStore) {
      newErrors.toStore = 'Debe seleccionar una tienda de destino';
    } else if (formData.fromStore === formData.toStore) {
      newErrors.toStore = 'La tienda de destino debe ser diferente a la de origen';
    }

    if (!formData.product) {
      newErrors.product = 'Debe seleccionar un producto';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Debe especificar la cantidad';
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'La cantidad debe ser un número mayor a 0';
      } else {
        // Verificar stock disponible
        const selectedProduct = availableProducts.find(p => p.id === formData.product);
        if (selectedProduct && quantity > selectedProduct.stock) {
          newErrors.quantity = `Stock insuficiente. Disponible: ${selectedProduct.stock}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Obtener stock disponible del producto seleccionado
  const getSelectedProductStock = () => {
    const selectedProduct = availableProducts.find(p => p.id === formData.product);
    return selectedProduct ? selectedProduct.stock : 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aquí iría la llamada real a la API
      console.log('Creando transferencia:', formData);

      // Simular respuesta exitosa
      setSubmitSuccess(true);
      
             // Cerrar modal después de 2 segundos
       setTimeout(() => {
         onTransferCreated(formData);
         onClose();
       }, 2000);

    } catch (error) {
      console.error('Error al crear transferencia:', error);
      setErrors({ submit: 'Error al crear la transferencia. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener tiendas disponibles (excluyendo la tienda de origen)
  const getAvailableDestinationStores = () => {
    return userStores.filter(store => store._id !== formData.fromStore);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#333333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#555555]">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-[#FFC300]" />
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
               Nueva Transferencia
             </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                             <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 ¡Transferencia Creada!
               </h4>
               <p className="text-gray-600 dark:text-gray-300">
                 La transferencia se ha creado exitosamente y está en proceso.
               </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tienda de Origen */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Tienda de Origen *
                 </label>
                <select
                  value={formData.fromStore}
                  onChange={(e) => handleInputChange('fromStore', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                    errors.fromStore 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-[#555555]'
                  }`}
                >
                                     <option value="">Seleccionar tienda de origen</option>
                  {userStores.map(store => (
                    <option key={store._id} value={store._id}>
                      {store.name} - {store.city}
                    </option>
                  ))}
                </select>
                {errors.fromStore && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fromStore}
                  </p>
                )}
              </div>

              {/* Tienda de Destino */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Tienda de Destino *
                 </label>
                <select
                  value={formData.toStore}
                  onChange={(e) => handleInputChange('toStore', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                    errors.toStore 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-[#555555]'
                  }`}
                  disabled={!formData.fromStore}
                >
                                     <option value="">Seleccionar tienda de destino</option>
                  {getAvailableDestinationStores().map(store => (
                    <option key={store._id} value={store._id}>
                      {store.name} - {store.city}
                    </option>
                  ))}
                </select>
                {errors.toStore && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.toStore}
                  </p>
                )}
              </div>

              {/* Producto */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Producto *
                 </label>
                <select
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                    errors.product 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-[#555555]'
                  }`}
                >
                                     <option value="">Seleccionar producto</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
                {errors.product && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.product}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Cantidad *
                 </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    min="1"
                    max={getSelectedProductStock()}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent ${
                      errors.quantity 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-[#555555]'
                    }`}
                                         placeholder="Ingresar cantidad"
                  />
                  {formData.product && (
                                         <div className="absolute right-3 top-2 text-xs text-gray-500 dark:text-gray-400">
                       Stock máximo: {getSelectedProductStock()}
                     </div>
                  )}
                </div>
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Notas (Opcional)
                 </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#555555] rounded-lg bg-white dark:bg-[#333333] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent"
                                     placeholder="Agregar notas adicionales..."
                />
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                                   <button
                     type="button"
                     onClick={onClose}
                     disabled={isSubmitting}
                     className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 disabled:opacity-50"
                   >
                     Cancelar
                   </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333333]"></div>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      <span>Crear Transferencia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewTransferModal;
