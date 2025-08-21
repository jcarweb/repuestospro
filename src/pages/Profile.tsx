import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Activity, 
  Navigation,
  Upload,
  Trash2
} from 'lucide-react';
import ActivityHistory from '../components/ActivityHistory';
import WorkingLocationMap from '../components/WorkingLocationMap';
import RateLimitModal from '../components/RateLimitModal';
import AvatarImageSimple from '../components/AvatarImageSimple';
import { useLayoutContext } from '../hooks/useLayoutContext';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../services/profileService';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { containerClasses, contentClasses } = useLayoutContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [showActivityHistory, setShowActivityHistory] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [shouldReloadProfile, setShouldReloadProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | undefined>(undefined);

  // Cargar perfil del usuario
  useEffect(() => {
    console.log('Profile - useEffect ejecutándose, shouldReloadProfile:', shouldReloadProfile);
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await profileService.getProfile();
        console.log('Profile - Perfil cargado, avatar:', userProfile.avatar);
        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: ''
        });

        // Cargar ubicación del usuario si existe - con validación más robusta
        try {
          if (userProfile.location && 
              userProfile.location.coordinates && 
              Array.isArray(userProfile.location.coordinates) &&
              userProfile.location.coordinates.length >= 2) {
            
            const lat = userProfile.location.coordinates[1];
            const lng = userProfile.location.coordinates[0];
            
            if (typeof lat === 'number' && 
                typeof lng === 'number' &&
                !isNaN(lat) && 
                !isNaN(lng) &&
                lat >= -90 && lat <= 90 &&
                lng >= -180 && lng <= 180) {
              
              setUserLocation({
                latitude: lat,
                longitude: lng,
                address: t('profile.savedLocation')
              });
            }
          }
        } catch (locationError) {
          console.warn('Error loading location:', locationError);
          // No mostrar error al usuario por problemas de ubicación
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        
        // Manejar específicamente errores de rate limiting
        if (error.response?.status === 429) {
          setShowRateLimitModal(true);
          // Intentar extraer el tiempo de retry del header
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            setRateLimitRetryAfter(parseInt(retryAfter));
          }
        } else {
          setMessage({ type: 'error', text: t('profile.errorLoading') });
        }
      } finally {
        setLoading(false);
        setShouldReloadProfile(false); // Reset después de cargar
      }
    };

    loadProfile();
  }, [shouldReloadProfile]); // Solo recargar cuando shouldReloadProfile cambie

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await profileService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      
              setMessage({ type: 'success', text: result.message });
        setIsEditing(false);
        
        // Recargar perfil
        const userProfile = await profileService.getProfile();
        setProfile(userProfile);
      } catch (error: any) {
        console.error('Error updating profile:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.message || t('profile.errorUpdating')
        });
      } finally {
        setLoading(false);
      }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        address: ''
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  // Manejar selección de archivo para avatar
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  // Subir avatar
  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      setMessage(null);

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: t('profile.invalidImageType') });
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: t('profile.imageTooLarge') });
        return;
      }

      const result = await profileService.uploadAvatar(file);
      
      setMessage({ type: 'success', text: result.message });
      
      // Recargar perfil inmediatamente sin delay
      console.log('Profile - Avatar subido, resultado:', result);
      setShouldReloadProfile(true);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      
      // Manejar específicamente errores de rate limiting
      if (error.response?.status === 429) {
        setShowRateLimitModal(true);
        // Intentar extraer el tiempo de retry del header
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          setRateLimitRetryAfter(parseInt(retryAfter));
        }
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || t('profile.errorUploadingAvatar')
        });
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Eliminar avatar
  const handleAvatarDelete = async () => {
    try {
      setUploadingAvatar(true);
      setMessage(null);

      const result = await profileService.deleteAvatar();
      setMessage({ type: 'success', text: result.message });
      
      // Recargar perfil inmediatamente sin delay
      setShouldReloadProfile(true);
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      
      // Manejar específicamente errores de rate limiting
      if (error.response?.status === 429) {
        setShowRateLimitModal(true);
        // Intentar extraer el tiempo de retry del header
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          setRateLimitRetryAfter(parseInt(retryAfter));
        }
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || t('profile.errorDeletingAvatar')
        });
      }
    } finally {
      setUploadingAvatar(false);
    }
  };



  // Manejar selección de ubicación
  const handleLocationSelect = async (location: { latitude: number; longitude: number; address: string }) => {
    try {
      setUserLocation(location);
      setShowLocationMap(false);
      
      // Guardar la ubicación en el backend
      await profileService.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        enabled: true
      });
      
             setMessage({ type: 'success', text: t('profile.locationUpdated') });
    } catch (error) {
      console.error('Error saving location:', error);
      setMessage({ type: 'error', text: t('profile.errorSavingLocation') });
    }
  };



  if (loading && !profile) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">{t('profile.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Información Personal */}
        <div className="bg-white shadow rounded-lg mb-6">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                             <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                                     <span>{t('profile.edit')}</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('profile.save')}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    <span>{t('profile.cancel')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Avatar Display */}
              <div className="relative">
                <AvatarImageSimple
                  key={profile?.avatar || 'default'} // Forzar re-render cuando cambie el avatar
                  avatar={profile?.avatar}
                  alt={t('profile.avatar')}
                  size="md"
                />
                
                {/* Loading overlay */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Avatar Actions */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('profile.avatar')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('profile.avatarDescription')}
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('profile.uploadAvatar')}</span>
                  </button>
                  
                  {profile?.avatar && profile.avatar !== '/uploads/perfil/default-avatar.svg' && (
                    <button
                      onClick={handleAvatarDelete}
                      disabled={uploadingAvatar}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('profile.deleteAvatar')}</span>
                    </button>
                  )}
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {t('profile.name')}
                 </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {t('profile.email')}
                 </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {t('profile.phone')}
                 </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="+57 300 123 4567"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {t('profile.address')}
                 </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Calle 123 # 45-67"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Ubicación */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-gray-600" />
                                 <h2 className="text-lg font-semibold text-gray-900">{t('profile.location')}</h2>
              </div>
              <button
                onClick={() => setShowLocationMap(!showLocationMap)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                                 {showLocationMap ? t('common.hide') : t('profile.configureLocation')}
              </button>
            </div>
          </div>
          
          {showLocationMap ? (
                         <div className="px-6 py-4">
               <WorkingLocationMap
                 onLocationSelect={handleLocationSelect}
                 height="400px"
               />
             </div>
          ) : (
            <div className="px-6 py-4">
              {userLocation ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                                             <h4 className="font-medium text-blue-900 mb-1">{t('profile.configuredLocation')}:</h4>
                      <p className="text-sm text-blue-800 mb-2">{userLocation.address}</p>
                      <div className="text-xs text-blue-600">
                                                 {t('profile.coordinates')}: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                     <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.noLocationConfigured')}</h3>
                   <p className="text-gray-500 mb-4">
                     {t('profile.locationDescription')}
                   </p>
                   <button
                     onClick={() => setShowLocationMap(true)}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                   >
                     {t('profile.configureLocation')}
                   </button>
                </div>
              )}
            </div>
          )}
        </div>



        {/* Activity History Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                                 <h2 className="text-lg font-semibold text-gray-900">{t('profile.activityHistory')}</h2>
              </div>
              <button
                onClick={() => setShowActivityHistory(!showActivityHistory)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                                 {showActivityHistory ? t('common.hide') : t('profile.viewHistory')}
              </button>
            </div>
          </div>
          
          {showActivityHistory && (
            <div className="px-6 py-4">
              <ActivityHistory />
            </div>
          )}
        </div>

        {/* Rate Limit Modal */}
        <RateLimitModal
          isOpen={showRateLimitModal}
          onClose={() => {
            setShowRateLimitModal(false);
            setRateLimitRetryAfter(undefined);
          }}
          retryAfter={rateLimitRetryAfter}
        />

      </div>
    </div>
  );
};

export default Profile; 