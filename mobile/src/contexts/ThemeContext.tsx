import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paleta de colores corporativos de PiezasYA
export const COLORS = {
  // Tema Claro
  light: {
    // Fondos
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    
    // Textos
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Bordes
    border: '#D1D5DB',
    borderSecondary: '#E5E7EB',
    
    // Acentos
    primary: '#FFC300', // Amarillo Racing
    primaryDark: '#E6B800',
    
    // Estados
    success: '#10B981',
    error: '#E63946',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // Tema Oscuro (estilo Binance)
  dark: {
    // Fondos
    background: '#1A1A1A', // Fondo principal oscuro
    surface: '#2D2D2D', // Superficies de tarjetas
    surfaceSecondary: '#404040', // Superficies secundarias
    
    // Textos
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E5E5',
    textTertiary: '#A3A3A3',
    
    // Bordes
    border: '#404040',
    borderSecondary: '#525252',
    
    // Acentos
    primary: '#FFC300', // Amarillo Racing (mantiene el color corporativo)
    primaryDark: '#E6B800',
    
    // Estados
    success: '#10B981',
    error: '#E63946',
    warning: '#F59E0B',
    info: '#3B82F6',
  }
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof COLORS.light;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark'); // Por defecto tema oscuro
  const [isLoading, setIsLoading] = useState(true);

  // Cargar tema guardado al iniciar
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = COLORS[theme];

  const value: ThemeContextType = {
    theme,
    colors,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  if (isLoading) {
    // Mostrar pantalla de carga con el tema oscuro
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: COLORS.dark.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={COLORS.dark.primary} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
