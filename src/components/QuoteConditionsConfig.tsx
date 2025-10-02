import React, { useState, useEffect } from 'react';
import {
  Save,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Settings,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface QuoteCondition {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  category: 'validity' | 'payment' | 'delivery' | 'warranty' | 'general';
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface QuoteConditionsConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conditions: QuoteCondition[]) => void;
}

const QuoteConditionsConfig: React.FC<QuoteConditionsConfigProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  
  const [conditions, setConditions] = useState<QuoteCondition[]>([]);
  const [editingCondition, setEditingCondition] = useState<QuoteCondition | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario para nueva/editar condición
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as QuoteCondition['category'],
    isActive: true
  });

  // Cargar condiciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadConditions();
    }
  }, [isOpen]);

  // Cargar condiciones desde el backend
  const loadConditions = async () => {
    try {
      // Simular carga de condiciones
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockConditions: QuoteCondition[] = [
        {
          _id: 'cond1',
          title: 'Validez de la Cotización',
          content: 'Esta cotización tiene una validez de {days} días a partir de la fecha de emisión.',
          isActive: true,
          category: 'validity',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'cond2',
          title: 'Precios Sujetos a Cambios',
          content: 'Los precios están sujetos a cambios sin previo aviso debido a fluctuaciones del mercado.',
          isActive: true,
          category: 'general',
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'cond3',
          title: 'Condiciones de Pago',
          content: 'El pago debe realizarse según las condiciones acordadas. Se aceptan transferencias bancarias y efectivo.',
          isActive: true,
          category: 'payment',
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'cond4',
          title: 'Tiempos de Entrega',
          content: 'Los tiempos de entrega son estimados y pueden variar según disponibilidad de stock.',
          isActive: true,
          category: 'delivery',
          order: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'cond5',
          title: 'Garantía de Productos',
          content: 'Todos los productos cuentan con garantía del fabricante según las condiciones establecidas.',
          isActive: true,
          category: 'warranty',
          order: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setConditions(mockConditions);
    } catch (error) {
      console.error('Error loading conditions:', error);
    }
  };

  // Guardar condiciones
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(conditions);
      onClose();
    } catch (error) {
      console.error('Error saving conditions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar nueva condición
  const handleAddCondition = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert(t('quotes.conditions.validation.required') || 'Debe completar todos los campos');
      return;
    }

    const newCondition: QuoteCondition = {
      _id: `cond${Date.now()}`,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      isActive: formData.isActive,
      order: conditions.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConditions(prev => [...prev, newCondition]);
    setFormData({ title: '', content: '', category: 'general', isActive: true });
    setShowAddForm(false);
  };

  // Editar condición
  const handleEditCondition = (condition: QuoteCondition) => {
    setEditingCondition(condition);
    setFormData({
      title: condition.title,
      content: condition.content,
      category: condition.category,
      isActive: condition.isActive
    });
    setShowAddForm(true);
  };

  // Actualizar condición
  const handleUpdateCondition = () => {
    if (!editingCondition || !formData.title.trim() || !formData.content.trim()) {
      alert(t('quotes.conditions.validation.required') || 'Debe completar todos los campos');
      return;
    }

    setConditions(prev => prev.map(cond => 
      cond._id === editingCondition._id 
        ? { ...cond, ...formData, updatedAt: new Date().toISOString() }
        : cond
    ));

    setEditingCondition(null);
    setFormData({ title: '', content: '', category: 'general', isActive: true });
    setShowAddForm(false);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingCondition(null);
    setFormData({ title: '', content: '', category: 'general', isActive: true });
    setShowAddForm(false);
  };

  // Eliminar condición
  const handleDeleteCondition = (conditionId: string) => {
    if (confirm(t('quotes.conditions.confirmDelete') || '¿Estás seguro de que quieres eliminar esta condición?')) {
      setConditions(prev => prev.filter(cond => cond._id !== conditionId));
    }
  };

  // Toggle activar/desactivar condición
  const toggleCondition = (conditionId: string) => {
    setConditions(prev => prev.map(cond => 
      cond._id === conditionId 
        ? { ...cond, isActive: !cond.isActive, updatedAt: new Date().toISOString() }
        : cond
    ));
  };

  // Reordenar condiciones
  const moveCondition = (fromIndex: number, toIndex: number) => {
    const newConditions = [...conditions];
    const [movedCondition] = newConditions.splice(fromIndex, 1);
    newConditions.splice(toIndex, 0, movedCondition);
    
    // Actualizar orden
    const updatedConditions = newConditions.map((cond, index) => ({
      ...cond,
      order: index + 1
    }));
    
    setConditions(updatedConditions);
  };

  // Obtener icono por categoría
  const getCategoryIcon = (category: QuoteCondition['category']) => {
    switch (category) {
      case 'validity': return <Calendar className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'delivery': return <Clock className="w-4 h-4" />;
      case 'warranty': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Obtener color por categoría
  const getCategoryColor = (category: QuoteCondition['category']) => {
    switch (category) {
      case 'validity': return 'text-blue-600 dark:text-blue-400';
      case 'payment': return 'text-green-600 dark:text-green-400';
      case 'delivery': return 'text-orange-600 dark:text-orange-400';
      case 'warranty': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#444444] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('quotes.conditions.title') || 'Configuración de Condiciones'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('quotes.conditions.subtitle') || 'Gestiona las condiciones y cláusulas de las cotizaciones'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#FFC300] transition-colors"
                title={t('quotes.conditions.tutorial') || 'Tutorial'}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Botón para agregar nueva condición */}
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingCondition(null);
                setFormData({ title: '', content: '', category: 'general', isActive: true });
                setShowAddForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('quotes.conditions.addNew') || 'Agregar Nueva Condición'}</span>
            </button>
          </div>

          {/* Formulario para agregar/editar condición */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingCondition ? t('quotes.conditions.editCondition') || 'Editar Condición' : t('quotes.conditions.addCondition') || 'Agregar Condición'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('quotes.conditions.title') || 'Título'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder={t('quotes.conditions.titlePlaceholder') || 'Ej: Validez de la Cotización'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('quotes.conditions.content') || 'Contenido'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    rows={3}
                    placeholder={t('quotes.conditions.contentPlaceholder') || 'Ej: Esta cotización tiene una validez de {days} días...'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('quotes.conditions.category') || 'Categoría'}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as QuoteCondition['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    >
                      <option value="general">{t('quotes.conditions.categories.general') || 'General'}</option>
                      <option value="validity">{t('quotes.conditions.categories.validity') || 'Validez'}</option>
                      <option value="payment">{t('quotes.conditions.categories.payment') || 'Pago'}</option>
                      <option value="delivery">{t('quotes.conditions.categories.delivery') || 'Entrega'}</option>
                      <option value="warranty">{t('quotes.conditions.categories.warranty') || 'Garantía'}</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-[#FFC300] border-gray-300 rounded focus:ring-[#FFC300]"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('quotes.conditions.active') || 'Activa'}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('quotes.conditions.cancel') || 'Cancelar'}
                  </button>
                  <button
                    onClick={editingCondition ? handleUpdateCondition : handleAddCondition}
                    className="px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] transition-colors"
                  >
                    {editingCondition ? t('quotes.conditions.update') || 'Actualizar' : t('quotes.conditions.add') || 'Agregar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de condiciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('quotes.conditions.existingConditions') || 'Condiciones Existentes'} ({conditions.length})
            </h3>
            
            {conditions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('quotes.conditions.noConditions') || 'No hay condiciones configuradas'}</p>
              </div>
            ) : (
              conditions.map((condition, index) => (
                <div key={condition._id} className="p-4 bg-gray-50 dark:bg-[#555555] rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`${getCategoryColor(condition.category)}`}>
                          {getCategoryIcon(condition.category)}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {condition.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          condition.isActive 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {condition.isActive ? t('quotes.conditions.active') || 'Activa' : t('quotes.conditions.inactive') || 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {condition.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('quotes.conditions.categories.' + condition.category) || condition.category}</span>
                        <span>•</span>
                        <span>{t('quotes.conditions.order') || 'Orden'}: {condition.order}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCondition(condition)}
                        className="p-2 text-gray-500 hover:text-[#FFC300] transition-colors"
                        title={t('quotes.conditions.edit') || 'Editar'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleCondition(condition._id)}
                        className={`p-2 transition-colors ${
                          condition.isActive 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={condition.isActive ? t('quotes.conditions.deactivate') || 'Desactivar' : t('quotes.conditions.activate') || 'Activar'}
                      >
                        {condition.isActive ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCondition(condition._id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title={t('quotes.conditions.delete') || 'Eliminar'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-[#444444]">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              {t('quotes.conditions.cancel') || 'Cancelar'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#FFC300] text-[#333333] rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333333]"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{t('quotes.conditions.save') || 'Guardar Configuración'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteConditionsConfig;
