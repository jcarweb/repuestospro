import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AdminCard, AdminButton, AdminInput } from './ui';
import AdministrativeDivisionSelector from './AdministrativeDivisionSelector';
import FreeStoreLocationMap from './FreeStoreLocationMap';
import { X, Save, Building2, MapPin, AlertCircle } from 'lucide-react';

interface BranchFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  isMainStore: boolean;
  // Campos de ubicación administrativa
  stateRef?: string;
  municipalityRef?: string;
  parishRef?: string;
  // Coordenadas GPS
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  // Redes sociales
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

interface BranchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => Promise<void>;
  initialData?: Partial<BranchFormData>;
  isEditing?: boolean;
  hasMainStore?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  hasMainStore = false
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    isMainStore: false,
    stateRef: '',
    municipalityRef: '',
    parishRef: '',
    coordinates: { latitude: 0, longitude: 0 },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ 
        ...prev, 
        ...initialData,
        // Asegurar que las coordenadas estén definidas
        coordinates: initialData.coordinates || { latitude: 0, longitude: 0 }
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validación
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    }
    if (!formData.stateRef) {
      newErrors.administrativeDivision = t('location.selectAdministrativeDivision');
    }
    if (!formData.coordinates || (formData.coordinates.latitude === 0 && formData.coordinates.longitude === 0)) {
      newErrors.coordinates = t('location.selectLocation');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando datos del formulario:', formData);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting branch form:', error);
      // Mostrar error al usuario
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Error al guardar la sucursal'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BranchFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationSelect = (coordinates: { latitude: number; longitude: number }) => {
    setFormData(prev => ({ ...prev, coordinates }));
    if (errors.coordinates) {
      setErrors(prev => ({ ...prev, coordinates: '' }));
    }
  };

  const handleAdministrativeDivisionChange = (location: {
    stateId: string;
    municipalityId: string;
    parishId: string;
    stateName: string;
    municipalityName: string;
    parishName: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      stateRef: location.stateId,
      municipalityRef: location.municipalityId,
      parishRef: location.parishId
    }));
    
    if (errors.administrativeDivision) {
      setErrors(prev => ({ ...prev, administrativeDivision: '' }));
    }
  };

  const handleSocialMediaChange = (platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <AdminCard
        title={isEditing ? t('branches.form.editTitle') : t('branches.form.title')}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-[#FFC300]" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? t('branches.form.editTitle') : t('branches.form.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminInput
              label={t('branches.form.name')}
              placeholder={t('branches.form.namePlaceholder')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />
            
            <AdminInput
              label={t('branches.form.phone')}
              placeholder="+58 412-123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              required
            />
          </div>

          <AdminInput
            label={t('branches.form.description')}
            placeholder={t('branches.form.descriptionPlaceholder')}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />

          {/* Dirección */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ubicación
            </h3>
            
            <AdminInput
              label={t('branches.form.address')}
              placeholder="Av. Principal, Edificio Centro"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label={t('branches.form.city')}
                placeholder="Caracas"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={errors.city}
                required
              />
              
              <AdminInput
                label={t('branches.form.zipCode')}
                placeholder="1010"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                required
              />
            </div>
          </div>

          {/* División Administrativa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#FFC300]" />
              {t('location.administrativeDivision')}
            </h3>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-[#444444]">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {t('location.administrativeDivisionHelp')}
                </p>
              </div>
              
              <AdministrativeDivisionSelector
                onLocationChange={handleAdministrativeDivisionChange}
                required={true}
                initialValues={{
                  stateId: formData.stateRef,
                  municipalityId: formData.municipalityRef,
                  parishId: formData.parishRef
                }}
              />
              
              {errors.administrativeDivision && (
                <div className="flex items-center text-red-600 dark:text-red-400 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{errors.administrativeDivision}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mapa de Ubicación GPS */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#FFC300]" />
              {t('location.gpsLocation')}
            </h3>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <FreeStoreLocationMap
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.coordinates}
                height="300px"
              />
            </div>
            
            {errors.coordinates && (
              <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{errors.coordinates}</span>
              </div>
            )}
            
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {t('location.mapHelp')}
            </p>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label={t('branches.form.email')}
                type="email"
                placeholder="sucursal@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
              />
              
              <AdminInput
                label={t('branches.form.website')}
                placeholder="https://www.ejemplo.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('socialMedia.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminInput
                label={t('socialMedia.facebook')}
                placeholder={t('socialMedia.facebookPlaceholder')}
                value={formData.socialMedia?.facebook || ''}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              />
              
              <AdminInput
                label={t('socialMedia.instagram')}
                placeholder={t('socialMedia.instagramPlaceholder')}
                value={formData.socialMedia?.instagram || ''}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              />
              
              <AdminInput
                label={t('socialMedia.twitter')}
                placeholder={t('socialMedia.twitterPlaceholder')}
                value={formData.socialMedia?.twitter || ''}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              />
              
              <AdminInput
                label={t('socialMedia.tiktok')}
                placeholder={t('socialMedia.tiktokPlaceholder')}
                value={formData.socialMedia?.tiktok || ''}
                onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
              />
            </div>
          </div>

          {/* Configuración de tienda principal */}
          {hasMainStore && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Configuración
              </h3>
              
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-[#444444] rounded-lg">
                <input
                  type="checkbox"
                  id="isMainStore"
                  checked={formData.isMainStore}
                  onChange={(e) => handleInputChange('isMainStore', e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="isMainStore" className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('branches.form.isMainStore')}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('branches.form.isMainStoreHelp')}
                  </p>
                </div>
              </div>
            </div>
          )}

                     {/* Error de envío */}
           {errors.submit && (
             <div className="flex items-center text-red-600 dark:text-red-400 text-sm mb-4">
               <AlertCircle className="h-4 w-4 mr-2" />
               <span>{errors.submit}</span>
             </div>
           )}

           {/* Botones de acción */}
           <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t('branches.form.cancel')}
            </AdminButton>
            
            <AdminButton
              type="submit"
              variant="primary"
              disabled={loading}
              icon={<Save className="w-4 h-4" />}
            >
              {loading ? 'Guardando...' : t('branches.form.save')}
            </AdminButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
};

export default BranchForm;
