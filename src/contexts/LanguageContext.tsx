import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translationService } from '../utils/translations';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  tWithParams: (key: string, params: Record<string, string>) => string;
  updateTrigger: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Inicializar el idioma desde localStorage y backend
  useEffect(() => {
    const loadLanguagePreferences = async () => {
      // Cargar desde localStorage primero
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        translationService.setLanguage(savedLanguage);
      }

      // Intentar cargar desde el backend si el usuario está autenticado
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { profileService } = await import('../services/profileService');
          const userProfile = await profileService.getProfile();
          if (userProfile.language) {
            setCurrentLanguage(userProfile.language);
            translationService.setLanguage(userProfile.language);
            localStorage.setItem('language', userProfile.language);
          }
        } catch (error) {
          console.log('No se pudo cargar preferencias del backend:', error);
        }
      }
    };

    loadLanguagePreferences();
  }, []);

  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    translationService.setLanguage(language);
    localStorage.setItem('language', language);
    
    // Forzar re-render de todos los componentes
    setUpdateTrigger(prev => prev + 1);
    
    // Disparar eventos para compatibilidad
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
    window.dispatchEvent(new Event('storage'));
    
    // Sincronizar con el backend si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { profileService } = await import('../services/profileService');
        await profileService.updatePreferences({
          theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light',
          language: language
        });
      } catch (error) {
        console.error('Error syncing language with backend:', error);
      }
    }
  };

  const t = (key: string): string => {
    // Asegurar que el servicio de traducción tenga el idioma correcto
    translationService.setLanguage(currentLanguage);
    return translationService.t(key);
  };

  const tWithParams = (key: string, params: Record<string, string>): string => {
    return translationService.tWithParams(key, params);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    tWithParams,
    updateTrigger
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
