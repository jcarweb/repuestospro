import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const StoreManagerSales: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('storeManagerSales.title')}</h1>
      <p className="text-gray-600 mt-2">{t('storeManagerSales.subtitle')}</p>
      <div className="mt-8 text-center">
        <p className="text-gray-500">{t('storeManagerSales.development')}</p>
      </div>
    </div>
  );
};

export default StoreManagerSales;
