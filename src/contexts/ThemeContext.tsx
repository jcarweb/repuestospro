import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService } from '../services/profileService';
import { translationService } from '../utils/translations';

interface ThemeContextType {
  theme: 'light' | 'dark';
  language: 'es' | 'en' | 'pt';
  toggleTheme: () => void;
  setLanguage: (language: 'es' | 'en' | 'pt') => void;
  isDark: boolean;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<'es' | 'en' | 'pt'>('es');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuración desde localStorage y backend al inicializar
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        // Cargar desde localStorage primero (para evitar parpadeo)
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        const savedLanguage = localStorage.getItem('language') as 'es' | 'en' | 'pt';
        
        if (savedTheme) {
          setTheme(savedTheme);
        }
        if (savedLanguage) {
          setLanguageState(savedLanguage);
          translationService.setLanguage(savedLanguage);
        }

        // Intentar cargar desde el backend si el usuario está autenticado
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userProfile = await profileService.getProfile();
            if (userProfile.theme) {
              setTheme(userProfile.theme);
              localStorage.setItem('theme', userProfile.theme);
            }
            if (userProfile.language) {
              setLanguageState(userProfile.language);
              translationService.setLanguage(userProfile.language);
              localStorage.setItem('language', userProfile.language);
            }
          } catch (error) {
            console.log('No se pudo cargar preferencias del backend:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Guardar idioma en localStorage y actualizar servicio de traducciones
  useEffect(() => {
    localStorage.setItem('language', language);
    translationService.setLanguage(language);
  }, [language]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Sincronizar con el backend si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await profileService.updatePreferences({
          theme: newTheme,
          language: language
        });
      } catch (error) {
        console.error('Error syncing theme with backend:', error);
      }
    }
  };

  const setLanguage = async (newLanguage: 'es' | 'en' | 'pt') => {
    setLanguageState(newLanguage);
    translationService.setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Disparar eventos para notificar el cambio de idioma
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
    window.dispatchEvent(new Event('storage'));
    
    // Sincronizar con el backend si el usuario está autenticado
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await profileService.updatePreferences({
          theme: theme,
          language: newLanguage
        });
      } catch (error) {
        console.error('Error syncing language with backend:', error);
      }
    }
  };

  const value: ThemeContextType = {
    theme,
    language,
    toggleTheme,
    setLanguage,
    isDark: theme === 'dark',
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
