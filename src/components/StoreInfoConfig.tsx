import React, { useState, useEffect } from 'react';
import {
  Save,
  Edit,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Clock,
  Upload,
  X,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StoreInfo {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  ruc?: string;
  description?: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

interface StoreInfoConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (storeInfo: StoreInfo) => void;
}

const StoreInfoConfig: React.FC<StoreInfoConfigProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    _id: 'store1',
    name: 'PiezasYA - Repuestos Automotrices',
    address: 'Av. Principal 123, Caracas, Venezuela',
    phone: '+58 212-1234567',
    email: 'ventas@piezasy.com',
    website: 'www.piezasy.com',
    logo: '/logo-piezasya.png',
    ruc: 'J-12345678-9',
    description: 'Repuestos Automotrices de Calidad',
    businessHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 6:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '8:00 AM - 2:00 PM',
      sunday: 'Cerrado'
    },
    socialMedia: {
      facebook: 'PiezasYA',
      instagram: '@piezasy',
      whatsapp: '+58 212-1234567'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'hours' | 'social'>('basic');

  // Cargar información de la tienda al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadStoreInfo();
    }
  }, [isOpen]);

  // Cargar información de la tienda
  const loadStoreInfo = async () => {
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      // Los datos ya están en el estado inicial
    } catch (error) {
      console.error('Error loading store info:', error);
    }
  };

  // Guardar información de la tienda
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(storeInfo);
      onClose();
    } catch (error) {
      console.error('Error saving store info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Actualizar información básica
  const updateBasicInfo = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  // Actualizar horarios de atención
  const updateBusinessHours = (day: keyof StoreInfo['businessHours'], value: string) => {
    setStoreInfo(prev => ({
      ...prev,
      businessHours: { ...prev.businessHours, [day]: value }
    }));
  };

  // Actualizar redes sociales
  const updateSocialMedia = (platform: keyof StoreInfo['socialMedia'], value: string) => {
    setStoreInfo(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
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
                {t('quotes.storeConfig.title') || 'Configuración de la Tienda'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('quotes.storeConfig.subtitle') || 'Personaliza la información que aparece en las cotizaciones'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-[#FFC300] text-[#FFC300]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              {t('quotes.storeConfig.basicInfo') || 'Información Básica'}
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'hours'
                  ? 'border-[#FFC300] text-[#FFC300]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              {t('quotes.storeConfig.businessHours') || 'Horarios'}
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'social'
                  ? 'border-[#FFC300] text-[#FFC300]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              {t('quotes.storeConfig.socialMedia') || 'Redes Sociales'}
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información Básica */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('quotes.storeConfig.storeName') || 'Nombre de la Tienda'}
                  </label>
                  <input
                    type="text"
                    value={storeInfo.name}
                    onChange={(e) => updateBasicInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder={t('quotes.storeConfig.storeNamePlaceholder') || 'Ej: PiezasYA - Repuestos Automotrices'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('quotes.storeConfig.ruc') || 'RUC'}
                  </label>
                  <input
                    type="text"
                    value={storeInfo.ruc || ''}
                    onChange={(e) => updateBasicInfo('ruc', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="J-12345678-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quotes.storeConfig.description') || 'Descripción'}
                </label>
                <textarea
                  value={storeInfo.description || ''}
                  onChange={(e) => updateBasicInfo('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                  rows={3}
                  placeholder={t('quotes.storeConfig.descriptionPlaceholder') || 'Breve descripción de la tienda...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quotes.storeConfig.address') || 'Dirección'}
                </label>
                <input
                  type="text"
                  value={storeInfo.address}
                  onChange={(e) => updateBasicInfo('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                  placeholder={t('quotes.storeConfig.addressPlaceholder') || 'Av. Principal 123, Ciudad, País'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('quotes.storeConfig.phone') || 'Teléfono'}
                  </label>
                  <input
                    type="text"
                    value={storeInfo.phone}
                    onChange={(e) => updateBasicInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="+58 212-1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('quotes.storeConfig.email') || 'Email'}
                  </label>
                  <input
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => updateBasicInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="ventas@piezasy.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quotes.storeConfig.website') || 'Sitio Web'}
                </label>
                <input
                  type="url"
                  value={storeInfo.website || ''}
                  onChange={(e) => updateBasicInfo('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                  placeholder="www.piezasy.com"
                />
              </div>
            </div>
          )}

          {/* Horarios de Atención */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('quotes.storeConfig.hoursInfo') || 'Los horarios de atención aparecerán en las cotizaciones para que los clientes sepan cuándo pueden contactarte.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(storeInfo.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-3">
                    <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {t(`quotes.storeConfig.days.${day}`) || day}
                    </div>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => updateBusinessHours(day as keyof StoreInfo['businessHours'], e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                      placeholder="8:00 AM - 6:00 PM"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Redes Sociales */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {t('quotes.storeConfig.socialInfo') || 'Las redes sociales ayudan a los clientes a conectarse contigo y conocer más sobre tu tienda.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={storeInfo.socialMedia?.facebook || ''}
                    onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="PiezasYA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={storeInfo.socialMedia?.instagram || ''}
                    onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="@piezasy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={storeInfo.socialMedia?.whatsapp || ''}
                    onChange={(e) => updateSocialMedia('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#666666] text-gray-900 dark:text-white rounded-lg"
                    placeholder="+58 212-1234567"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-[#444444]">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              {t('quotes.storeConfig.cancel') || 'Cancelar'}
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
              <span>{t('quotes.storeConfig.save') || 'Guardar Configuración'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreInfoConfig;
