import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Building,
  Calendar,
  Hash,
  Star,
  Award,
  Shield,
  CheckCircle
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

interface SellerInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'seller' | 'store_manager';
  avatar?: string;
  employeeId?: string;
  department?: string;
  signature?: string;
}

interface StoreSellerInfoProps {
  storeInfo: StoreInfo;
  sellerInfo: SellerInfo;
  quoteNumber: string;
  quoteDate: string;
  className?: string;
}

const StoreSellerInfo: React.FC<StoreSellerInfoProps> = ({ 
  storeInfo, 
  sellerInfo, 
  quoteNumber, 
  quoteDate,
  className = ""
}) => {
  const { t } = useLanguage();

  return (
    <div className={`bg-white dark:bg-[#444444] rounded-lg border border-gray-200 dark:border-gray-600 ${className}`}>
      {/* Header con logo y datos de la tienda */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo de la tienda */}
            <div className="w-16 h-16 bg-[#FFC300] rounded-lg flex items-center justify-center">
              {storeInfo.logo ? (
                <img 
                  src={storeInfo.logo} 
                  alt={storeInfo.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building className="w-8 h-8 text-[#333333]" />
              )}
            </div>
            
            {/* Información de la tienda */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {storeInfo.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {storeInfo.description || t('quotes.storeInfo.description') || 'Repuestos Automotrices de Calidad'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-[#FFC300]" />
                  <span>{storeInfo.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 text-[#FFC300]" />
                  <span>{storeInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-[#FFC300]" />
                  <span>{storeInfo.email}</span>
                </div>
                {storeInfo.ruc && (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3 text-[#FFC300]" />
                    <span>RUC: {storeInfo.ruc}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Información de la cotización */}
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {t('quotes.quoteNumber') || 'Cotización N°'}
            </div>
            <div className="text-lg font-bold text-[#FFC300] mb-1">
              {quoteNumber}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('quotes.quoteDate') || 'Fecha'}: {new Date(quoteDate).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      </div>

      {/* Información del vendedor/gestor */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar del vendedor */}
            <div className="w-12 h-12 bg-gray-100 dark:bg-[#555555] rounded-full flex items-center justify-center">
              {sellerInfo.avatar ? (
                <img 
                  src={sellerInfo.avatar} 
                  alt={sellerInfo.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            
            {/* Información del vendedor */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {sellerInfo.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sellerInfo.role === 'store_manager' 
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}>
                  {sellerInfo.role === 'store_manager' 
                    ? t('quotes.sellerInfo.manager') || 'Gestor de Tienda'
                    : t('quotes.sellerInfo.seller') || 'Vendedor'
                  }
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span>{sellerInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>{sellerInfo.phone}</span>
                </div>
                {sellerInfo.employeeId && (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3" />
                    <span>{t('quotes.sellerInfo.employeeId') || 'ID Empleado'}: {sellerInfo.employeeId}</span>
                  </div>
                )}
                {sellerInfo.department && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-3 h-3" />
                    <span>{sellerInfo.department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="text-right text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="w-3 h-3" />
              <span>{t('quotes.sellerInfo.attendedBy') || 'Atendido por'}</span>
            </div>
            <div className="text-xs">
              {new Date().toLocaleString('es-ES')}
            </div>
          </div>
        </div>
      </div>

      {/* Horarios de atención (opcional, solo si es relevante) */}
      <div className="px-6 pb-4">
        <div className="bg-gray-50 dark:bg-[#555555] rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t('quotes.storeInfo.businessHours') || 'Horarios de Atención'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Lun: {storeInfo.businessHours.monday}</div>
            <div>Mar: {storeInfo.businessHours.tuesday}</div>
            <div>Mié: {storeInfo.businessHours.wednesday}</div>
            <div>Jue: {storeInfo.businessHours.thursday}</div>
            <div>Vie: {storeInfo.businessHours.friday}</div>
            <div>Sáb: {storeInfo.businessHours.saturday}</div>
            <div>Dom: {storeInfo.businessHours.sunday}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSellerInfo;
