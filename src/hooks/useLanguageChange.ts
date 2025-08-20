import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useLanguageChange = () => {
  const { currentLanguage } = useLanguage();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Reaccionar directamente a cambios en currentLanguage
  useEffect(() => {
    console.log('useLanguageChange - Language changed to:', currentLanguage);
    setForceUpdate(prev => prev + 1);
  }, [currentLanguage]);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('useLanguageChange - Language changed event received:', event.detail);
      setForceUpdate(prev => prev + 1);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'language') {
        console.log('useLanguageChange - Storage change event received for language');
        setForceUpdate(prev => prev + 1);
      }
    };

    // Escuchar eventos de cambio de idioma
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { currentLanguage, forceUpdate };
};
