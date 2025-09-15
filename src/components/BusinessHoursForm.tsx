import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AdminCard, AdminButton, AdminInput } from './ui';
import { X, Save, Clock, Calendar } from 'lucide-react';

interface BusinessHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

interface BusinessHoursFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hours: BusinessHours) => Promise<void>;
  initialHours?: BusinessHours;
  storeName?: string;
}

const BusinessHoursForm: React.FC<BusinessHoursFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialHours,
  storeName
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '08:00', close: '18:00', isOpen: true },
    tuesday: { open: '08:00', close: '18:00', isOpen: true },
    wednesday: { open: '08:00', close: '18:00', isOpen: true },
    thursday: { open: '08:00', close: '18:00', isOpen: true },
    friday: { open: '08:00', close: '18:00', isOpen: true },
    saturday: { open: '08:00', close: '14:00', isOpen: true },
    sunday: { open: '08:00', close: '14:00', isOpen: false }
  });

  const days = [
    { key: 'monday', label: t('businessHours.monday') },
    { key: 'tuesday', label: t('businessHours.tuesday') },
    { key: 'wednesday', label: t('businessHours.wednesday') },
    { key: 'thursday', label: t('businessHours.thursday') },
    { key: 'friday', label: t('businessHours.friday') },
    { key: 'saturday', label: t('businessHours.saturday') },
    { key: 'sunday', label: t('businessHours.sunday') }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    if (initialHours) {
      setBusinessHours(initialHours);
    }
  }, [initialHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(businessHours);
      onClose();
    } catch (error) {
      console.error('Error submitting business hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof BusinessHours],
        [field]: value
      }
    }));
  };

  const handleQuickSet = (template: 'weekdays' | 'weekend' | 'all') => {
    const newHours = { ...businessHours };
    
    if (template === 'weekdays') {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        newHours[day as keyof BusinessHours] = { open: '08:00', close: '18:00', isOpen: true };
      });
      ['saturday', 'sunday'].forEach(day => {
        newHours[day as keyof BusinessHours] = { open: '08:00', close: '14:00', isOpen: false };
      });
    } else if (template === 'weekend') {
      ['saturday', 'sunday'].forEach(day => {
        newHours[day as keyof BusinessHours] = { open: '09:00', close: '17:00', isOpen: true };
      });
    } else if (template === 'all') {
      Object.keys(newHours).forEach(day => {
        newHours[day as keyof BusinessHours] = { open: '08:00', close: '18:00', isOpen: true };
      });
    }
    
    setBusinessHours(newHours);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <AdminCard
        title={t('businessHours.title')}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-[#FFC300]" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('businessHours.title')} {storeName && `- ${storeName}`}
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
          {/* Plantillas rápidas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('businessHours.quickTemplates')}
            </h3>
            <div className="flex flex-wrap gap-2">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickSet('weekdays')}
              >
                {t('businessHours.templates.weekdays')}
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickSet('weekend')}
              >
                {t('businessHours.templates.weekend')}
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleQuickSet('all')}
              >
                {t('businessHours.templates.all')}
              </AdminButton>
            </div>
          </div>

          {/* Horarios por día */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('businessHours.dailySchedule')}
            </h3>
            
            <div className="space-y-4">
              {days.map(({ key, label }) => {
                const dayHours = businessHours[key as keyof BusinessHours];
                
                return (
                  <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={dayHours.isOpen}
                          onChange={(e) => handleDayChange(key, 'isOpen', e.target.checked)}
                          className="h-4 w-4 text-[#FFC300] focus:ring-[#FFC300] border-gray-300 rounded"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {label}
                        </span>
                      </label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        dayHours.isOpen 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {dayHours.isOpen ? t('businessHours.open') : t('businessHours.closed')}
                      </span>
                    </div>
                    
                    {dayHours.isOpen && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('businessHours.openTime')}
                          </label>
                          <input
                            type="time"
                            value={dayHours.open}
                            onChange={(e) => handleDayChange(key, 'open', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#444444] text-gray-900 dark:text-white focus:ring-[#FFC300] focus:border-[#FFC300]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('businessHours.closeTime')}
                          </label>
                          <input
                            type="time"
                            value={dayHours.close}
                            onChange={(e) => handleDayChange(key, 'close', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#444444] text-gray-900 dark:text-white focus:ring-[#FFC300] focus:border-[#FFC300]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex">
              <Calendar className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">{t('businessHours.info.title')}</p>
                <p className="mt-1">{t('businessHours.info.description')}</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t('businessHours.cancel')}
            </AdminButton>
            
            <AdminButton
              type="submit"
              variant="primary"
              disabled={loading}
              icon={<Save className="w-4 h-4" />}
            >
              {loading ? t('businessHours.saving') : t('businessHours.save')}
            </AdminButton>
          </div>
        </form>
      </AdminCard>
    </div>
  );
};

export default BusinessHoursForm;
